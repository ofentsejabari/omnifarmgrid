import { inject } from '@angular/core';
import { patchState, signalStore, withHooks, withMethods, withState } from '@ngrx/signals';
import { LIST_PAGE_SIZE } from '../data/appwrite-row-store';
import { KraalInUseError } from '../utils/errors';
import { KraalPage, KraalRow } from '../models/kraal';
import { Species } from '../models/species';
import { AnimalService as AnimalDataService } from '../services/animal.service';
import { KraalService as KraalDataService } from '../services/kraal.service';

const initialKraalPage: KraalPage = {
  page: 1,
  limit: LIST_PAGE_SIZE,
  offset: 0,
  total: 0,
};

interface KraalState {
  kraal: KraalRow | undefined;
  kraals: KraalRow[];
  page: KraalPage;
}

export const KraalStore = signalStore(
  { providedIn: 'root' },
  withState<KraalState>({ kraal: undefined, kraals: [], page: initialKraalPage }),
  withMethods((store) => {
    const kraalService = inject(KraalDataService);
    const animalService = inject(AnimalDataService);

    const refresh = async (): Promise<void> => {
      const { page, limit, offset } = store.page();
      try {
        const result = await kraalService.list({ limit, offset });
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
      } catch {
        patchState(store, { kraals: [], page: { ...store.page(), total: 0 } });
      }
    };

    return {
      async setPage(details: Partial<Pick<KraalPage, 'page' | 'limit'>>): Promise<void> {
        const current = store.page();
        const page = Math.max(details.page ?? current.page, 1);
        const limit = Math.max(details.limit ?? current.limit, 1);
        const offset = (page - 1) * limit;
        const unchanged = page === current.page && limit === current.limit && offset === current.offset;
        patchState(store, { page: { ...current, page, limit, offset } });
        if (unchanged && store.kraals().length > 0) {
          return;
        }
        await refresh();
      },

      async create(name: string, notes = '', species: Species = 'goat'): Promise<KraalRow> {
        const kraal: Pick<KraalRow, 'name' | 'notes' | 'species'> = {
          name: name.trim(),
          notes: notes.trim(),
          species,
        };
        return await kraalService.create(kraal);
      },

      async update(changes: Pick<KraalRow, '$id' | 'name' | 'notes' | 'species'>): Promise<void> {
        return await kraalService.update(changes);
      },

      async remove(id: string): Promise<void> {
        const animals = await animalService.list();
        if (animals.rows.some((animal) => animal.kraalId === id)) {
          throw new KraalInUseError();
        }
        await kraalService.delete(id);
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

export type KraalStore = InstanceType<typeof KraalStore>;
