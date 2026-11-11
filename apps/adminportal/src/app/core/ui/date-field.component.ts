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
import { NgIcon } from '@ng-icons/core';
import { HlmDatePickerImports } from '@spartan-ng/helm/date-picker';
import { dateToIso, isoToDate } from '../utils/dates';

let nextId = 0;

/**
 * Spartan date picker that reads and writes ISO dates (`YYYY-MM-DD`), the format stored in Appwrite.
 * Works with `formControlName`, `[formField]` or `[(value)]`.
 */
@Component({
  selector: 'app-date-field',
  imports: [HlmDatePickerImports, NgIcon],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DateFieldComponent),
      multi: true,
    },
  ],
  host: { class: 'block' },
  template: `
    <hlm-date-picker
      [date]="date()"
      [maxDate]="maxDate()"
      [formatDate]="format"
      [disabled]="isDisabled()"
      [autoCloseOnSelect]="true"
      captionLayout="dropdown"
      align="start"
      (dateChange)="pick($event)"
    >
      <hlm-date-picker-trigger
        class="h-10 w-full bg-card font-normal shadow-xs"
        [buttonId]="inputId()"
      >
        <span class="flex items-center gap-2">
          <ng-icon name="lucideCalendar" class="text-muted-foreground" />
          {{ placeholder() }}
        </span>
      </hlm-date-picker-trigger>
    </hlm-date-picker>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateFieldComponent implements ControlValueAccessor {
  readonly placeholder = input('Pick a date');
  readonly inputId = input(`app-date-${++nextId}`);
  /** Farm records are about the past: no future dates by default. */
  readonly allowFuture = input(false);
  readonly value = model('');

  protected readonly isDisabled = signal(false);
  protected readonly date = computed(() => isoToDate(this.value()));
  protected readonly maxDate = computed(() =>
    this.allowFuture() ? undefined : new Date(),
  );
  protected readonly format = (date: Date): string =>
    date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  protected pick(date: Date | null): void {
    const iso = dateToIso(date);
    this.value.set(iso);
    this.onChange(iso);
    this.onTouched();
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
