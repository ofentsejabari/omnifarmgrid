import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  untracked,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { animalLabel, AnimalRow } from '../../core/models/animal';
import { animalSexLabel, speciesVocabulary } from '../../core/models/species';
import { AnimalStore } from '../../core/stores/animal.store';
import { KraalStore } from '../../core/stores/kraal.store';
import {
  ModalName,
  ModalParams,
  ModalService,
} from '../../core/ui/modal.service';
import { SpeciesAvatarComponent } from '../../core/ui/species-avatar.component';
import { ToastService } from '../../core/ui/toast.service';
import { SpartanUiImports } from '../../core/utils/spartan-ui-imports';
import { PageGuideComponent } from '../../core/ui/page-guide.component';

interface KraalAction {
  label: string;
  icon: string;
  tone: string;
  modal: ModalName;
  params: ModalParams;
}

@Component({
  selector: 'app-kraal-detail',
  imports: [
    PageGuideComponent,
    RouterLink,
    SpeciesAvatarComponent,
    ...SpartanUiImports,
  ],
  templateUrl: './kraal-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KraalDetailComponent {
  protected readonly kraalStore = inject(KraalStore);
  protected readonly modal = inject(ModalService);
  private readonly animalStore = inject(AnimalStore);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  private readonly kraalId = toSignal(
    inject(ActivatedRoute).paramMap.pipe(map((p) => p.get('id') ?? '')),
    {
      initialValue: '',
    },
  );

  protected readonly label = animalLabel;
  protected readonly kraal = this.kraalStore.kraal;
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

  /** Who lives here, split by sex, for the make-up bar. */
  protected readonly makeup = computed(() => {
    const animals = this.animals();
    const words = this.words();
    const total = animals.length;
    const count = (sex: string) =>
      animals.filter((animal) => animal.sex === sex).length;
    return [
      {
        label: `${words.dam}s`,
        hint: 'Breeding females',
        count: count('female'),
        bar: 'bg-emerald-500',
      },
      {
        label: `${words.sire}s`,
        hint: 'Breeding males',
        count: count('male'),
        bar: 'bg-blue-500',
      },
      {
        label: 'Castrated',
        hint: 'Kept for meat or work',
        count: count('wether'),
        bar: 'bg-amber-500',
      },
    ].map((part) => ({
      ...part,
      share: total ? (part.count / total) * 100 : 0,
    }));
  });

  protected readonly actions = computed<KraalAction[]>(() => {
    const kraalId = this.kraalId();
    const words = this.words();
    return [
      {
        label: `Add ${words.noun}`,
        icon: 'lucidePlus',
        tone: 'bg-secondary text-primary',
        modal: 'animal',
        params: { kraalId },
      },
      {
        label: 'Vaccinate',
        icon: 'lucideSyringe',
        tone: 'bg-warning text-warning-foreground',
        modal: 'vaccinate',
        params: { kraalId },
      },
      {
        label: words.birthVerb,
        icon: 'lucideBaby',
        tone: 'bg-info text-info-foreground',
        modal: 'birth',
        params: { kraalId },
      },
      {
        label: 'Record death',
        icon: 'lucideHeartOff',
        tone: 'bg-destructive/10 text-destructive',
        modal: 'death',
        params: { kraalId },
      },
    ];
  });

  constructor() {
    effect(() => {
      const id = this.kraalId();
      untracked(() => void this.kraalStore.getById(id));
    });
  }

  protected sexLabel(animal: AnimalRow): string {
    return animalSexLabel(animal.species, animal.sex);
  }

  protected async remove(): Promise<void> {
    const kraal = this.kraal();
    if (!kraal) {
      return;
    }
    await this.kraalStore.remove(kraal.$id);
    if (!this.kraalStore.error()) {
      this.toast.show(`${kraal.name} deleted`);
      await this.router.navigate(['/kraals']);
    }
  }
}
