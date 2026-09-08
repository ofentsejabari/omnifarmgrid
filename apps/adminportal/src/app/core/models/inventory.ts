import { Models } from 'appwrite';
import { Species } from './species';

export const PRODUCT_KINDS = ['vaccine', 'dewormer', 'dip', 'other'] as const;
export type ProductKind = (typeof PRODUCT_KINDS)[number];

export const PRODUCT_UNITS = ['dose', 'ml'] as const;
export type ProductUnit = (typeof PRODUCT_UNITS)[number];

export type ProductRow = Models.Row & {
  name: string;
  kind: ProductKind;
  unit: ProductUnit;
  lowStockThreshold: number;
  notes: string;
};

export type ProductWrite = Omit<ProductRow, keyof Models.Row>;

export type BatchRow = Models.Row & {
  productId: string;
  batchNumber: string;
  expiryDate: string;
  quantityOnHand: number;
  receivedAt: string;
};

export type BatchWrite = Omit<BatchRow, keyof Models.Row>;

export const STOCK_MOVEMENT_TYPES = ['in', 'out', 'waste', 'expired'] as const;
export type StockMovementType = (typeof STOCK_MOVEMENT_TYPES)[number];

export type StockMovementRow = Models.Row & {
  batchId: string;
  productId: string;
  type: StockMovementType;
  quantity: number;
  date: string;
  treatmentEventId?: string;
  notes: string;
};

export type StockMovementWrite = Omit<StockMovementRow, keyof Models.Row>;

export const COMMON_VACCINES: Record<Species, readonly string[]> = {
  goat: ['Pulpy kidney', 'Pasteurella', 'Anthrax', 'PPR', 'Clostridial 7-in-1', 'Orf'],
  sheep: ['Pulpy kidney', 'Pasteurella', 'Anthrax', 'Clostridial 7-in-1', 'Bluetongue', 'Orf'],
  pig: ['Parvo', 'Erysipelas', 'Mycoplasma', 'Circovirus', 'E. coli', 'Clostridial'],
  cow: ['Anthrax', 'Botulism', 'Blackleg', 'Lumpy skin', 'Brucella', 'Heartwater'],
};

export const productKindLabel = (kind: ProductKind): string => {
  switch (kind) {
    case 'vaccine':
      return 'Vaccine';
    case 'dewormer':
      return 'Dewormer';
    case 'dip':
      return 'Dip';
    case 'other':
      return 'Other';
  }
};
