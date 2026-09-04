import { Product, ProductKind, ProductUnit } from '../models/inventory';
import { AppwriteRowRecord } from '../data/appwrite-record';
import { asNumber, asString, withoutId } from '../data/mapper-helpers';

export const PRODUCT_TABLE = 'products';

const asKind = (value: unknown): ProductKind => {
  const kind = asString(value);
  if (kind === 'dewormer' || kind === 'dip' || kind === 'other') {
    return kind;
  }
  return 'vaccine';
};

const asUnit = (value: unknown): ProductUnit => (asString(value) === 'ml' ? 'ml' : 'dose');

export const fromAppwriteProduct = (row: AppwriteRowRecord): Product => ({
  id: row.$id,
  name: asString(row['name']),
  kind: asKind(row['kind']),
  unit: asUnit(row['unit']),
  lowStockThreshold: asNumber(row['lowStockThreshold']),
  notes: asString(row['notes']),
  createdAt: asString(row['createdAt']),
});

export const toAppwriteProduct = (product: Product): Record<string, unknown> => withoutId(product);

export const toAppwriteProductPatch = (changes: Partial<Product>): Record<string, unknown> =>
  withoutId(changes);
