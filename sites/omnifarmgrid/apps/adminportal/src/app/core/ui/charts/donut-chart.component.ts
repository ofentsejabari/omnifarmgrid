import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
} from '@angular/core';

export interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

interface Arc extends DonutSlice {
  dash: string;
  offset: number;
  share: number;
}

const RADIUS = 40;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
/** Surface-coloured gap between segments, in SVG units along the ring. */
const GAP = 1.6;

/** Share-of-total ring with a centre total, legend with values, and hover focus. */
@Component({
  selector: 'app-donut-chart',
  template: `
    <div class="flex flex-col items-center gap-5 sm:flex-row sm:gap-8">
      <div class="relative size-40 shrink-0">
        <svg
          viewBox="0 0 100 100"
          class="size-full -rotate-90"
          role="img"
          [attr.aria-label]="ariaLabel()"
        >
          <circle
            cx="50"
            cy="50"
            [attr.r]="radius"
            fill="none"
            class="stroke-muted"
            stroke-width="12"
          />
          @for (arc of arcs(); track arc.label) {
            <circle
              cx="50"
              cy="50"
              [attr.r]="radius"
              fill="none"
              [attr.stroke]="arc.color"
              [attr.stroke-width]="active() === arc.label ? 15 : 12"
              [attr.stroke-dasharray]="arc.dash"
              [attr.stroke-dashoffset]="arc.offset"
              class="cursor-pointer transition-[stroke-width,opacity] duration-150"
              [style.opacity]="active() && active() !== arc.label ? 0.35 : 1"
              (mouseenter)="active.set(arc.label)"
              (mouseleave)="active.set(null)"
            >
              <title>{{ arc.label }}: {{ arc.value }} ({{ arc.share }}%)</title>
            </circle>
          }
        </svg>
        <div
          class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"
        >
          <span class="text-2xl font-semibold tabular-nums">{{
            focus().value
          }}</span>
          <span class="text-muted-foreground text-xs">{{ focus().label }}</span>
        </div>
      </div>
      <ul class="grid w-full grid-cols-2 gap-x-6 gap-y-2.5 sm:grid-cols-1">
        @for (slice of slices(); track slice.label) {
          <li
            class="flex cursor-default items-center gap-2.5 text-sm"
            (mouseenter)="active.set(slice.label)"
            (mouseleave)="active.set(null)"
          >
            <span
              class="size-2.5 shrink-0 rounded-full"
              [style.background]="slice.color"
            ></span>
            <span class="text-muted-foreground grow">{{ slice.label }}</span>
            <span class="font-semibold tabular-nums">{{ slice.value }}</span>
          </li>
        }
      </ul>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DonutChartComponent {
  readonly slices = input.required<DonutSlice[]>();
  readonly totalLabel = input('Total');

  protected readonly radius = RADIUS;
  protected readonly active = signal<string | null>(null);

  private readonly total = computed(() =>
    this.slices().reduce((sum, slice) => sum + slice.value, 0),
  );

  protected readonly arcs = computed<Arc[]>(() => {
    const total = this.total();
    if (!total) {
      return [];
    }
    const visible = this.slices().filter((slice) => slice.value > 0);
    const gap = visible.length > 1 ? GAP : 0;
    let start = 0;
    return visible.map((slice) => {
      const length = (slice.value / total) * CIRCUMFERENCE;
      const arc: Arc = {
        ...slice,
        dash: `${Math.max(length - gap, 0.5)} ${CIRCUMFERENCE}`,
        offset: -start,
        share: Math.round((slice.value / total) * 100),
      };
      start += length;
      return arc;
    });
  });

  protected readonly focus = computed(() => {
    const label = this.active();
    const slice = label
      ? this.slices().find((item) => item.label === label)
      : undefined;
    return slice
      ? { value: slice.value, label: slice.label }
      : { value: this.total(), label: this.totalLabel() };
  });

  protected readonly ariaLabel = computed(() =>
    this.slices()
      .map((slice) => `${slice.label} ${slice.value}`)
      .join(', '),
  );
}
