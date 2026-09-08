import { inject, Injectable } from '@angular/core';
import { Models, Query } from 'appwrite';
import { AppwriteClientService, ListPagination } from '../data/appwrite-client.service';
import { BatchRow, BatchWrite } from '../models/inventory';

const BATCH_TABLE = 'batches';

@Injectable({ providedIn: 'root' })
export class BatchService {
  private readonly rows = inject(AppwriteClientService);

  async list(pagination?: ListPagination): Promise<Models.RowList<BatchRow>> {
    return this.rows.list<BatchRow>(BATCH_TABLE, [Query.orderDesc('$createdAt')], pagination);
  }

  async get(id: string): Promise<BatchRow | undefined> {
    return this.rows.get<BatchRow>(BATCH_TABLE, id);
  }

  async create(batch: BatchWrite): Promise<BatchRow> {
    return this.rows.create<BatchRow>(BATCH_TABLE, batch);
  }

  async update(changes: Partial<BatchWrite> & Pick<BatchRow, '$id'>): Promise<void> {
    await this.rows.update(BATCH_TABLE, changes.$id, changes);
  }

  watch(onChange: () => void): () => void {
    return this.rows.watch(BATCH_TABLE, onChange);
  }
}
