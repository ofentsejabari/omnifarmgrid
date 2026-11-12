import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { animalLabel, AnimalRow } from '../../core/models/animal';
import {
  deathReasonLabel,
  eventTypeIcon,
  eventTypeLabel,
  FlockEventRow,
} from '../../core/models/event';
import {
  animalSexLabel,
  animalStatusClass,
  animalStatusLabel,
  speciesVocabulary,
} from '../../core/models/species';
import { AnimalStore } from '../../core/stores/animal.store';
import { EventStore } from '../../core/stores/event.store';
import { InventoryStore } from '../../core/stores/inventory.store';
import { KraalStore } from '../../core/stores/kraal.store';
import { ModalService } from '../../core/ui/modal.service';
import { SelectFieldComponent } from '../../core/ui/select-field.component';
import { SpeciesAvatarComponent } from '../../core/ui/species-avatar.component';
import { ToastService } from '../../core/ui/toast.service';
import { friendlyDate, longDate, todayIsoDate } from '../../core/utils/dates';
import { SpartanUiImports } from '../../core/utils/spartan-ui-imports';
import {
  GuideStep,
  PageGuideComponent,
} from '../../core/ui/page-guide.component';

interface DetailRow {
  label: string;
  value: string;
  link?: unknown[];
}

@Component({
  selector: 'fma-animal-detail',
  imports: [
    PageGuideComponent,
    RouterLink,
    SpeciesAvatarComponent,
    SelectFieldComponent,
    ...SpartanUiImports,
  ],
  templateUrl: './animal-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnimalDetailComponent {
  protected readonly guideSteps = computed<GuideStep[]>(() => {
    const words = this.words();
    return [
      {
        icon: 'lucidePencil',
        title: 'Keep details current',
        text: 'Use Edit to fix the tag, breed, birth date or notes.',
      },
      {
        icon: 'lucideBaby',
        title: words.birthVerb,
        text: `For a ${words.dam}: her ${words.youngPlural} are linked to her and listed under Offspring.`,
        tone: 'bg-info text-info-foreground',
      },
      {
        icon: 'lucideMoveHorizontal',
        title: `Move ${words.location}`,
        text: `Changed ${words.location}? Pick the new one in the Move box.`,
        tone: 'bg-warning text-warning-foreground',
      },
      {
        icon: 'lucideHeartOff',
        title: 'Record a death',
        text: 'The record is kept, marked dead or culled, with its full history.',
        tone: 'bg-destructive/10 text-destructive',
      },
    ];
  });

  protected readonly animalStore = inject(AnimalStore);
  private readonly eventStore = inject(EventStore);
  private readonly kraalStore = inject(KraalStore);
  private readonly inventoryStore = inject(InventoryStore);
  private readonly toast = inject(ToastService);
  protected readonly modal = inject(ModalService);

  private readonly animalId = toSignal(
    inject(ActivatedRoute).paramMap.pipe(map((p) => p.get('id') ?? '')),
    {
      initialValue: '',
    },
  );

  protected readonly label = animalLabel;
  protected readonly statusClass = animalStatusClass;
  protected readonly statusLabel = animalStatusLabel;
  protected readonly eventLabel = eventTypeLabel;
  protected readonly eventIcon = eventTypeIcon;
  protected readonly when = friendlyDate;
  protected readonly moveTo = signal('');
  protected readonly moveError = signal('');

  protected readonly animal = computed(() => this.find(this.animalId()));
  protected readonly words = computed(() =>
    speciesVocabulary(this.animal()?.species ?? 'goat'),
  );
  protected readonly history = computed(() =>
    this.eventStore.forAnimal(this.animalId()),
  );
  protected readonly offspring = computed(() =>
    this.animalStore.herd().filter((item) => item.damId === this.animalId()),
  );
  protected readonly moveOptions = computed(() => {
    const animal = this.animal();
    return this.kraalStore
      .kraals()
      .filter(
        (kraal) =>
          animal &&
          kraal.species === animal.species &&
          kraal.$id !== animal.kraalId,
      );
  });

  protected readonly moveSelectOptions = computed(() =>
    this.moveOptions().map((kraal) => ({
      value: kraal.$id,
      label: kraal.name,
    })),
  );

  protected readonly details = computed<DetailRow[]>(() => {
    const animal = this.animal();
    if (!animal) {
      return [];
    }
    const dam = animal.damId ? this.find(animal.damId) : undefined;
    const rows: DetailRow[] = [
      { label: 'Ear tag', value: animal.tag || '—' },
      {
        label: this.words().location.replace(/^./, (c) => c.toUpperCase()),
        value: this.kraalName(animal.kraalId),
        link: ['/kraals', animal.kraalId],
      },
      { label: 'Breed', value: animal.breed || '—' },
      {
        label: 'Born',
        value: animal.dateOfBirth
          ? `${longDate(animal.dateOfBirth)}${animal.birthDateEstimated ? ' (estimated)' : ''}`
          : '—',
      },
    ];
    if (dam) {
      rows.push({
        label: 'Mother',
        value: animalLabel(dam),
        link: ['/animals', dam.$id],
      });
    }
    return rows;
  });

  protected sexLabel(animal: AnimalRow): string {
    return animalSexLabel(animal.species, animal.sex);
  }

  protected kraalName(kraalId: string): string {
    return (
      this.kraalStore.kraals().find((kraal) => kraal.$id === kraalId)?.name ??
      '—'
    );
  }

  protected eventDetail(event: FlockEventRow): string {
    switch (event.type) {
      case 'birth':
        return event.damId === this.animalId()
          ? `Gave birth to ${event.kidIds.length}`
          : 'Born';
      case 'death':
        return deathReasonLabel(event.reason, this.animal()?.species);
      case 'treatment':
        return (
          this.inventoryStore.products().find((p) => p.$id === event.productId)
            ?.name ?? 'Treatment'
        );
      case 'move':
        return `To ${this.kraalName(event.toKraalId)}`;
    }
  }

  protected async move(): Promise<void> {
    const animal = this.animal();
    if (!animal || !this.moveTo()) {
      return;
    }
    this.moveError.set('');
    try {
      await this.animalStore.moveToKraal(
        animal.$id,
        this.moveTo(),
        todayIsoDate(),
        '',
      );
      this.toast.show(`Moved to ${this.kraalName(this.moveTo())}`);
      this.moveTo.set('');
    } catch (error: unknown) {
      this.moveError.set(
        error instanceof Error ? error.message : 'Could not move this animal.',
      );
    }
  }

  private find(id: string): AnimalRow | undefined {
    return this.animalStore.herd().find((item) => item.$id === id);
  }
}
