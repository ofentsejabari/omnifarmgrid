import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PRODUCT_KINDS, PRODUCT_UNITS, productKindLabel } from '../../core/models/inventory';
import { InventoryStore } from '../../core/stores/inventory.store';
import { expiresWithinDays, isExpired, todayIsoDate } from '../../core/utils/dates';
import { SpartanUiImports } from '../../core/utils/spartan-ui-imports';

@Component({
  selector: 'fma-inventory-list',
  imports: [ReactiveFormsModule, ...SpartanUiImports],
  templateUrl: './inventory-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventoryListComponent {
  private readonly formBuilder = inject(FormBuilder);
  protected readonly inventoryStore = inject(InventoryStore);

  protected readonly kinds = PRODUCT_KINDS;
  protected readonly units = PRODUCT_UNITS;
  protected readonly kindLabel = productKindLabel;
  protected readonly error = signal('');
  protected readonly showProductForm = signal(false);
  protected readonly receiveProductId = signal('');
  protected readonly productForm;
  protected readonly receiveForm;

  protected readonly rows = computed(() => {
    const batches = this.inventoryStore.batches();
    return this.inventoryStore.products().map((product) => ({
      product,
      onHand: this.inventoryStore.onHandForProduct(product.id, batches),
      expiring: batches.some(
        (batch) => batch.productId === product.id && expiresWithinDays(batch.expiryDate, 30),
      ),
      expired: batches.some(
        (batch) =>
          batch.productId === product.id &&
          batch.quantityOnHand > 0 &&
          isExpired(batch.expiryDate),
      ),
    }));
  });

  constructor() {
    this.productForm = this.formBuilder.nonNullable.group({
      name: ['', Validators.required],
      kind: this.formBuilder.nonNullable.control<(typeof PRODUCT_KINDS)[number]>('vaccine'),
      unit: this.formBuilder.nonNullable.control<(typeof PRODUCT_UNITS)[number]>('dose'),
      lowStockThreshold: [10],
      notes: [''],
    });
    this.receiveForm = this.formBuilder.nonNullable.group({
      quantity: [0, Validators.min(1)],
      batchNumber: [''],
      expiryDate: [''],
      date: [todayIsoDate()],
      notes: [''],
    });
  }

  protected async addProduct(): Promise<void> {
    this.error.set('');
    if (this.productForm.invalid) {
      this.error.set('Product name is required.');
      return;
    }
    await this.inventoryStore.addProduct(this.productForm.getRawValue());
    this.productForm.reset({
      name: '',
      kind: 'vaccine',
      unit: 'dose',
      lowStockThreshold: 10,
      notes: '',
    });
    this.showProductForm.set(false);
  }

  protected async addCommon(): Promise<void> {
    await this.inventoryStore.addCommonVaccines();
  }

  protected startReceive(productId: string): void {
    this.receiveProductId.set(productId);
    this.receiveForm.reset({
      quantity: 0,
      batchNumber: '',
      expiryDate: '',
      date: todayIsoDate(),
      notes: '',
    });
  }

  protected async receive(): Promise<void> {
    this.error.set('');
    const productId = this.receiveProductId();
    if (!productId || this.receiveForm.invalid) {
      this.error.set('Enter a quantity greater than zero.');
      return;
    }
    const value = this.receiveForm.getRawValue();
    try {
      await this.inventoryStore.receiveStock({
        productId,
        quantity: Number(value.quantity),
        batchNumber: value.batchNumber,
        expiryDate: value.expiryDate,
        date: value.date,
        notes: value.notes,
      });
      this.receiveProductId.set('');
    } catch (error: unknown) {
      this.error.set(error instanceof Error ? error.message : 'Could not receive stock.');
    }
  }
}
