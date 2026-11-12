import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { NgIcon } from '@ng-icons/core';

/** One step in a page guide. `tone` is the tile colour, e.g. 'bg-info text-info-foreground'. */
export interface GuideStep {
  icon: string;
  title: string;
  text: string;
  tone?: string;
}

const DEFAULT_TONE = 'bg-card text-primary shadow-(--shadow-card)';

/**
 * A plain-language explanation for the top of a screen: what the screen is for,
 * plus a numbered how-it-works flow. Anything placed inside the tag (an extra
 * infographic, a legend) is shown under the steps.
 *
 * `compact` gives a one-line step strip for popups, where space is tight.
 */
@Component({
  selector: 'app-page-guide',
  imports: [NgIcon],
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (compact()) {
      <ol
        class="text-muted-foreground flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs"
        [attr.aria-label]="heading()"
      >
        @for (step of steps(); track step.title; let i = $index, last = $last) {
          <li class="inline-flex items-center gap-1.5">
            <span
              class="bg-secondary text-secondary-foreground flex size-4.5 items-center justify-center rounded-full text-[10px] font-semibold tabular-nums"
              >{{ i + 1 }}</span
            >
            <span class="text-foreground font-medium">{{ step.title }}</span>
            @if (!last) {
              <ng-icon
                name="lucideChevronRight"
                size="12"
                class="text-muted-foreground/70"
                aria-hidden="true"
              />
            }
          </li>
        }
      </ol>
    } @else {
      <section
        class="bg-secondary/60 border-primary/15 dark:bg-secondary/35 rounded-xl border p-4 md:p-5"
        [attr.aria-label]="heading()"
      >
        <div class="flex items-start gap-3">
          <span
            class="bg-card text-primary flex size-9 shrink-0 items-center justify-center rounded-lg shadow-(--shadow-card)"
            aria-hidden="true"
          >
            <ng-icon [name]="icon()" size="18" />
          </span>
          <div class="min-w-0">
            <h2 class="text-secondary-foreground text-sm font-semibold">
              {{ heading() }}
            </h2>
            <p
              class="text-muted-foreground mt-0.5 max-w-3xl text-sm leading-relaxed"
            >
              {{ description() }}
            </p>
          </div>
        </div>

        @if (steps().length) {
          <ol class="mt-4 grid gap-0 md:gap-4" [class]="columns()">
            @for (
              step of steps();
              track step.title;
              let i = $index, last = $last
            ) {
              <li
                class="relative flex gap-3 md:flex-col md:gap-2.5 md:rounded-lg md:bg-card/70 md:p-3"
              >
                <span
                  class="flex flex-col items-center self-stretch md:self-auto md:items-start"
                >
                  <span
                    class="relative flex size-9 shrink-0 items-center justify-center rounded-lg"
                    [class]="step.tone ?? defaultTone"
                    aria-hidden="true"
                  >
                    <ng-icon [name]="step.icon" size="16" />
                    <span
                      class="bg-primary-strong text-primary-strong-foreground absolute -end-1.5 -top-1.5 flex size-4.5 items-center justify-center rounded-full text-[10px] font-semibold tabular-nums"
                      >{{ i + 1 }}</span
                    >
                  </span>
                  @if (!last) {
                    <span class="bg-primary/25 my-1 w-px grow md:hidden"></span>
                  }
                </span>
                <span class="min-w-0" [class]="last ? 'pb-0' : 'pb-4 md:pb-0'">
                  <span class="block text-sm font-medium">{{
                    step.title
                  }}</span>
                  <span
                    class="text-muted-foreground block text-xs leading-relaxed"
                    >{{ step.text }}</span
                  >
                </span>
                @if (!last) {
                  <span
                    class="bg-card text-primary absolute top-1/2 -end-[0.95rem] z-10 hidden size-5 -translate-y-1/2 items-center justify-center rounded-full border md:flex"
                    aria-hidden="true"
                  >
                    <ng-icon name="lucideChevronRight" size="12" />
                  </span>
                }
              </li>
            }
          </ol>
        }

        <ng-content />
      </section>
    }
  `,
})
export class PageGuideComponent {
  /** Named `heading`, not `title`, so the browser does not show a tooltip over the whole box. */
  readonly heading = input('How this page works');
  readonly description = input('');
  readonly icon = input('lucideLightbulb');
  readonly steps = input<readonly GuideStep[]>([]);
  readonly compact = input(false, { transform: booleanAttribute });

  protected readonly defaultTone = DEFAULT_TONE;
  /** Literal class names so Tailwind picks them up. */
  protected readonly columns = computed(() => {
    switch (this.steps().length) {
      case 2:
        return 'md:grid-cols-2';
      case 3:
        return 'md:grid-cols-3';
      default:
        return 'md:grid-cols-4';
    }
  });
}
