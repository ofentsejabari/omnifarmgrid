import { inject } from '@angular/core';
import { patchState, signalStore, withHooks, withMethods, withState } from '@ngrx/signals';
import { KraalInUseError } from '../errors';
import { Kraal } from '../models/kraal';
import { Species } from '../models/species';
import { AnimalService as AnimalDataService } from '../services/animal.service';
import { KraalService as KraalDataService } from '../services/kraal.service';
import { nowIso } from '../utils/dates';
import { createId } from '../utils/id';

interface KraalState {
  kraals: Kraal[];
}

export const KraalStore = signalStore(
  { providedIn: 'root' },
  withState<KraalState>({ kraals: [] }),
  withMethods((store) => {
    const kraalService = inject(KraalDataService);
    const animalService = inject(AnimalDataService);

    const refresh = async (): Promise<void> => {
      try {
        const rows = await kraalService.list();
        patchState(store, { kraals: [...rows].sort((left, right) => left.name.localeCompare(right.name)) });
      } catch {
        patchState(store, { kraals: [] });
      }
    };

    return {
      async create(name: string, notes = '', species: Species = 'goat'): Promise<Kraal> {
        const timestamp = nowIso();
        const kraal: Kraal = {
          id: createId(),
          name: name.trim(),
          notes: notes.trim(),
          species,
          createdAt: timestamp,
          updatedAt: timestamp,
        };
        await kraalService.create(kraal);
        return kraal;
      },

      async update(id: string, changes: Pick<Kraal, 'name' | 'notes' | 'species'>): Promise<void> {
        await kraalService.update(id, {
          name: changes.name.trim(),
          notes: changes.notes.trim(),
          species: changes.species,
          updatedAt: nowIso(),
        });
      },

      async remove(id: string): Promise<void> {
        const animals = await animalService.list();
        if (animals.some((animal) => animal.kraalId === id)) {
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
      void store._refresh();
      store._setupWatch();
    },
  }),
);

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type KraalStore = InstanceType<typeof KraalStore>;
