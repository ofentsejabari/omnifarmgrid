import { inject } from '@angular/core';
import { patchState, signalStore, withHooks, withMethods, withState } from '@ngrx/signals';
import { BatchRow, COMMON_VACCINES, ProductKind, ProductRow, ProductUnit } from '../models/inventory';
import { BatchService as BatchDataService } from '../services/batch.service';
import { ProductService as ProductDataService } from '../services/product.service';
import { StockMovementService as StockMovementDataService } from '../services/stock-movement.service';
import { nowIso, todayIsoDate } from '../utils/dates';

export interface ProductDraft {
  name: string;
  kind: ProductKind;
  unit: ProductUnit;
  lowStockThreshold: number;
  notes: string;
}

export interface ReceiveStockDraft {
  productId: string;
  quantity: number;
  batchNumber: string;
  expiryDate: string;
  date: string;
  notes: string;
}

interface InventoryState {
  products: ProductRow[];
  batches: BatchRow[];
}

export const InventoryStore = signalStore(
  { providedIn: 'root' },
  withState<InventoryState>({ products: [], batches: [] }),
  withMethods((store) => {
    const productService = inject(ProductDataService);
    const batchService = inject(BatchDataService);
    const stockMovementService = inject(StockMovementDataService);

    const refreshProducts = async (): Promise<void> => {
      try {
        const result = await productService.list();
        patchState(store, {
          products: [...result.rows].sort((left, right) => left.name.localeCompare(right.name)),
        });
      } catch {
        patchState(store, { products: [] });
      }
    };

    const refreshBatches = async (): Promise<void> => {
      try {
        patchState(store, { batches: (await batchService.list()).rows });
      } catch {
        patchState(store, { batches: [] });
      }
    };

    return {
      onHandForProduct(productId: string, batches = store.batches()): number {
        return batches
          .filter((batch) => batch.productId === productId)
          .reduce((total, batch) => total + batch.quantityOnHand, 0);
      },

      usableBatches(productId: string, batches = store.batches(), onDate = todayIsoDate()): BatchRow[] {
        return batches.filter(
          (batch) =>
            batch.productId === productId &&
            batch.quantityOnHand > 0 &&
            (!batch.expiryDate || batch.expiryDate >= onDate),
        );
      },

      async addProduct(draft: ProductDraft): Promise<ProductRow> {
        return productService.create({
          name: draft.name.trim(),
          kind: draft.kind,
          unit: draft.unit,
          lowStockThreshold: draft.lowStockThreshold,
          notes: draft.notes.trim(),
        });
      },

      async addCommonVaccines(): Promise<void> {
        const existing = new Set((await productService.list()).rows.map((product) => product.name));
        for (const name of Object.values(COMMON_VACCINES).flat()) {
          if (existing.has(name)) {
            continue;
          }
          existing.add(name);
          await this.addProduct({
            name,
            kind: 'vaccine',
            unit: 'dose',
            lowStockThreshold: 10,
            notes: '',
          });
        }
      },

      async receiveStock(draft: ReceiveStockDraft): Promise<BatchRow> {
        if (draft.quantity <= 0) {
          throw new Error('Quantity must be greater than zero.');
        }
        const batch = await batchService.create({
          productId: draft.productId,
          batchNumber: draft.batchNumber.trim(),
          expiryDate: draft.expiryDate,
          quantityOnHand: draft.quantity,
          receivedAt: nowIso(),
        });
        await stockMovementService.create({
          batchId: batch.$id,
          productId: draft.productId,
          type: 'in',
          quantity: draft.quantity,
          date: draft.date || todayIsoDate(),
          notes: draft.notes.trim(),
        });
        return batch;
      },

      _refreshProducts: refreshProducts,
      _refreshBatches: refreshBatches,
      _setupWatch: () => {
        productService.watch(() => void refreshProducts());
        batchService.watch(() => void refreshBatches());
      },
    };
  }),
  withHooks({
    onInit(store) {
      void store._refreshProducts();
      void store._refreshBatches();
      store._setupWatch();
    },
  }),
);

export type InventoryStore = InstanceType<typeof InventoryStore>;
