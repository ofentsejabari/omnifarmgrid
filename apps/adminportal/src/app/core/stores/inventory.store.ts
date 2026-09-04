import { inject } from '@angular/core';
import { patchState, signalStore, withHooks, withMethods, withState } from '@ngrx/signals';
import { Batch, COMMON_VACCINES, Product, ProductKind, ProductUnit, StockMovement } from '../models/inventory';
import { BatchService as BatchDataService } from '../services/batch.service';
import { ProductService as ProductDataService } from '../services/product.service';
import { StockMovementService as StockMovementDataService } from '../services/stock-movement.service';
import { nowIso, todayIsoDate } from '../utils/dates';
import { createId } from '../utils/id';

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
  products: Product[];
  batches: Batch[];
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
        const rows = await productService.list();
        patchState(store, { products: [...rows].sort((left, right) => left.name.localeCompare(right.name)) });
      } catch {
        patchState(store, { products: [] });
      }
    };

    const refreshBatches = async (): Promise<void> => {
      try {
        patchState(store, { batches: await batchService.list() });
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

      usableBatches(productId: string, batches = store.batches(), onDate = todayIsoDate()): Batch[] {
        return batches.filter(
          (batch) =>
            batch.productId === productId &&
            batch.quantityOnHand > 0 &&
            (!batch.expiryDate || batch.expiryDate >= onDate),
        );
      },

      async addProduct(draft: ProductDraft): Promise<Product> {
        const product: Product = {
          id: createId(),
          name: draft.name.trim(),
          kind: draft.kind,
          unit: draft.unit,
          lowStockThreshold: draft.lowStockThreshold,
          notes: draft.notes.trim(),
          createdAt: nowIso(),
        };
        await productService.create(product);
        return product;
      },

      async addCommonVaccines(): Promise<void> {
        const existing = new Set((await productService.list()).map((product) => product.name));
        for (const name of Object.values(COMMON_VACCINES).flat()) {
          if (existing.has(name)) {
            continue;
          }
          existing.add(name);
          await this.addProduct({ name, kind: 'vaccine', unit: 'dose', lowStockThreshold: 10, notes: '' });
        }
      },

      async receiveStock(draft: ReceiveStockDraft): Promise<Batch> {
        if (draft.quantity <= 0) {
          throw new Error('Quantity must be greater than zero.');
        }
        const timestamp = nowIso();
        const batch: Batch = {
          id: createId(),
          productId: draft.productId,
          batchNumber: draft.batchNumber.trim(),
          expiryDate: draft.expiryDate,
          quantityOnHand: draft.quantity,
          receivedAt: timestamp,
        };
        const movement: StockMovement = {
          id: createId(),
          batchId: batch.id,
          productId: draft.productId,
          type: 'in',
          quantity: draft.quantity,
          date: draft.date || todayIsoDate(),
          treatmentEventId: '',
          notes: draft.notes.trim(),
        };
        await batchService.create(batch);
        await stockMovementService.create(movement);
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

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type InventoryStore = InstanceType<typeof InventoryStore>;
