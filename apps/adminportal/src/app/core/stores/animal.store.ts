import { inject } from '@angular/core';
import { patchState, signalStore, withHooks, withMethods, withState } from '@ngrx/signals';
import { DuplicateTagError } from '../utils/errors';
import { AnimalRow } from '../models/animal';
import { DeathReason } from '../models/event';
import { AnimalSex, AnimalStatus, speciesVocabulary, Species } from '../models/species';
import { AnimalService as AnimalDataService } from '../services/animal.service';
import { EventService as EventDataService } from '../services/event.service';
import { KraalService as KraalDataService } from '../services/kraal.service';
import { nowIso } from '../utils/dates';

export interface AnimalDraft {
  species: Species;
  tag: string;
  name: string;
  sex: AnimalSex;
  breed: string;
  dateOfBirth: string;
  birthDateEstimated: boolean;
  damId: string;
  sireId: string;
  kraalId: string;
  notes: string;
}

export interface KidDraft {
  tag: string;
  name: string;
  sex: AnimalSex;
}

export interface AnimalFilters {
  name: string;
  species: Species | null;
  sex: AnimalSex | null;
  status: AnimalStatus | null;
  kraalId: string | null;
}

interface AnimalState {
  animals: AnimalRow[];
  filters: AnimalFilters;
  isLoading: boolean;
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
  filters: initialAnimalFilters,
  isLoading: false,
};

export const AnimalStore = signalStore(
  { providedIn: 'root' },
  withState<AnimalState>(initialAnimalState),
  withMethods((store) => {
    const animalService = inject(AnimalDataService);
    const eventService = inject(EventDataService);
    const kraalService = inject(KraalDataService);

    const refresh = async (): Promise<void> => {
      patchState(store, { isLoading: true });
      try {
        const { name, species, sex, status, kraalId } = store.filters();
        const result = await animalService.list(
          name,
          species ?? undefined,
          sex ?? undefined,
          status ?? undefined,
          kraalId ?? undefined,
        );
        patchState(store, { animals: result.rows, isLoading: false });
      } catch {
        patchState(store, { animals: [], isLoading: false });
      }
    };

    const assertKraalSpecies = async (kraalId: string, species: Species): Promise<void> => {
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

    const assertUniqueTag = async (tag: string, species: Species, ignoreId?: string): Promise<void> => {
      const trimmed = tag.trim();
      if (await animalService.existsAliveWithTag(trimmed, species, ignoreId)) {
        throw new DuplicateTagError(trimmed, species);
      }
    };

    return {
      getById: (id: string): Promise<AnimalRow | undefined> => animalService.get(id),

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

      async create(draft: AnimalDraft): Promise<AnimalRow> {
        await assertKraalSpecies(draft.kraalId, draft.species);
        await assertUniqueTag(draft.tag, draft.species);
        return animalService.create({
          species: draft.species,
          tag: draft.tag.trim(),
          name: draft.name.trim(),
          sex: draft.sex,
          breed: draft.breed.trim(),
          dateOfBirth: draft.dateOfBirth,
          birthDateEstimated: draft.birthDateEstimated,
          damId: draft.damId,
          sireId: draft.sireId,
          kraalId: draft.kraalId,
          status: 'alive',
          notes: draft.notes.trim(),
        });
      },

      async update(id: string, draft: AnimalDraft): Promise<void> {
        await assertKraalSpecies(draft.kraalId, draft.species);
        await assertUniqueTag(draft.tag, draft.species, id);
        await animalService.update({
          $id: id,
          species: draft.species,
          tag: draft.tag.trim(),
          name: draft.name.trim(),
          sex: draft.sex,
          breed: draft.breed.trim(),
          dateOfBirth: draft.dateOfBirth,
          birthDateEstimated: draft.birthDateEstimated,
          damId: draft.damId,
          sireId: draft.sireId,
          kraalId: draft.kraalId,
          notes: draft.notes.trim(),
        });
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
            status: 'alive',
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

      async recordDeath(animalId: string, date: string, reason: DeathReason, notes: string): Promise<void> {
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

      async moveToKraal(animalId: string, toKraalId: string, date: string, notes: string): Promise<void> {
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
      _setupWatch: () => animalService.watch(() => void refresh()),
    };
  }),
  withHooks({
    onInit(store) {
      void store._refresh();
      store._setupWatch();
    },
  }),
);

export type AnimalStore = InstanceType<typeof AnimalStore>;
