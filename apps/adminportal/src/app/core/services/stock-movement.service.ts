import { inject, Injectable } from '@angular/core';
import { AppwriteRowStore } from '../data/appwrite-row-store';
import { StockMovementRow, StockMovementWrite } from '../models/inventory';

const STOCK_MOVEMENT_TABLE = 'stockMovements';

@Injectable({ providedIn: 'root' })
export class StockMovementService {
  private readonly rows = inject(AppwriteRowStore);

  async create(movement: StockMovementWrite): Promise<StockMovementRow> {
    const data: Record<string, unknown> = { ...movement };
    if (!data['treatmentEventId']) {
      delete data['treatmentEventId'];
    }
    return this.rows.create<StockMovementRow>(STOCK_MOVEMENT_TABLE, data);
  }
}
