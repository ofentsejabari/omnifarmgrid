import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { AppLogoComponent } from '../../core/ui/app-logo.component';

/**
 * Top bar for phones. Pages keep their big title in the content; once it scrolls
 * away, the small title fades in here (the iOS "large title" pattern).
 */
@Component({
  selector: 'app-mobile-app-bar',
  imports: [RouterLink, NgIcon, AppLogoComponent],
  host: { class: 'contents md:hidden', '(window:scroll)': 'onScroll()' },
  template: `
    <header
      class="bg-background/80 sticky top-0 z-30 grid h-[calc(3.25rem+env(safe-area-inset-top))] grid-cols-[1fr_auto_1fr] items-center gap-2 border-b px-3 pt-[env(safe-area-inset-top)] backdrop-blur-xl backdrop-saturate-150 transition-colors select-none"
      [class.border-transparent]="!scrolled()"
    >
      <div class="flex min-w-0 items-center">
        @if (backUrl(); as url) {
          <a
            [routerLink]="url"
            class="text-primary-text -ms-2 inline-flex min-h-11 max-w-full min-w-0 touch-manipulation items-center text-[17px] active:opacity-50"
            [attr.aria-label]="'Back to ' + backLabel()"
          >
            <ng-icon name="lucideChevronLeft" size="26" />
            <span class="truncate">{{ backLabel() }}</span>
          </a>
        } @else {
          <a
            routerLink="/"
            class="flex items-center"
            aria-label="OmniFarmGrid home"
          >
            <app-logo [size]="30" />
          </a>
        }
      </div>
      <p
        class="max-w-[55vw] truncate text-[17px] font-semibold transition duration-200"
        [class]="scrolled() ? 'opacity-100' : 'translate-y-1 opacity-0'"
        [attr.aria-hidden]="!scrolled()"
      >
        {{ title() }}
      </p>
      <div class="flex min-w-0 items-center justify-end">
        <button
          type="button"
          class="bg-primary-strong text-primary-strong-foreground inline-flex size-9 shrink-0 touch-manipulation items-center justify-center rounded-full text-[13px] font-semibold"
          aria-label="Account"
          (click)="account.emit()"
        >
          {{ initials() }}
        </button>
      </div>
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobileAppBarComponent {
  readonly title = input('');
  readonly backUrl = input<string | null>(null);
  readonly backLabel = input('Back');
  readonly initials = input('');
  readonly account = output<void>();

  protected readonly scrolled = signal(false);

  protected onScroll(): void {
    this.scrolled.set(window.scrollY > 44);
  }
}
