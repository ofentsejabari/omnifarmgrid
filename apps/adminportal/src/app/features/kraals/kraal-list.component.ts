import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { form, FormField, required, submit } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmNumberedPagination } from '@spartan-ng/helm/pagination';
import { HlmRadioGroupImports } from '@spartan-ng/helm/radio-group';
import { hlm } from '@spartan-ng/helm/utils';
import {
  isSpecies,
  SPECIES,
  Species,
  speciesAccentClass,
  speciesAvatarClass,
  speciesBadgeClass,
  speciesIconClass,
  speciesLabel,
  speciesVocabulary,
} from '../../core/models/species';
import { LIST_PAGE_SIZE } from '../../core/data/appwrite-row-store';
import { KraalStore } from '../../core/stores/kraal.store';
import { AnimalStore } from '../../core/stores/animal.store';
import { SpeciesFilterStore } from '../../core/stores/species-filter.store';
import { SpartanUiImports } from '../../core/utils/spartan-ui-imports';
import { KraalRow } from '../../core/models/kraal';

@Component({
  selector: 'app-kraal-list',
  imports: [
    FormField,
    RouterLink,
    HlmNumberedPagination,
    ...HlmLabelImports,
    ...HlmRadioGroupImports,
    ...SpartanUiImports,
  ],
  templateUrl: './kraal-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KraalListComponent {
  protected readonly kraalStore = inject(KraalStore);
  protected readonly speciesFilterStore = inject(SpeciesFilterStore);
  private readonly animalStore = inject(AnimalStore);

  protected readonly speciesOptions = SPECIES;
  protected readonly skeletonSlots = [1, 2, 3, 4];
  protected readonly showForm = signal(false);
  protected readonly vocabulary = speciesVocabulary;
  protected readonly accentClass = speciesAccentClass;
  protected readonly badgeClass = speciesBadgeClass;
  protected readonly iconClass = speciesIconClass;
  protected readonly avatarClass = speciesAvatarClass;
  protected readonly speciesName = speciesLabel;

  protected readonly kraalModel = signal<Pick<KraalRow, 'species' | 'name' | 'notes'>>({
    species: this.speciesFilterStore.preferredSpecies(),
    name: '',
    notes: '',
  });
  protected readonly kraalForm = form(this.kraalModel, (schemaPath) => {
    required(schemaPath.species, { message: 'Choose a species.' });
    required(schemaPath.name, { message: 'Give this place a name.' });
  });
  protected readonly formCopy = computed(() => speciesVocabulary(this.kraalModel().species));

  protected readonly kraalRows = computed(() => {
    const animals = this.animalStore.animals();
    return this.kraalStore.kraals().map((kraal) => ({
      kraal,
      vocabulary: speciesVocabulary(kraal.species),
      count: animals.filter(
        (animal) => animal.kraalId === kraal.$id && animal.status === 'alive',
      ).length,
    }));
  });

  constructor() {
    void this.kraalStore.setPage({ page: 1, limit: LIST_PAGE_SIZE });
    effect(() => {
      const selected = this.speciesFilterStore.selected();
      untracked(() => {
        void this.kraalStore.setFilters({
          species: selected === 'all' ? null : selected,
        });
      });
    });
  }

  protected heading(): string {
    const selected = this.speciesFilterStore.selected();
    if (selected === 'all') {
      return 'Kraals & pens';
    }
    const plural = speciesVocabulary(selected).locationPlural;
    return plural.charAt(0).toUpperCase() + plural.slice(1);
  }

  protected addLabel(): string {
    const selected = this.speciesFilterStore.selected();
    const location = selected === 'all' ? 'kraal' : speciesVocabulary(selected).location;
    return `Add ${location}`;
  }

  protected speciesChoiceClass(species: Species): string {
    const selected = {
      goat:
        '[&:has([data-checked=true])]:border-emerald-500 [&:has([data-checked=true])]:bg-emerald-50/90 ' +
        'dark:[&:has([data-checked=true])]:bg-emerald-950/40',
      sheep:
        '[&:has([data-checked=true])]:border-amber-500 [&:has([data-checked=true])]:bg-amber-50/90 ' +
        'dark:[&:has([data-checked=true])]:bg-amber-950/40',
      pig:
        '[&:has([data-checked=true])]:border-rose-400 [&:has([data-checked=true])]:bg-rose-50/90 ' +
        'dark:[&:has([data-checked=true])]:bg-rose-950/40',
    }[species];

    return hlm(
      'relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2',
      'border-border/70 bg-card px-2 py-3.5 text-center shadow-xs transition-all',
      'hover:border-border hover:bg-muted/40',
      'has-[:focus-visible]:ring-ring/50 has-[:focus-visible]:ring-[3px]',
      '[&:has([data-checked=true])]:shadow-sm',
      selected,
    );
  }

  protected selectSpecies(value: string): void {
    if (!isSpecies(value)) {
      return;
    }
    this.kraalForm.species().value.set(value);
  }

  protected openForm(): void {
    this.kraalStore.clearError();
    this.resetForm();
    this.showForm.set(true);
  }

  protected closeForm(): void {
    this.showForm.set(false);
    this.resetForm();
  }

  protected onPageChange(page: number): void {
    void this.kraalStore.setPage({ page });
  }

  protected onLimitChange(limit: number | string): void {
    void this.kraalStore.setPage({ page: 1, limit: Number(limit) });
  }

  protected async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    await submit(this.kraalForm, {
      action: async () => {
        const { name, notes, species } = this.kraalModel();
        const created = await this.kraalStore.create(name.trim(), notes.trim(), species);
        if (created) {
          this.closeForm();
        }
        return undefined;
      },
    });
  }

  protected async remove(id: string): Promise<void> {
    await this.kraalStore.remove(id);
  }

  private resetForm(): void {
    this.kraalForm().reset({
      species: this.speciesFilterStore.preferredSpecies(),
      name: '',
      notes: '',
    });
  }
}
