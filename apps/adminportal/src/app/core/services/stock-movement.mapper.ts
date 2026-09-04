import { StockMovement, StockMovementType } from '../models/inventory';
import { AppwriteRowRecord } from '../data/appwrite-record';
import { asNumber, asString, withoutId } from '../data/mapper-helpers';

export const STOCK_MOVEMENT_TABLE = 'stockMovements';

const asType = (value: unknown): StockMovementType => {
  const type = asString(value);
  if (type === 'out' || type === 'waste' || type === 'expired') {
    return type;
  }
  return 'in';
};

export const fromAppwriteStockMovement = (row: AppwriteRowRecord): StockMovement => ({
  id: row.$id,
  batchId: asString(row['batchId']),
  productId: asString(row['productId']),
  type: asType(row['type']),
  quantity: asNumber(row['quantity']),
  date: asString(row['date']),
  treatmentEventId: asString(row['treatmentEventId']),
  notes: asString(row['notes']),
});

export const toAppwriteStockMovement = (movement: StockMovement): Record<string, unknown> => {
  const data: Record<string, unknown> = { ...withoutId(movement) };
  if (data['treatmentEventId'] === '') {
    delete data['treatmentEventId'];
  }
  return data;
};

export const toAppwriteStockMovementPatch = (
  changes: Partial<StockMovement>,
): Record<string, unknown> => {
  const data: Record<string, unknown> = { ...withoutId(changes) };
  if (data['treatmentEventId'] === '') {
    delete data['treatmentEventId'];
  }
  return data;
};
