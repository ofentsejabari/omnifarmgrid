import { inject } from '@angular/core';
import { patchState, signalStore, withHooks, withMethods, withState } from '@ngrx/signals';
import { DuplicateTagError } from '../errors';
import { Animal } from '../models/animal';
import { DeathReason, MoveEvent } from '../models/event';
import { AnimalSex, AnimalStatus, speciesCopy, Species } from '../models/species';
import { AnimalService as AnimalDataService } from '../services/animal.service';
import { EventService as EventDataService } from '../services/event.service';
import { KraalService as KraalDataService } from '../services/kraal.service';
import { nowIso } from '../utils/dates';
import { createId } from '../utils/id';

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
}

interface AnimalState {
  animals: Animal[];
  filters: AnimalFilters;
  isLoading: boolean;
  error: string | undefined;
}

export const initialAnimalFilters: AnimalFilters = {
  name: '',
  species: null,
  sex: null,
  status: 'alive',
};

const initialAnimalState: AnimalState = {
  animals: [],
  filters: initialAnimalFilters,
  isLoading: false,
  error: undefined,
};

export const AnimalStore = signalStore(
  { providedIn: 'root' },
  withState<AnimalState>(initialAnimalState),
  withMethods((store) => {
    const animalService = inject(AnimalDataService);
    const eventService = inject(EventDataService);
    const kraalService = inject(KraalDataService);

    const refresh = async (): Promise<void> => {
      patchState(store, { isLoading: true, error: undefined });
      try {
        const { name, species, sex, status } = store.filters();
        const animals = await animalService.list(name, species ?? undefined, sex ?? undefined, status ?? undefined);
        patchState(store, { animals, isLoading: false });
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Could not load animals.';
        patchState(store, { animals: [], isLoading: false, error: message });
      }
    };

    const assertKraalSpecies = async (kraalId: string, species: Species): Promise<void> => {
      const kraal = await kraalService.get(kraalId);
      if (!kraal) {
        throw new Error(`${speciesCopy(species).location} not found.`);
      }
      if (kraal.species !== species) {
        throw new Error(
          `That ${speciesCopy(kraal.species).location} is for ${speciesCopy(kraal.species).plural}, ` +
            `not ${speciesCopy(species).plural}.`,
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
      getById: (id: string): Promise<Animal | undefined> => animalService.get(id),

      async setFilters(filters: Partial<AnimalFilters>): Promise<void> {
        const current = store.filters();
        const next: AnimalFilters = { ...current, ...filters };
        if (
          next.name === current.name &&
          next.species === current.species &&
          next.sex === current.sex &&
          next.status === current.status
        ) {
          return;
        }
        patchState(store, { filters: next });
        await refresh();
      },

      async clearFilters(): Promise<void> {
        patchState(store, { filters: { ...initialAnimalFilters } });
        await refresh();
      },

      async create(draft: AnimalDraft): Promise<Animal> {
        await assertKraalSpecies(draft.kraalId, draft.species);
        await assertUniqueTag(draft.tag, draft.species);
        const timestamp = nowIso();
        const animal: Animal = {
          id: createId(),
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
          createdAt: timestamp,
          updatedAt: timestamp,
        };
        await animalService.create(animal);
        return animal;
      },

      async update(id: string, draft: AnimalDraft): Promise<void> {
        await assertKraalSpecies(draft.kraalId, draft.species);
        await assertUniqueTag(draft.tag, draft.species, id);
        await animalService.update(id, {
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
          updatedAt: nowIso(),
        });
      },

      async recordBirth(damId: string, kraalId: string, date: string, kids: KidDraft[], notes: string): Promise<Animal[]> {
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
        const timestamp = nowIso();
        const created: Animal[] = [];
        const kidIds: string[] = [];
        for (const kid of kids) {
          const animal: Animal = {
            id: createId(),
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
            createdAt: timestamp,
            updatedAt: timestamp,
          };
          created.push(animal);
          kidIds.push(animal.id);
          await animalService.create(animal);
        }
        await eventService.create({
          id: createId(),
          type: 'birth',
          date,
          damId,
          kraalId,
          kidIds,
          notes: notes.trim(),
          createdAt: timestamp,
        });
        return created;
      },

      async recordDeath(animalId: string, date: string, reason: DeathReason, notes: string): Promise<void> {
        const animal = await animalService.get(animalId);
        if (!animal) {
          throw new Error('Animal not found.');
        }
        const status = reason === 'slaughter' ? 'culled' : 'dead';
        await animalService.update(animalId, { status, updatedAt: nowIso() });
        await eventService.create({
          id: createId(),
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
        const event: MoveEvent = {
          id: createId(),
          type: 'move',
          date,
          animalId,
          fromKraalId: animal.kraalId,
          toKraalId,
          notes: notes.trim(),
          createdAt: nowIso(),
        };
        await animalService.update(animalId, { kraalId: toKraalId, updatedAt: nowIso() });
        await eventService.create(event);
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

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type AnimalStore = InstanceType<typeof AnimalStore>;
