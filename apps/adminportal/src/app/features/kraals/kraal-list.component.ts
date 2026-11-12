import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  untracked,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { HlmNumberedPagination } from '@spartan-ng/helm/pagination';
import { LIST_PAGE_SIZE } from '../../core/data/appwrite-client.service';
import { speciesVocabulary } from '../../core/models/species';
import { AnimalStore } from '../../core/stores/animal.store';
import { KraalStore } from '../../core/stores/kraal.store';
import { SpeciesFilterStore } from '../../core/stores/species-filter.store';
import { ModalService } from '../../core/ui/modal.service';
import { SpeciesAvatarComponent } from '../../core/ui/species-avatar.component';
import { SpartanUiImports } from '../../core/utils/spartan-ui-imports';
import {
  GuideStep,
  PageGuideComponent,
} from '../../core/ui/page-guide.component';

@Component({
  selector: 'app-kraal-list',
  imports: [
    PageGuideComponent,
    RouterLink,
    HlmNumberedPagination,
    SpeciesAvatarComponent,
    ...SpartanUiImports,
  ],
  templateUrl: './kraal-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KraalListComponent {
  protected readonly guideSteps: readonly GuideStep[] = [
    {
      icon: 'lucideFence',
      title: 'Add a kraal or pen',
      text: 'Choose who lives there. Each place holds one species, so records stay tidy.',
    },
    {
      icon: 'lucidePawPrint',
      title: 'Put animals in it',
      text: 'Pick the kraal when you add an animal, or move it later.',
      tone: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300',
    },
    {
      icon: 'lucideSyringe',
      title: 'Work the whole group',
      text: 'Open a kraal to vaccinate everyone at once or record births and deaths.',
      tone: 'bg-warning text-warning-foreground',
    },
  ];

  protected readonly kraalStore = inject(KraalStore);
  protected readonly modal = inject(ModalService);
  private readonly animalStore = inject(AnimalStore);
  private readonly speciesFilter = inject(SpeciesFilterStore);

  protected readonly rows = computed(() => {
    const alive = this.animalStore
      .herd()
      .filter((animal) => animal.status === 'alive');
    return this.kraalStore.kraals().map((kraal) => {
      const animals = alive.filter((animal) => animal.kraalId === kraal.$id);
      return {
        kraal,
        words: speciesVocabulary(kraal.species),
        count: animals.length,
        females: animals.filter((animal) => animal.sex === 'female').length,
        males: animals.filter((animal) => animal.sex === 'male').length,
      };
    });
  });

  protected readonly heading = computed(() => {
    const selected = this.speciesFilter.selected();
    return selected === 'all'
      ? 'Kraals & pens'
      : speciesVocabulary(selected).locationPlural.replace(/^./, (c) =>
          c.toUpperCase(),
        );
  });

  constructor() {
    void this.kraalStore.setPage({ page: 1, limit: LIST_PAGE_SIZE });
    effect(() => {
      const selected = this.speciesFilter.selected();
      untracked(
        () =>
          void this.kraalStore.setFilters({
            species: selected === 'all' ? null : selected,
          }),
      );
    });
  }
}
