import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { isSpecies, SPECIES, Species } from '../models/species';

export type SpeciesFilter = Species | 'all';

/** Re-exported for convenience so callers don't need to import from models. */
export { SPECIES as SPECIES_OPTIONS };

const STORAGE_KEY = 'fma-species-filter';

const readStoredFilter = (): SpeciesFilter => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'all' || isSpecies(stored)) {
      return stored;
    }
  } catch {
    /* private mode */
  }
  return 'all';
};

interface SpeciesFilterState {
  selected: SpeciesFilter;
}

export const SpeciesFilterStore = signalStore(
  { providedIn: 'root' },
  withState<SpeciesFilterState>({ selected: readStoredFilter() }),
  withComputed((store) => ({
    isAll: computed(() => store.selected() === 'all'),
  })),
  withMethods((store) => ({
    set(filter: SpeciesFilter): void {
      patchState(store, { selected: filter });
      try {
        localStorage.setItem(STORAGE_KEY, filter);
      } catch {
        /* private mode */
      }
    },

    matches(species: Species): boolean {
      const selected = store.selected();
      return selected === 'all' || selected === species;
    },

    preferredSpecies(): Species {
      const selected = store.selected();
      return selected === 'all' ? 'goat' : selected;
    },
  })),
);

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type SpeciesFilterStore = InstanceType<typeof SpeciesFilterStore>;
