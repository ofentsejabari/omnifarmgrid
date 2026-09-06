import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { animalLabel } from '../../core/models/animal';
import { EXCLUSION_REASONS } from '../../core/models/event';
import { speciesVocabulary } from '../../core/models/species';
import { AnimalStore } from '../../core/stores/animal.store';
import { InventoryStore } from '../../core/stores/inventory.store';
import { KraalStore } from '../../core/stores/kraal.store';
import { InsufficientStockError } from '../../core/utils/errors';
import { VaccinationStore } from '../../core/stores/vaccination.store';
import { todayIsoDate } from '../../core/utils/dates';
import { SpartanUiImports } from '../../core/utils/spartan-ui-imports';

@Component({
  selector: 'fma-vaccinate-kraal',
  imports: [FormsModule, RouterLink, ...SpartanUiImports],
  templateUrl: './vaccinate-kraal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VaccinateKraalComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly kraalStore = inject(KraalStore);
  private readonly animalStore = inject(AnimalStore);
  protected readonly inventoryStore = inject(InventoryStore);
  private readonly vaccinationStore = inject(VaccinationStore);

  private readonly kraalId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id') ?? '')),
    {
      initialValue: this.route.snapshot.paramMap.get('id') ?? '',
    },
  );
  protected readonly exclusionReasons = EXCLUSION_REASONS;
  protected readonly label = animalLabel;
  protected readonly vocabulary = speciesVocabulary;
  protected readonly error = signal('');
  protected readonly productId = signal('');
  protected readonly batchId = signal('');
  protected readonly date = signal(todayIsoDate());
  protected readonly notes = signal('');
  protected readonly selectedIds = signal<Set<string>>(new Set());
  protected readonly reasons = signal<Record<string, string>>({});
  protected readonly selectionReady = signal(false);
  protected readonly kraal = computed(() =>
    this.kraalStore.kraals().find((item) => item.$id === this.kraalId()),
  );
  protected readonly animals = computed(() =>
    this.animalStore
      .animals()
      .filter((animal) => animal.kraalId === this.kraalId() && animal.status === 'alive')
      .sort((left, right) => left.tag.localeCompare(right.tag)),
  );
  protected readonly batches = computed(() => this.inventoryStore.usableBatches(this.productId()));
  protected readonly treatedCount = computed(() => this.selectedIds().size);

  constructor() {
    effect(() => {
      const animals = this.animals();
      if (!this.selectionReady() && animals.length > 0) {
        this.selectedIds.set(new Set(animals.map((animal) => animal.$id)));
        this.selectionReady.set(true);
      }
    });
  }

  protected placeLabel(): string {
    const kraal = this.kraal();
    return kraal ? speciesVocabulary(kraal.species).location : 'kraal';
  }

  protected isSelected(animalId: string): boolean {
    return this.selectedIds().has(animalId);
  }

  protected toggle(animalId: string, checked: boolean): void {
    this.ensureSelection();
    const next = new Set(this.selectedIds());
    if (checked) {
      next.add(animalId);
    } else {
      next.delete(animalId);
    }
    this.selectedIds.set(next);
  }

  protected setReason(animalId: string, reason: string): void {
    this.reasons.update((current) => ({ ...current, [animalId]: reason }));
  }

  protected reasonFor(animalId: string): string {
    return this.reasons()[animalId] ?? '';
  }

  private ensureSelection(): void {
    if (this.selectionReady()) {
      return;
    }
    this.selectedIds.set(new Set(this.animals().map((animal) => animal.$id)));
    this.selectionReady.set(true);
  }

  protected selectAllDefault(): void {
    this.selectedIds.set(new Set(this.animals().map((animal) => animal.$id)));
    this.selectionReady.set(true);
  }

  protected async save(): Promise<void> {
    this.ensureSelection();
    this.error.set('');
    const kraalId = this.kraalId();
    if (!kraalId || !this.productId() || !this.batchId()) {
      this.error.set('Choose a product and a usable batch.');
      return;
    }
    const treatedAnimalIds = [...this.selectedIds()];
    const excludedAnimalIds = this.animals()
      .map((animal) => animal.$id)
      .filter((id) => !this.selectedIds().has(id));
    try {
      await this.vaccinationStore.vaccinateKraal({
        kraalId,
        productId: this.productId(),
        batchId: this.batchId(),
        date: this.date(),
        treatedAnimalIds,
        excludedAnimalIds,
        exclusionReasons: this.reasons(),
        notes: this.notes(),
      });
      await this.router.navigate(['/kraals', kraalId]);
    } catch (error: unknown) {
      this.error.set(
        error instanceof InsufficientStockError ? error.message : 'Could not record vaccination.',
      );
    }
  }
}
