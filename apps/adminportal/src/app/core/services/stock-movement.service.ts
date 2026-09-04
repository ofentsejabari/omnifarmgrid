import { inject, Injectable } from '@angular/core';
import { AppwriteRowStore } from '../data/appwrite-row-store';
import { StockMovement } from '../models/inventory';
import {
  fromAppwriteStockMovement,
  STOCK_MOVEMENT_TABLE,
  toAppwriteStockMovement,
  toAppwriteStockMovementPatch,
} from './stock-movement.mapper';

@Injectable({ providedIn: 'root' })
export class StockMovementService {
  private readonly rows = inject(AppwriteRowStore);

  async list(): Promise<StockMovement[]> {
    return (await this.rows.list(STOCK_MOVEMENT_TABLE)).map(fromAppwriteStockMovement);
  }

  async get(id: string): Promise<StockMovement | undefined> {
    const row = await this.rows.get(STOCK_MOVEMENT_TABLE, id);
    return row ? fromAppwriteStockMovement(row) : undefined;
  }

  async create(movement: StockMovement): Promise<StockMovement> {
    const row = await this.rows.create(STOCK_MOVEMENT_TABLE, movement.id, toAppwriteStockMovement(movement));
    return fromAppwriteStockMovement(row);
  }

  async update(id: string, changes: Partial<StockMovement>): Promise<void> {
    await this.rows.update(STOCK_MOVEMENT_TABLE, id, toAppwriteStockMovementPatch(changes));
  }

  async delete(id: string): Promise<void> {
    await this.rows.delete(STOCK_MOVEMENT_TABLE, id);
  }

  async clear(): Promise<void> {
    for (const movement of await this.list()) {
      await this.delete(movement.id);
    }
  }

  watch(onChange: () => void): () => void {
    return this.rows.watch(STOCK_MOVEMENT_TABLE, onChange);
  }
}
