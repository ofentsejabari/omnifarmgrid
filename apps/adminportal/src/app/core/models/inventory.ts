import { Species } from './species';

export const PRODUCT_KINDS = ['vaccine', 'dewormer', 'dip', 'other'] as const;
export type ProductKind = (typeof PRODUCT_KINDS)[number];

export const PRODUCT_UNITS = ['dose', 'ml'] as const;
export type ProductUnit = (typeof PRODUCT_UNITS)[number];

export interface Product {
  id: string;
  name: string;
  kind: ProductKind;
  unit: ProductUnit;
  lowStockThreshold: number;
  notes: string;
  createdAt: string;
}

export interface Batch {
  id: string;
  productId: string;
  batchNumber: string;
  expiryDate: string;
  quantityOnHand: number;
  receivedAt: string;
}

export const STOCK_MOVEMENT_TYPES = ['in', 'out', 'waste', 'expired'] as const;
export type StockMovementType = (typeof STOCK_MOVEMENT_TYPES)[number];

export interface StockMovement {
  id: string;
  batchId: string;
  productId: string;
  type: StockMovementType;
  quantity: number;
  date: string;
  treatmentEventId: string;
  notes: string;
}

export const COMMON_VACCINES: Record<Species, readonly string[]> = {
  goat: ['Pulpy kidney', 'Pasteurella', 'Anthrax', 'PPR', 'Clostridial 7-in-1', 'Orf'],
  sheep: ['Pulpy kidney', 'Pasteurella', 'Anthrax', 'Clostridial 7-in-1', 'Bluetongue', 'Orf'],
  pig: ['Parvo', 'Erysipelas', 'Mycoplasma', 'Circovirus', 'E. coli', 'Clostridial'],
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
