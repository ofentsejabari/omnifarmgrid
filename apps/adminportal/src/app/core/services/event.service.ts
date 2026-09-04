import { inject, Injectable } from '@angular/core';
import { AppwriteRowStore } from '../data/appwrite-row-store';
import { FlockEvent } from '../models/event';
import { EVENT_TABLE, fromAppwriteEvent, toAppwriteEvent, toAppwriteEventPatch } from './event.mapper';

@Injectable({ providedIn: 'root' })
export class EventService {
  private readonly rows = inject(AppwriteRowStore);

  async list(): Promise<FlockEvent[]> {
    return (await this.rows.list(EVENT_TABLE)).map(fromAppwriteEvent);
  }

  async get(id: string): Promise<FlockEvent | undefined> {
    const row = await this.rows.get(EVENT_TABLE, id);
    return row ? fromAppwriteEvent(row) : undefined;
  }

  async create(event: FlockEvent): Promise<FlockEvent> {
    const row = await this.rows.create(EVENT_TABLE, event.id, toAppwriteEvent(event));
    return fromAppwriteEvent(row);
  }

  async update(id: string, changes: Partial<FlockEvent>): Promise<void> {
    await this.rows.update(EVENT_TABLE, id, toAppwriteEventPatch(changes));
  }

  async delete(id: string): Promise<void> {
    await this.rows.delete(EVENT_TABLE, id);
  }

  async clear(): Promise<void> {
    for (const event of await this.list()) {
      await this.delete(event.id);
    }
  }

  watch(onChange: () => void): () => void {
    return this.rows.watch(EVENT_TABLE, onChange);
  }
}
