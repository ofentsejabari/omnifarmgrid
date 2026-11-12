import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIcon } from '@ng-icons/core';

export interface TabItem {
  title: string;
  url: string;
  icon: string;
  exact?: boolean;
}

/** Bottom tab bar for phones, with the Record button raised in the middle. */
@Component({
  selector: 'app-mobile-tab-bar',
  imports: [NgTemplateOutlet, RouterLink, RouterLinkActive, NgIcon],
  host: { class: 'md:hidden' },
  template: `
    <nav
      class="bg-background/90 fixed inset-x-0 bottom-0 z-40 grid h-[calc(4rem+env(safe-area-inset-bottom))] grid-cols-5 border-t pb-[env(safe-area-inset-bottom)] backdrop-blur-xl backdrop-saturate-150 select-none"
      aria-label="Main"
    >
      @for (tab of left(); track tab.url) {
        <ng-container *ngTemplateOutlet="tabTpl; context: { $implicit: tab }" />
      }
      <button
        type="button"
        class="group flex touch-manipulation items-start justify-center"
        aria-label="Record something"
        (click)="record.emit()"
      >
        <span
          class="bg-primary-strong text-primary-strong-foreground border-background shadow-primary-strong/40 -mt-4.5 inline-flex size-14 items-center justify-center rounded-full border-4 shadow-lg transition group-active:scale-90"
        >
          <ng-icon name="lucidePlus" size="26" />
        </span>
      </button>
      @for (tab of right(); track tab.url) {
        <ng-container *ngTemplateOutlet="tabTpl; context: { $implicit: tab }" />
      }
    </nav>

    <ng-template #tabTpl let-tab>
      <a
        class="group text-muted-foreground flex touch-manipulation flex-col items-center justify-center gap-0.5 text-[11px] font-medium"
        [routerLink]="tab.url"
        routerLinkActive="is-active text-primary-text font-semibold"
        [routerLinkActiveOptions]="{ exact: !!tab.exact }"
        #rla="routerLinkActive"
        [attr.aria-current]="rla.isActive ? 'page' : null"
      >
        <span
          class="group-[.is-active]:bg-primary/15 inline-flex h-7.5 w-14 items-center justify-center rounded-full transition group-active:scale-90"
        >
          <ng-icon [name]="tab.icon" size="22" />
        </span>
        <span>{{ tab.title }}</span>
      </a>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobileTabBarComponent {
  readonly tabs = input.required<TabItem[]>();
  readonly record = output<void>();

  protected readonly left = computed(() => this.tabs().slice(0, 2));
  protected readonly right = computed(() => this.tabs().slice(2));
}
