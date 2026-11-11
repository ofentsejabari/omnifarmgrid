import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  PRODUCT_KINDS,
  PRODUCT_UNITS,
  ProductKind,
  productKindLabel,
  ProductUnit,
} from '../../core/models/inventory';
import { InventoryStore } from '../../core/stores/inventory.store';
import { ModalService } from '../../core/ui/modal.service';
import { ToastService } from '../../core/ui/toast.service';
import { SelectFieldComponent } from '../../core/ui/select-field.component';
import { SpartanUiImports } from '../../core/utils/spartan-ui-imports';

/** Popup: add a medicine product. */
@Component({
  selector: 'fma-product-form',
  imports: [ReactiveFormsModule, SelectFieldComponent, ...SpartanUiImports],
  templateUrl: './product-form.component.html',
  host: { class: 'fma-modal' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductFormComponent {
  private readonly inventoryStore = inject(InventoryStore);
  private readonly toast = inject(ToastService);
  protected readonly modal = inject(ModalService);

  protected readonly kindOptions = PRODUCT_KINDS.map((kind) => ({
    value: kind,
    label: productKindLabel(kind),
  }));
  protected readonly unitOptions = PRODUCT_UNITS.map((unit) => ({
    value: unit,
    label: `${unit}s`,
  }));
  protected readonly error = signal('');
  protected readonly saving = signal(false);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    name: ['', Validators.required],
    kind: ['vaccine' as ProductKind],
    unit: ['dose' as ProductUnit],
    lowStockThreshold: [10, Validators.min(0)],
    notes: [''],
  });

  protected async save(): Promise<void> {
    this.error.set('');
    if (this.form.invalid) {
      this.error.set('Give the product a name.');
      return;
    }
    this.saving.set(true);
    try {
      const value = this.form.getRawValue();
      await this.inventoryStore.addProduct({
        ...value,
        lowStockThreshold: Number(value.lowStockThreshold),
      });
      this.toast.show(`${value.name.trim()} added`);
      await this.modal.close();
    } catch {
      this.error.set('Could not save the product.');
    } finally {
      this.saving.set(false);
    }
  }
}
