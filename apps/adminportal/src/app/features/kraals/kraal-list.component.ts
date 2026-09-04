import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  SPECIES,
  Species,
  isSpecies,
  speciesAvatarClass,
  speciesBadgeClass,
  speciesCopy,
  speciesIconClass,
  speciesLabel,
} from '../../core/models/species';
import { KraalInUseError } from '../../core/errors';
import { KraalStore } from '../../core/stores/kraal.store';
import { AnimalStore } from '../../core/stores/animal.store';
import { SpeciesFilterStore } from '../../core/stores/species-filter.store';
import { SpartanUiImports } from '../../core/utils/spartan-ui-imports';

@Component({
  selector: 'fma-kraal-list',
  imports: [FormsModule, RouterLink, ...SpartanUiImports],
  templateUrl: './kraal-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KraalListComponent {
  protected readonly kraalStore = inject(KraalStore);
  protected readonly speciesFilterStore = inject(SpeciesFilterStore);
  private readonly animalStore = inject(AnimalStore);

  protected readonly speciesOptions = SPECIES;
  protected readonly name = signal('');
  protected readonly notes = signal('');
  protected readonly species = signal<Species>('goat');
  protected readonly error = signal('');
  protected readonly showForm = signal(false);
  protected readonly copy = speciesCopy;
  protected readonly badgeClass = speciesBadgeClass;
  protected readonly iconClass = speciesIconClass;
  protected readonly avatarClass = speciesAvatarClass;
  protected readonly speciesName = speciesLabel;

  protected readonly visibleKraals = computed(() =>
    this.kraalStore.kraals().filter((kraal) => this.speciesFilterStore.matches(kraal.species)),
  );

  constructor() {
    this.species.set(this.speciesFilterStore.preferredSpecies());
  }

  protected heading(): string {
    const selected = this.speciesFilterStore.selected();
    if (selected === 'all') {
      return 'Kraals & pens';
    }
    const plural = speciesCopy(selected).locationPlural;
    return plural.charAt(0).toUpperCase() + plural.slice(1);
  }

  protected addLabel(): string {
    const selected = this.speciesFilterStore.selected();
    const location = selected === 'all' ? 'kraal' : speciesCopy(selected).location;
    return `Add ${location}`;
  }

  protected animalCount(kraalId: string): number {
    return this.animalStore
      .animals()
      .filter((animal) => animal.kraalId === kraalId && animal.status === 'alive').length;
  }

  protected onSpecies(value: string | undefined | null): void {
    if (isSpecies(value)) {
      this.species.set(value);
    }
  }

  protected openForm(): void {
    this.species.set(this.speciesFilterStore.preferredSpecies());
    this.showForm.set(true);
  }

  protected async save(): Promise<void> {
    this.error.set('');
    if (!this.name().trim()) {
      this.error.set(`Give the ${speciesCopy(this.species()).location} a name.`);
      return;
    }
    await this.kraalStore.create(this.name(), this.notes(), this.species());
    this.name.set('');
    this.notes.set('');
    this.showForm.set(false);
  }

  protected async remove(id: string): Promise<void> {
    this.error.set('');
    try {
      await this.kraalStore.remove(id);
    } catch (error: unknown) {
      this.error.set(error instanceof KraalInUseError ? error.message : 'Could not remove kraal.');
    }
  }
}
