import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
} from '@angular/core';

export interface BarSeries {
  name: string;
  color: string;
  values: number[];
}

/** Grouped vertical bars sharing one axis, with a legend and a per-group tooltip. */
@Component({
  selector: 'app-bar-chart',
  template: `
    <div class="flex flex-col gap-3">
      <ul class="flex flex-wrap gap-x-4 gap-y-1 text-xs">
        @for (series of series(); track series.name) {
          <li class="text-muted-foreground flex items-center gap-1.5">
            <span
              class="size-2.5 rounded-sm"
              [style.background]="series.color"
            ></span>
            {{ series.name }}
          </li>
        }
      </ul>

      <div class="relative h-44">
        <!-- recessive grid -->
        @for (tick of ticks(); track tick) {
          <div
            class="border-border/70 absolute inset-x-0 border-t border-dashed"
            [style.bottom.%]="(tick / max()) * 100"
          >
            <span
              class="text-muted-foreground absolute -top-2 start-0 bg-card pe-1 text-[10px] tabular-nums"
            >
              {{ tick }}
            </span>
          </div>
        }

        <div class="absolute inset-0 start-6 flex items-end gap-2">
          @for (label of labels(); track label; let i = $index) {
            <div
              class="relative flex h-full flex-1 items-end justify-center gap-[2px] rounded-md transition-colors"
              [class.bg-muted]="hovered() === i"
              (mouseenter)="hovered.set(i)"
              (mouseleave)="hovered.set(null)"
              tabindex="0"
              (focus)="hovered.set(i)"
              (blur)="hovered.set(null)"
              [attr.aria-label]="describe(i)"
            >
              @for (series of series(); track series.name) {
                <div
                  class="w-full max-w-4 rounded-t-[4px]"
                  [style.background]="series.color"
                  [style.height.%]="(series.values[i] / max()) * 100"
                  [style.min-height.px]="series.values[i] > 0 ? 3 : 0"
                ></div>
              }
              @if (hovered() === i) {
                <div
                  class="bg-popover text-popover-foreground pointer-events-none absolute bottom-full z-10 mb-2 min-w-28
                    rounded-lg border px-3 py-2 text-xs whitespace-nowrap"
                  style="box-shadow: var(--shadow-float)"
                >
                  <p class="mb-1 font-semibold">{{ label }}</p>
                  @for (series of series(); track series.name) {
                    <p class="flex items-center gap-1.5">
                      <span
                        class="size-2 rounded-sm"
                        [style.background]="series.color"
                      ></span>
                      <span class="text-muted-foreground grow">{{
                        series.name
                      }}</span>
                      <span class="font-medium tabular-nums">{{
                        series.values[i]
                      }}</span>
                    </p>
                  }
                </div>
              }
            </div>
          }
        </div>
      </div>

      <div class="ms-6 flex gap-2">
        @for (label of labels(); track label) {
          <span class="text-muted-foreground flex-1 text-center text-[11px]">{{
            label
          }}</span>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BarChartComponent {
  readonly labels = input.required<string[]>();
  readonly series = input.required<BarSeries[]>();

  protected readonly hovered = signal<number | null>(null);

  /** Round the axis up to a friendly number so gridlines land on integers. */
  protected readonly max = computed(() => {
    const peak = Math.max(
      1,
      ...this.series().flatMap((series) => series.values),
    );
    const step = peak <= 4 ? 1 : peak <= 10 ? 2 : peak <= 25 ? 5 : 10;
    return Math.ceil(peak / step) * step;
  });

  protected readonly ticks = computed(() => {
    const max = this.max();
    const step = max <= 4 ? 1 : max / 2;
    const ticks: number[] = [];
    for (let tick = step; tick <= max; tick += step) {
      ticks.push(tick);
    }
    return ticks;
  });

  protected describe(index: number): string {
    return `${this.labels()[index]}: ${this.series()
      .map((series) => `${series.name} ${series.values[index]}`)
      .join(', ')}`;
  }
}
