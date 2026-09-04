import { Batch } from '../models/inventory';
import { AppwriteRowRecord } from '../data/appwrite-record';
import { asNumber, asString, withoutId } from '../data/mapper-helpers';

export const BATCH_TABLE = 'batches';

export const fromAppwriteBatch = (row: AppwriteRowRecord): Batch => ({
  id: row.$id,
  productId: asString(row['productId']),
  batchNumber: asString(row['batchNumber']),
  expiryDate: asString(row['expiryDate']),
  quantityOnHand: asNumber(row['quantityOnHand']),
  receivedAt: asString(row['receivedAt']),
});

export const toAppwriteBatch = (batch: Batch): Record<string, unknown> => withoutId(batch);

export const toAppwriteBatchPatch = (changes: Partial<Batch>): Record<string, unknown> =>
  withoutId(changes);
