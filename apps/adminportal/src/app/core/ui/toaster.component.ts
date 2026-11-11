import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toaster',
  imports: [NgIcon],
  template: `
    <div
      class="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex flex-col items-center gap-2 px-4 lg:bottom-6"
      role="status"
      aria-live="polite"
    >
      @for (toast of toasts.toasts(); track toast.id) {
        <div
          class="bg-foreground text-background pointer-events-auto flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm
            font-medium"
          style="box-shadow: var(--shadow-float)"
        >
          <ng-icon
            name="lucideCircleCheck"
            size="16"
            class="text-emerald-400"
          />
          {{ toast.message }}
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToasterComponent {
  protected readonly toasts = inject(ToastService);
}
