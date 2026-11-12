import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { ThemePreference, ThemeService } from './theme.service';

/** Light / Dark / System segmented control. */
@Component({
  selector: 'app-theme-picker',
  imports: [NgIcon],
  template: `
    <div
      class="bg-muted grid grid-cols-3 gap-1 rounded-xl p-1"
      role="radiogroup"
      aria-label="Appearance"
    >
      @for (option of options; track option.value) {
        <button
          type="button"
          role="radio"
          class="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg text-sm font-medium transition-colors"
          [class]="
            theme.preference() === option.value
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          "
          [attr.aria-checked]="theme.preference() === option.value"
          (click)="theme.set(option.value)"
        >
          <ng-icon [name]="option.icon" size="16" />
          {{ option.label }}
        </button>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemePickerComponent {
  protected readonly theme = inject(ThemeService);
  protected readonly options: {
    value: ThemePreference;
    label: string;
    icon: string;
  }[] = [
    { value: 'light', label: 'Light', icon: 'lucideSun' },
    { value: 'dark', label: 'Dark', icon: 'lucideMoon' },
    { value: 'system', label: 'System', icon: 'lucideMonitorSmartphone' },
  ];
}
