import { inject } from '@angular/core';
import { patchState, signalStore, withHooks, withMethods, withState } from '@ngrx/signals';
import { LIST_PAGE_SIZE } from '../data/appwrite-client.service';
import { KraalPage, KraalRow } from '../models/kraal';
import { Species, speciesVocabulary } from '../models/species';
import { AnimalService as AnimalDataService } from '../services/animal.service';
import { KraalService as KraalDataService } from '../services/kraal.service';
import { KraalInUseError } from '../utils/errors';
import { withRequestStateFeature } from './fetures/with-request-state-feature';

const initialKraalPage: KraalPage = {
  page: 1,
  limit: LIST_PAGE_SIZE,
  offset: 0,
  total: 0,
};

export interface KraalFilters {
  species: Species | null;
}

const initialKraalFilters: KraalFilters = {
  species: null,
};

interface KraalState {
  kraal: KraalRow | undefined;
  kraals: Array<KraalRow>;
  page: KraalPage;
  filters: KraalFilters;
}

export const KraalStore = signalStore(
  { providedIn: 'root' },
  withRequestStateFeature(),
  withState<KraalState>({
    kraal: undefined,
    kraals: [],
    page: initialKraalPage,
    filters: initialKraalFilters,
  }),
  withMethods((store) => {
    const kraalService = inject(KraalDataService);
    const animalService = inject(AnimalDataService);

    const refresh = async (): Promise<void> => {
      const { page, limit, offset } = store.page();
      const { species } = store.filters();
      store.setLoading(true);
      try {
        const result = await kraalService.list(species ?? undefined, { limit, offset });
        const lastPage = Math.max(Math.ceil(result.total / limit), 1);
        if (result.rows.length === 0 && page > lastPage) {
          patchState(store, {
            page: { ...store.page(), page: lastPage, offset: (lastPage - 1) * limit },
          });
          await refresh();
          return;
        }
        patchState(store, {
          kraals: result.rows,
          page: { ...store.page(), total: result.total },
        });
        store.setLoading(false);
      } catch {
        patchState(store, {
          kraals: [],
          page: { ...store.page(), total: 0 },
        });
        store.setError('Could not load kraals.');
      }
    };

    return {
      async getById(id: string): Promise<KraalRow | undefined> {
        if (!id) {
          patchState(store, { kraal: undefined });
          store.setLoading(false);
          store.clearError();
          return undefined;
        }
        patchState(store, {
          kraal: store.kraal()?.$id === id ? store.kraal() : undefined,
        });
        store.setLoading(true);
        try {
          const kraal = await kraalService.get(id);
          patchState(store, { kraal });
          store.setLoading(false);
          return kraal;
        } catch {
          patchState(store, { kraal: undefined });
          store.setError('Could not load kraal.');
          return undefined;
        }
      },

      async setFilters(filters: Partial<KraalFilters>): Promise<void> {
        const current = store.filters();
        const next: KraalFilters = { ...current, ...filters };
        if (next.species === current.species) {
          return;
        }
        patchState(store, {
          filters: next,
          page: { ...store.page(), page: 1, offset: 0 },
        });
        await refresh();
      },

      async setPage(details: Partial<Pick<KraalPage, 'page' | 'limit'>>): Promise<void> {
        const current = store.page();
        const page = Math.max(details.page ?? current.page, 1);
        const limit = Math.max(details.limit ?? current.limit, 1);
        const offset = (page - 1) * limit;
        const unchanged =
          page === current.page && limit === current.limit && offset === current.offset;
        patchState(store, { page: { ...current, page, limit, offset } });
        if (unchanged && store.kraals().length > 0) {
          return;
        }
        await refresh();
      },

      async create(name: string, notes = '', species: Species = 'goat'): Promise<KraalRow | undefined> {
        const kraal: Pick<KraalRow, 'name' | 'notes' | 'species'> = {
          name: name.trim(),
          notes: notes.trim(),
          species,
        };
        store.clearError();
        try {
          return await kraalService.create(kraal);
        } catch {
          store.setError(`Could not save ${speciesVocabulary(species).location}.`);
          return undefined;
        }
      },

      async update(changes: Pick<KraalRow, '$id' | 'name' | 'notes' | 'species'>): Promise<void> {
        store.clearError();
        try {
          await kraalService.update(changes);
          const current = store.kraal();
          if (current?.$id === changes.$id) {
            patchState(store, { kraal: { ...current, ...changes } });
          }
        } catch {
          store.setError(`Could not save ${speciesVocabulary(changes.species).location}.`);
        }
      },

      async remove(id: string): Promise<void> {
        store.clearError();
        try {
          const animals = await animalService.list();
          if (animals.rows.some((animal) => animal.kraalId === id)) {
            throw new KraalInUseError();
          }
          await kraalService.delete(id);
          if (store.kraal()?.$id === id) {
            patchState(store, { kraal: undefined });
          }
        } catch (error: unknown) {
          store.setError(
            error instanceof KraalInUseError ? error.message : 'Could not remove kraal.',
          );
        }
      },

      async unfilteredList(): Promise<void> {
        store.setLoading(true);
        try {
          const result = await kraalService.list();
          patchState(store, { kraals: result.rows });
          store.setLoading(false);
        } catch {
          store.setError('Could not load kraals.');
        }
      },
      
      _refresh: refresh,
      _setupWatch: () => kraalService.watch(() => void refresh()),
    };
  }),
  withHooks({
    onInit(store) {
      store._setupWatch();
    },
  }),
);
