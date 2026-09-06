import { inject } from '@angular/core';
import { patchState, signalStore, withHooks, withMethods, withState } from '@ngrx/signals';
import { FlockEventRow } from '../models/event';
import { EventService as EventDataService } from '../services/event.service';

interface EventState {
  events: FlockEventRow[];
}

export const EventStore = signalStore(
  { providedIn: 'root' },
  withState<EventState>({ events: [] }),
  withMethods((store) => {
    const eventService = inject(EventDataService);

    const refresh = async (): Promise<void> => {
      try {
        const result = await eventService.list();
        patchState(store, {
          events: [...result.rows].sort((left, right) => right.date.localeCompare(left.date)),
        });
      } catch {
        patchState(store, { events: [] });
      }
    };

    return {
      forAnimal(animalId: string, events = store.events()): FlockEventRow[] {
        return events.filter((event) => {
          if (event.type === 'birth') {
            return event.damId === animalId || event.kidIds.includes(animalId);
          }
          if (event.type === 'death' || event.type === 'move') {
            return event.animalId === animalId;
          }
          return (
            event.treatedAnimalIds.includes(animalId) || event.excludedAnimalIds.includes(animalId)
          );
        });
      },

      _refresh: refresh,
      _setupWatch: () => eventService.watch(() => void refresh()),
    };
  }),
  withHooks({
    onInit(store) {
      void store._refresh();
      store._setupWatch();
    },
  }),
);

export type EventStore = InstanceType<typeof EventStore>;
