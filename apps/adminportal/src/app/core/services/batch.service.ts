import { inject, Injectable } from '@angular/core';
import { AppwriteRowStore } from '../data/appwrite-row-store';
import { Batch } from '../models/inventory';
import { BATCH_TABLE, fromAppwriteBatch, toAppwriteBatch, toAppwriteBatchPatch } from './batch.mapper';

@Injectable({ providedIn: 'root' })
export class BatchService {
  private readonly rows = inject(AppwriteRowStore);

  async list(): Promise<Batch[]> {
    return (await this.rows.list(BATCH_TABLE)).map(fromAppwriteBatch);
  }

  async get(id: string): Promise<Batch | undefined> {
    const row = await this.rows.get(BATCH_TABLE, id);
    return row ? fromAppwriteBatch(row) : undefined;
  }

  async create(batch: Batch): Promise<Batch> {
    const row = await this.rows.create(BATCH_TABLE, batch.id, toAppwriteBatch(batch));
    return fromAppwriteBatch(row);
  }

  async update(id: string, changes: Partial<Batch>): Promise<void> {
    await this.rows.update(BATCH_TABLE, id, toAppwriteBatchPatch(changes));
  }

  async delete(id: string): Promise<void> {
    await this.rows.delete(BATCH_TABLE, id);
  }

  async clear(): Promise<void> {
    for (const batch of await this.list()) {
      await this.delete(batch.id);
    }
  }

  watch(onChange: () => void): () => void {
    return this.rows.watch(BATCH_TABLE, onChange);
  }
}
