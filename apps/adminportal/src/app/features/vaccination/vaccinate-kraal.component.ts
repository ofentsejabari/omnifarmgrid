import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { animalLabel } from '../../core/models/animal';
import { EXCLUSION_REASONS } from '../../core/models/event';
import { speciesVocabulary } from '../../core/models/species';
import { AnimalStore } from '../../core/stores/animal.store';
import { InventoryStore } from '../../core/stores/inventory.store';
import { KraalStore } from '../../core/stores/kraal.store';
import { VaccinationStore } from '../../core/stores/vaccination.store';
import { ModalService } from '../../core/ui/modal.service';
import { ToastService } from '../../core/ui/toast.service';
import { todayIsoDate } from '../../core/utils/dates';
import { InsufficientStockError } from '../../core/utils/errors';
import { DateFieldComponent } from '../../core/ui/date-field.component';
import { SelectFieldComponent } from '../../core/ui/select-field.component';
import { SpartanUiImports } from '../../core/utils/spartan-ui-imports';

/** Popup: vaccinate everyone in a kraal, minus the exceptions. Params: `kraalId`. */
@Component({
  selector: 'fma-vaccinate-kraal',
  imports: [SelectFieldComponent, DateFieldComponent, ...SpartanUiImports],
  templateUrl: './vaccinate-kraal.component.html',
  host: { class: 'fma-modal' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VaccinateKraalComponent {
  protected readonly kraalStore = inject(KraalStore);
  protected readonly inventoryStore = inject(InventoryStore);
  private readonly animalStore = inject(AnimalStore);
  private readonly vaccinationStore = inject(VaccinationStore);
  private readonly toast = inject(ToastService);
  protected readonly modal = inject(ModalService);

  protected readonly reasonOptions = EXCLUSION_REASONS.map((reason) => ({
    value: reason,
    label: reason.charAt(0).toUpperCase() + reason.slice(1),
  }));
  protected readonly label = animalLabel;
  protected readonly error = signal('');
  protected readonly saving = signal(false);

  protected readonly kraalId = signal(
    inject(ActivatedRoute).snapshot.paramMap.get('kraalId') ?? '',
  );
  protected readonly productId = signal('');
  protected readonly batchId = signal('');
  protected readonly date = signal(todayIsoDate());
  private readonly skipped = signal<Set<string>>(new Set());
  protected readonly reasons = signal<Record<string, string>>({});

  private readonly kraal = computed(() =>
    this.kraalStore.kraals().find((item) => item.$id === this.kraalId()),
  );
  protected readonly words = computed(() =>
    speciesVocabulary(this.kraal()?.species ?? 'goat'),
  );
  protected readonly animals = computed(() =>
    this.animalStore
      .herd()
      .filter(
        (animal) =>
          animal.kraalId === this.kraalId() && animal.status === 'alive',
      )
      .sort((a, b) => a.tag.localeCompare(b.tag)),
  );
  protected readonly batches = computed(() =>
    this.inventoryStore.usableBatches(this.productId()),
  );
  protected readonly treatedCount = computed(
    () => this.animals().length - this.skipped().size,
  );

  protected readonly kraalOptions = computed(() =>
    this.kraalStore
      .kraals()
      .map((kraal) => ({ value: kraal.$id, label: kraal.name })),
  );
  protected readonly productOptions = computed(() =>
    this.inventoryStore
      .products()
      .map((product) => ({ value: product.$id, label: product.name })),
  );
  protected readonly batchOptions = computed(() =>
    this.batches().map((batch) => ({
      value: batch.$id,
      label: `${batch.batchNumber || 'No batch no.'} · ${batch.quantityOnHand} left`,
    })),
  );

  constructor() {
    // Pick the only usable batch automatically.
    effect(() => {
      const batches = this.batches();
      untracked(() =>
        this.batchId.set(batches.length === 1 ? batches[0].$id : ''),
      );
    });
  }

  protected selectKraal(id: string): void {
    this.kraalId.set(id);
    this.skipped.set(new Set());
    this.reasons.set({});
  }

  protected isSelected(animalId: string): boolean {
    return !this.skipped().has(animalId);
  }

  protected toggle(animalId: string, included: boolean): void {
    this.skipped.update((current) => {
      const next = new Set(current);
      if (included) {
        next.delete(animalId);
      } else {
        next.add(animalId);
      }
      return next;
    });
  }

  protected setReason(animalId: string, reason: string): void {
    this.reasons.update((current) => ({ ...current, [animalId]: reason }));
  }

  protected async save(): Promise<void> {
    this.error.set('');
    if (!this.kraalId() || !this.productId() || !this.batchId()) {
      this.error.set('Choose the kraal, a product and a batch with stock.');
      return;
    }
    const ids = this.animals().map((animal) => animal.$id);
    const skipped = this.skipped();
    this.saving.set(true);
    try {
      await this.vaccinationStore.vaccinateKraal({
        kraalId: this.kraalId(),
        productId: this.productId(),
        batchId: this.batchId(),
        date: this.date(),
        treatedAnimalIds: ids.filter((id) => !skipped.has(id)),
        excludedAnimalIds: ids.filter((id) => skipped.has(id)),
        exclusionReasons: this.reasons(),
        notes: '',
      });
      this.toast.show(`${this.treatedCount()} vaccinated`);
      await this.modal.close();
    } catch (error: unknown) {
      this.error.set(
        error instanceof InsufficientStockError
          ? error.message
          : 'Could not record the vaccination.',
      );
    } finally {
      this.saving.set(false);
    }
  }
}
