import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  model,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { HlmSelectImports } from '@spartan-ng/helm/select';

export interface SelectOption {
  value: string;
  label: string;
}

let nextId = 0;

/**
 * Spartan select bound to plain string values (ids, enum keys).
 * Works with `formControlName`, `[formField]` or `[(value)]`; an empty string means "nothing chosen".
 */
@Component({
  selector: 'app-select',
  imports: [HlmSelectImports],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectFieldComponent),
      multi: true,
    },
  ],
  host: { class: 'block' },
  template: `
    <hlm-select
      class="w-full"
      [value]="value() || null"
      [itemToString]="labelFor"
      [disabled]="isDisabled()"
      (valueChange)="select($event)"
      (closed)="onTouched()"
    >
      <hlm-select-trigger
        class="w-full"
        [size]="size()"
        [buttonId]="inputId()"
        [attr.aria-label]="ariaLabel()"
      >
        <hlm-select-value [placeholder]="placeholder()" />
      </hlm-select-trigger>
      <hlm-select-content *hlmSelectPortal class="max-h-72">
        @for (option of options(); track option.value) {
          <hlm-select-item [value]="option.value">{{
            option.label
          }}</hlm-select-item>
        } @empty {
          <p class="text-muted-foreground px-2 py-1.5 text-sm">
            {{ emptyText() }}
          </p>
        }
      </hlm-select-content>
    </hlm-select>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectFieldComponent implements ControlValueAccessor {
  readonly options = input.required<SelectOption[]>();
  readonly placeholder = input('Choose…');
  readonly emptyText = input('Nothing to choose yet');
  readonly size = input<'default' | 'sm'>('default');
  readonly inputId = input(`app-select-${++nextId}`);
  readonly ariaLabel = input<string | null>(null);
  readonly value = model('');

  protected readonly isDisabled = signal(false);
  private readonly labels = computed(
    () => new Map(this.options().map((option) => [option.value, option.label])),
  );
  protected readonly labelFor = (value: string): string =>
    this.labels().get(value) ?? '';

  private onChange: (value: string) => void = () => undefined;
  protected onTouched: () => void = () => undefined;

  protected select(value: string | null | undefined): void {
    const next = value ?? '';
    this.value.set(next);
    this.onChange(next);
  }

  writeValue(value: string | null): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.isDisabled.set(disabled);
  }
}
