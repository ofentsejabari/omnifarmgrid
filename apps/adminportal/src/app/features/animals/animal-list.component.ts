import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { debounceTime, Subject } from 'rxjs';
import { animalLabel } from '../../core/models/animal';
import {
  AnimalSex,
  animalSexLabel,
  animalStatusClass,
  animalStatusLabel,
  Species,
  speciesVocabulary,
} from '../../core/models/species';
import { AnimalStore } from '../../core/stores/animal.store';
import { KraalStore } from '../../core/stores/kraal.store';
import { SpeciesFilterStore } from '../../core/stores/species-filter.store';
import { ModalService } from '../../core/ui/modal.service';
import { SelectFieldComponent } from '../../core/ui/select-field.component';
import { SpeciesAvatarComponent } from '../../core/ui/species-avatar.component';
import { SpartanUiImports } from '../../core/utils/spartan-ui-imports';

@Component({
  selector: 'app-animal-list',
  imports: [
    RouterLink,
    SpeciesAvatarComponent,
    SelectFieldComponent,
    ...SpartanUiImports,
  ],
  templateUrl: './animal-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnimalListComponent {
  protected readonly animalStore = inject(AnimalStore);
  private readonly kraalStore = inject(KraalStore);
  private readonly speciesFilter = inject(SpeciesFilterStore);
  private readonly modal = inject(ModalService);
  private readonly searches = new Subject<string>();

  protected readonly label = animalLabel;
  protected readonly statusClass = animalStatusClass;
  protected readonly statusLabel = animalStatusLabel;

  protected readonly animals = computed(() =>
    [...this.animalStore.animals()].sort((a, b) => a.tag.localeCompare(b.tag)),
  );
  protected readonly kraals = computed(() =>
    this.kraalStore
      .kraals()
      .filter((kraal) => this.speciesFilter.matches(kraal.species)),
  );
  protected readonly kraalOptions = computed(() => [
    { value: '', label: 'All kraals' },
    ...this.kraals().map((kraal) => ({ value: kraal.$id, label: kraal.name })),
  ]);
  protected readonly sexOptions = [
    { value: '', label: 'Any sex' },
    { value: 'female', label: 'Female' },
    { value: 'male', label: 'Male' },
    { value: 'wether', label: 'Castrated' },
  ];
  protected readonly showInactive = computed(
    () => this.animalStore.filters.status() === null,
  );
  protected readonly hasFilters = computed(() => {
    const { name, sex, kraalId } = this.animalStore.filters();
    return Boolean(name.trim() || sex || kraalId);
  });

  protected readonly heading = computed(() => {
    const selected = this.speciesFilter.selected();
    return selected === 'all'
      ? 'Animals'
      : speciesVocabulary(selected).plural.replace(/^./, (c) =>
          c.toUpperCase(),
        );
  });
  protected readonly addLabel = computed(() => {
    const selected = this.speciesFilter.selected();
    return selected === 'all'
      ? 'Add animal'
      : `Add ${speciesVocabulary(selected).noun}`;
  });

  constructor() {
    this.searches
      .pipe(debounceTime(300), takeUntilDestroyed())
      .subscribe((name) => {
        void this.animalStore.setFilters({ name });
      });

    // Follow the species switch in the top bar; drop a kraal filter that no longer fits.
    effect(() => {
      const selected = this.speciesFilter.selected();
      untracked(() => {
        const species = selected === 'all' ? null : selected;
        const { kraalId, species: current } = this.animalStore.filters();
        void this.animalStore.setFilters({
          species,
          kraalId: species === current ? kraalId : null,
        });
      });
    });
  }

  protected add(): void {
    const selected = this.speciesFilter.selected();
    void this.modal.open('animal', {
      species: selected === 'all' ? null : selected,
      kraalId: this.animalStore.filters.kraalId(),
    });
  }

  protected search(value: string): void {
    this.searches.next(value);
  }

  protected filterKraal(value: string): void {
    void this.animalStore.setFilters({ kraalId: value || null });
  }

  protected filterSex(value: string): void {
    const sex =
      value === 'female' || value === 'male' || value === 'wether'
        ? value
        : null;
    void this.animalStore.setFilters({ sex });
  }

  protected setShowInactive(include: boolean): void {
    void this.animalStore.setFilters({ status: include ? null : 'alive' });
  }

  protected sexLabel(species: Species, sex: AnimalSex): string {
    return animalSexLabel(species, sex);
  }

  protected kraalName(kraalId: string): string {
    return (
      this.kraalStore.kraals().find((kraal) => kraal.$id === kraalId)?.name ??
      '—'
    );
  }
}
