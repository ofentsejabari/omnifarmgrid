import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { debounceTime, Subject } from 'rxjs';
import { animalLabel } from '../../core/models/animal';
import {
  AnimalSex,
  ANIMAL_SEXES,
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
import { KraalStore } from '../../core/stores/kraal.store';
import { SpeciesFilterStore } from '../../core/stores/species-filter.store';
import { SpartanUiImports } from '../../core/utils/spartan-ui-imports';

@Component({
  selector: 'fma-animal-list',
  imports: [FormsModule, RouterLink, ...SpartanUiImports],
  templateUrl: './animal-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnimalListComponent {
  protected readonly animalStore = inject(AnimalStore);
  protected readonly kraalStore = inject(KraalStore);
  protected readonly speciesFilterStore = inject(SpeciesFilterStore);
  private readonly nameChanges = new Subject<string>();

  protected readonly kraalFilter = signal('');
  protected readonly sexes = ANIMAL_SEXES;
  protected readonly skeletonSlots = [1, 2, 3, 4];
  protected readonly vocabulary = speciesVocabulary;
  protected readonly badgeClass = speciesBadgeClass;
  protected readonly iconClass = speciesIconClass;
  protected readonly avatarClass = speciesAvatarClass;
  protected readonly statusClass = animalStatusClass;
  protected readonly statusLabel = animalStatusLabel;
  protected readonly label = animalLabel;

  protected readonly animals = computed(() => {
    const kraalId = this.kraalFilter();
    return this.animalStore
      .animals()
      .filter((animal) => !kraalId || animal.kraalId === kraalId)
      .sort((left, right) => left.tag.localeCompare(right.tag));
  });

  protected readonly visibleKraals = computed(() =>
    this.kraalStore.kraals().filter((kraal) => this.speciesFilterStore.matches(kraal.species)),
  );

  protected readonly hasFilters = computed(() => {
    const filters = this.animalStore.filters();
    return Boolean(filters.name.trim() || filters.sex || this.kraalFilter());
  });

  constructor() {
    this.nameChanges.pipe(debounceTime(300), takeUntilDestroyed()).subscribe((name) => {
      void this.animalStore.setFilters({ name });
    });

    effect(() => {
      const selected = this.speciesFilterStore.selected();
      untracked(() => {
        void this.animalStore.setFilters({
          species: selected === 'all' ? null : selected,
        });
      });
    });
  }

  protected sexLabel(species: Species, sex: AnimalSex): string {
    return animalSexLabel(species, sex);
  }

  protected heading(): string {
    const selected = this.speciesFilterStore.selected();
    if (selected === 'all') {
      return 'Animals';
    }
    return speciesVocabulary(selected).plural.replace(/^./, (char) => char.toUpperCase());
  }

  protected addLabel(): string {
    const selected = this.speciesFilterStore.selected();
    if (selected === 'all') {
      return 'Add animal';
    }
    return `Add ${speciesVocabulary(selected).noun}`;
  }

  protected onNameChange(value: string): void {
    this.nameChanges.next(value);
  }

  protected onSexFilter(value: string | undefined | null): void {
    const sex = value === 'female' || value === 'male' || value === 'wether' ? value : null;
    void this.animalStore.setFilters({ sex });
  }

  protected onShowInactive(includeInactive: boolean): void {
    void this.animalStore.setFilters({ status: includeInactive ? null : 'alive' });
  }

  protected locationFilterLabel(): string {
    const selected = this.speciesFilterStore.selected();
    if (selected === 'all') {
      return 'All kraals';
    }
    return `All ${speciesVocabulary(selected).locationPlural}`;
  }

  protected kraalName(kraalId: string): string {
    return this.kraalStore.kraals().find((kraal) => kraal.$id === kraalId)?.name ?? 'No kraal';
  }

  protected emptyTitle(): string {
    return this.hasFilters() ? 'No matches' : `No ${this.heading().toLowerCase()} yet`;
  }

  protected emptyHint(): string {
    if (this.hasFilters()) {
      return 'Try a different name, kraal, or sex.';
    }
    return 'Add the first animal to start the herd record.';
  }
}
