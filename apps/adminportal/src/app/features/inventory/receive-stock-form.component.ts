import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { InventoryStore } from '../../core/stores/inventory.store';
import { ModalService } from '../../core/ui/modal.service';
import { ToastService } from '../../core/ui/toast.service';
import { todayIsoDate } from '../../core/utils/dates';
import { DateFieldComponent } from '../../core/ui/date-field.component';
import { SelectFieldComponent } from '../../core/ui/select-field.component';
import { SpartanUiImports } from '../../core/utils/spartan-ui-imports';
import {
  GuideStep,
  PageGuideComponent,
} from '../../core/ui/page-guide.component';

/** Popup: receive a batch of stock. Params: `productId`. */
@Component({
  selector: 'fma-receive-stock-form',
  imports: [
    PageGuideComponent,
    ReactiveFormsModule,
    SelectFieldComponent,
    DateFieldComponent,
    ...SpartanUiImports,
  ],
  templateUrl: './receive-stock-form.component.html',
  host: { class: 'flex min-h-0 flex-1 flex-col' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReceiveStockFormComponent {
  protected readonly guideSteps: readonly GuideStep[] = [
    { icon: 'lucidePackage', title: 'Product', text: '' },
    { icon: 'lucidePackagePlus', title: 'Quantity', text: '' },
    { icon: 'lucideCalendarClock', title: 'Batch and expiry', text: '' },
    { icon: 'lucideCircleCheck', title: 'Save', text: '' },
  ];

  protected readonly inventoryStore = inject(InventoryStore);
  private readonly toast = inject(ToastService);
  protected readonly modal = inject(ModalService);

  protected readonly productOptions = computed(() =>
    this.inventoryStore
      .products()
      .map((product) => ({ value: product.$id, label: product.name })),
  );
  protected readonly error = signal('');
  protected readonly saving = signal(false);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    productId: [
      inject(ActivatedRoute).snapshot.paramMap.get('productId') ?? '',
      Validators.required,
    ],
    quantity: [1, Validators.min(1)],
    batchNumber: [''],
    expiryDate: [''],
    date: [todayIsoDate()],
    notes: [''],
  });

  protected async save(): Promise<void> {
    this.error.set('');
    if (this.form.invalid) {
      this.error.set('Choose a product and enter a quantity above zero.');
      return;
    }
    this.saving.set(true);
    try {
      const value = this.form.getRawValue();
      await this.inventoryStore.receiveStock({
        ...value,
        quantity: Number(value.quantity),
      });
      this.toast.show('Stock received');
      await this.modal.close();
    } catch (error: unknown) {
      this.error.set(
        error instanceof Error ? error.message : 'Could not receive stock.',
      );
    } finally {
      this.saving.set(false);
    }
  }
}
