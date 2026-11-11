import { inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { DuplicateTagError } from '../utils/errors';
import {
  AnimalCreatePayload,
  AnimalRow,
  AnimalUpdatePayload,
} from '../models/animal';
import { DeathReason } from '../models/event';
import {
  AnimalSex,
  AnimalStatus,
  speciesVocabulary,
  Species,
} from '../models/species';
import { AnimalService as AnimalDataService } from '../services/animal.service';
import { EventService as EventDataService } from '../services/event.service';
import { KraalService as KraalDataService } from '../services/kraal.service';
import { nowIso } from '../utils/dates';
import { withRequestStateFeature } from './fetures/with-request-state-feature';

export type KidDraft = Pick<AnimalCreatePayload, 'tag' | 'name' | 'sex'>;

export interface AnimalFilters {
  name: string;
  species: Species | null;
  sex: AnimalSex | null;
  status: AnimalStatus | null;
  kraalId: string | null;
}

interface AnimalState {
  /** The filtered list shown on the Animals page. */
  animals: AnimalRow[];
  /** Every animal, unfiltered — for the dashboard, pickers and detail pages. */
  herd: AnimalRow[];
  animal: AnimalRow | undefined;
  filters: AnimalFilters;
}

const initialAnimalFilters: AnimalFilters = {
  name: '',
  species: null,
  sex: null,
  status: 'alive',
  kraalId: null,
};

const initialAnimalState: AnimalState = {
  animals: [],
  herd: [],
  animal: undefined,
  filters: initialAnimalFilters,
};

export const AnimalStore = signalStore(
  { providedIn: 'root' },
  withRequestStateFeature(),
  withState<AnimalState>(initialAnimalState),
  withMethods((store) => {
    const animalService = inject(AnimalDataService);
    const eventService = inject(EventDataService);
    const kraalService = inject(KraalDataService);

    const refresh = async (): Promise<void> => {
      store.setLoading(true);
      try {
        const { name, species, sex, status, kraalId } = store.filters();
        const result = await animalService.list(
          name,
          species ?? undefined,
          sex ?? undefined,
          status ?? undefined,
          kraalId ?? undefined,
        );
        patchState(store, { animals: result.rows });
        store.setLoading(false);
      } catch {
        patchState(store, { animals: [] });
        store.setLoading(false);
      }
    };

    const refreshHerd = async (): Promise<void> => {
      try {
        patchState(store, { herd: (await animalService.list()).rows });
      } catch {
        patchState(store, { herd: [] });
      }
    };

    const assertKraalSpecies = async (
      kraalId: string,
      species: Species,
    ): Promise<void> => {
      const kraal = await kraalService.get(kraalId);
      if (!kraal) {
        throw new Error(`${speciesVocabulary(species).location} not found.`);
      }
      if (kraal.species !== species) {
        throw new Error(
          `That ${speciesVocabulary(kraal.species).location} is for ${speciesVocabulary(kraal.species).plural}, ` +
            `not ${speciesVocabulary(species).plural}.`,
        );
      }
    };

    const assertUniqueTag = async (
      tag: string,
      species: Species,
      ignoreId?: string,
    ): Promise<void> => {
      const trimmed = tag.trim();
      if (await animalService.existsAliveWithTag(trimmed, species, ignoreId)) {
        throw new DuplicateTagError(trimmed, species);
      }
    };

    return {
      getById: (id: string): Promise<AnimalRow | undefined> =>
        animalService.get(id),

      async setFilters(filters: Partial<AnimalFilters>): Promise<void> {
        const current = store.filters();
        const next: AnimalFilters = { ...current, ...filters };
        if (
          next.name === current.name &&
          next.species === current.species &&
          next.sex === current.sex &&
          next.status === current.status &&
          next.kraalId === current.kraalId
        ) {
          return;
        }
        patchState(store, { filters: next });
        await refresh();
      },

      async create(animal: AnimalCreatePayload): Promise<AnimalRow> {
        await assertKraalSpecies(animal.kraalId, animal.species);
        await assertUniqueTag(animal.tag, animal.species);
        return animalService.create(animal);
      },

      async update(
        id: string,
        animal: Omit<AnimalUpdatePayload, '$id'>,
      ): Promise<void> {
        await assertKraalSpecies(animal.kraalId, animal.species);
        await assertUniqueTag(animal.tag, animal.species, id);
        await animalService.update({ ...animal, $id: id });
      },

      async recordBirth(
        damId: string,
        kraalId: string,
        date: string,
        kids: KidDraft[],
        notes: string,
      ): Promise<AnimalRow[]> {
        const dam = await animalService.get(damId);
        if (!dam) {
          throw new Error('Dam not found.');
        }
        await assertKraalSpecies(kraalId, dam.species);
        const seenTags = new Set<string>();
        for (const kid of kids) {
          const trimmed = kid.tag.trim();
          if (seenTags.has(trimmed)) {
            throw new DuplicateTagError(trimmed, dam.species);
          }
          seenTags.add(trimmed);
          await assertUniqueTag(trimmed, dam.species);
        }
        const created: AnimalRow[] = [];
        const kidIds: string[] = [];
        for (const kid of kids) {
          const animal = await animalService.create({
            species: dam.species,
            tag: kid.tag.trim(),
            name: kid.name.trim(),
            sex: kid.sex,
            breed: dam.breed,
            dateOfBirth: date,
            birthDateEstimated: false,
            damId,
            sireId: '',
            kraalId,
            notes: '',
          });
          created.push(animal);
          kidIds.push(animal.$id);
        }
        await eventService.create({
          type: 'birth',
          date,
          damId,
          kraalId,
          kidIds,
          notes: notes.trim(),
          createdAt: nowIso(),
        });
        return created;
      },

      async recordDeath(
        animalId: string,
        date: string,
        reason: DeathReason,
        notes: string,
      ): Promise<void> {
        const animal = await animalService.get(animalId);
        if (!animal) {
          throw new Error('Animal not found.');
        }
        const status = reason === 'slaughter' ? 'culled' : 'dead';
        await animalService.update({ $id: animalId, status });
        await eventService.create({
          type: 'death',
          date,
          animalId,
          kraalId: animal.kraalId,
          reason,
          notes: notes.trim(),
          createdAt: nowIso(),
        });
      },

      async moveToKraal(
        animalId: string,
        toKraalId: string,
        date: string,
        notes: string,
      ): Promise<void> {
        const animal = await animalService.get(animalId);
        if (!animal) {
          throw new Error('Animal not found.');
        }
        if (animal.kraalId === toKraalId) {
          return;
        }
        await assertKraalSpecies(toKraalId, animal.species);
        await animalService.update({ $id: animalId, kraalId: toKraalId });
        await eventService.create({
          type: 'move',
          date,
          animalId,
          fromKraalId: animal.kraalId,
          toKraalId,
          notes: notes.trim(),
          createdAt: nowIso(),
        });
      },

      _refresh: refresh,
      _refreshHerd: refreshHerd,
      _setupWatch: () =>
        animalService.watch(() => {
          void refresh();
          void refreshHerd();
        }),
    };
  }),
  withHooks({
    onInit(store) {
      void store._refresh();
      void store._refreshHerd();
      store._setupWatch();
    },
  }),
);

export type AnimalStore = InstanceType<typeof AnimalStore>;
