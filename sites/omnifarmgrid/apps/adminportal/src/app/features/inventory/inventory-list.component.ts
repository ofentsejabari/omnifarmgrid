import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { ProductKind, productKindLabel } from '../../core/models/inventory';
import { InventoryStore } from '../../core/stores/inventory.store';
import { ModalService } from '../../core/ui/modal.service';
import { ToastService } from '../../core/ui/toast.service';
import { expiresWithinDays, isExpired } from '../../core/utils/dates';
import { SpartanUiImports } from '../../core/utils/spartan-ui-imports';

const KIND_TONE: Record<ProductKind, string> = {
  vaccine: 'bg-info text-info-foreground',
  dewormer: 'bg-warning text-warning-foreground',
  dip: 'bg-secondary text-primary',
  other: 'bg-muted text-muted-foreground',
};

@Component({
  selector: 'fma-inventory-list',
  imports: [...SpartanUiImports],
  templateUrl: './inventory-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventoryListComponent {
  private readonly inventoryStore = inject(InventoryStore);
  private readonly toast = inject(ToastService);
  protected readonly modal = inject(ModalService);
  protected readonly kindLabel = productKindLabel;

  protected readonly rows = computed(() => {
    const batches = this.inventoryStore.batches();
    return this.inventoryStore.products().map((product) => {
      const own = batches.filter((batch) => batch.productId === product.$id);
      const onHand = this.inventoryStore.onHandForProduct(product.$id, batches);
      // The low-stock threshold sits at a quarter of a full bar.
      const full = Math.max(product.lowStockThreshold * 4, 1);
      return {
        product,
        onHand,
        tone: KIND_TONE[product.kind],
        low: onHand <= product.lowStockThreshold,
        level:
          onHand > 0 ? Math.max(Math.min((onHand / full) * 100, 100), 4) : 0,
        expiring: own.some(
          (batch) =>
            batch.quantityOnHand > 0 && expiresWithinDays(batch.expiryDate, 30),
        ),
        expired: own.some(
          (batch) => batch.quantityOnHand > 0 && isExpired(batch.expiryDate),
        ),
      };
    });
  });

  protected async addCommon(): Promise<void> {
    await this.inventoryStore.addCommonVaccines();
    this.toast.show('Common vaccines added');
  }
}
