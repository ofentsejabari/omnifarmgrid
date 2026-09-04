import { Animal } from './animal';
import { FlockEvent } from './event';
import { Batch, Product, StockMovement } from './inventory';
import { Kraal } from './kraal';

export const BACKUP_VERSION = 1 as const;

export interface FmaBackup {
  version: typeof BACKUP_VERSION;
  exportedAt: string;
  kraals: Kraal[];
  animals: Animal[];
  products: Product[];
  batches: Batch[];
  stockMovements: StockMovement[];
  events: FlockEvent[];
}
