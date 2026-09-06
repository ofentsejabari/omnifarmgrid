import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { animalLabel } from '../../core/models/animal';
import { deathReasonLabel, eventTypeIcon, eventTypeLabel, DeathReason } from '../../core/models/event';
import {
  AnimalSex,
  animalSexLabel,
  animalStatusClass,
  animalStatusLabel,
  speciesAvatarClass,
  speciesBadgeClass,
  speciesVocabulary,
  speciesIconClass,
  Species,
} from '../../core/models/species';
import { AnimalStore } from '../../core/stores/animal.store';
import { EventStore } from '../../core/stores/event.store';
import { InventoryStore } from '../../core/stores/inventory.store';
import { KraalStore } from '../../core/stores/kraal.store';
import { todayIsoDate } from '../../core/utils/dates';
import { SpartanUiImports } from '../../core/utils/spartan-ui-imports';

@Component({
  selector: 'fma-animal-detail',
  imports: [FormsModule, RouterLink, ...SpartanUiImports],
  templateUrl: './animal-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnimalDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly animalStore = inject(AnimalStore);
  private readonly eventStore = inject(EventStore);
  protected readonly kraalStore = inject(KraalStore);
  private readonly inventoryStore = inject(InventoryStore);

  private readonly animalId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id') ?? '')),
    {
      initialValue: this.route.snapshot.paramMap.get('id') ?? '',
    },
  );
  protected readonly animal = computed(() =>
    this.animalStore.animals().find((item) => item.$id === this.animalId()),
  );
  protected readonly history = computed(() => this.eventStore.forAnimal(this.animalId() ?? ''));
  protected readonly dam = computed(() => {
    const damId = this.animal()?.damId;
    return damId ? this.animalStore.animals().find((item) => item.$id === damId) : undefined;
  });
  protected readonly offspring = computed(() =>
    this.animalStore.animals().filter((item) => item.damId === this.animalId()),
  );
  protected readonly moveKraalId = signal('');
  protected readonly moveError = signal('');
  protected readonly vocabulary = speciesVocabulary;
  protected readonly badgeClass = speciesBadgeClass;
  protected readonly iconClass = speciesIconClass;
  protected readonly avatarClass = speciesAvatarClass;
  protected readonly statusClass = animalStatusClass;
  protected readonly statusLabel = animalStatusLabel;

  protected label = animalLabel;
  protected eventLabel = eventTypeLabel;
  protected eventIcon = eventTypeIcon;

  protected sexLabel(species: Species, sex: AnimalSex): string {
    return animalSexLabel(species, sex);
  }

  protected deathLabel(reason: DeathReason, species?: Species): string {
    return deathReasonLabel(reason, species);
  }

  protected matchingKraals() {
    const animal = this.animal();
    return this.kraalStore
      .kraals()
      .filter((kraal) => !animal || kraal.species === animal.species);
  }

  protected kraalName(kraalId: string): string {
    return this.kraalStore.kraals().find((kraal) => kraal.$id === kraalId)?.name ?? 'Unknown kraal';
  }

  protected productName(productId: string): string {
    return this.inventoryStore.products().find((product) => product.$id === productId)?.name ?? '';
  }

  protected async move(): Promise<void> {
    const animal = this.animal();
    if (!animal || !this.moveKraalId()) {
      return;
    }
    this.moveError.set('');
    try {
      await this.animalStore.moveToKraal(animal.$id, this.moveKraalId(), todayIsoDate(), '');
      this.moveKraalId.set('');
    } catch (error: unknown) {
      this.moveError.set(
        error instanceof Error
          ? error.message
          : `Could not move this ${speciesVocabulary(animal.species).noun}.`,
      );
    }
  }
}
