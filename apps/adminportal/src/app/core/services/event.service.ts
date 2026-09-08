import { inject, Injectable } from '@angular/core';
import { Models, Query } from 'appwrite';
import { AppwriteClientService, ListPagination } from '../data/appwrite-client.service';
import { EventWrite, FlockEventRow } from '../models/event';

const EVENT_TABLE = 'events';

@Injectable({ providedIn: 'root' })
export class EventService {
  private readonly rows = inject(AppwriteClientService);

  async list(pagination?: ListPagination): Promise<Models.RowList<FlockEventRow>> {
    return this.rows.list<FlockEventRow>(EVENT_TABLE, [Query.orderDesc('date')], pagination);
  }

  async create(event: EventWrite): Promise<FlockEventRow> {
    return this.rows.create<FlockEventRow>(EVENT_TABLE, { ...event });
  }

  watch(onChange: () => void): () => void {
    return this.rows.watch(EVENT_TABLE, onChange);
  }
}
