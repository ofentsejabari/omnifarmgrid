import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { InventoryStore } from '../../core/stores/inventory.store';
import { ModalService } from '../../core/ui/modal.service';
import { isoToDate, todayIsoDate } from '../../core/utils/dates';

type Severity = 'critical' | 'warning' | 'info';

interface StockAlert {
  id: string;
  severity: Severity;
  title: string;
  detail: string;
  action: { label: string; productId?: string };
}

const EXPIRY_WINDOW_DAYS = 30;
const VISIBLE_BY_DEFAULT = 3;
const DISMISS_KEY = 'fma-dismissed-alerts';
const SEVERITY_ORDER: Record<Severity, number> = {
  critical: 0,
  warning: 1,
  info: 2,
};

const TONE: Record<Severity, { icon: string; tile: string; label: string }> = {
  critical: {
    icon: 'lucideOctagonAlert',
    tile: 'bg-destructive/10 text-destructive',
    label: 'Urgent',
  },
  warning: {
    icon: 'lucideTriangleAlert',
    tile: 'bg-warning text-warning-foreground',
    label: 'Low stock',
  },
  info: {
    icon: 'lucideClock',
    tile: 'bg-info text-info-foreground',
    label: 'Expiring',
  },
};

/**
 * "Needs attention" panel on the dashboard: medicine that is out, low, expired or about to expire,
 * most urgent first, each with a next step. Dismissed alerts stay hidden until tomorrow.
 */
@Component({
  selector: 'app-stock-alerts',
  imports: [RouterLink, NgIcon, HlmButtonImports],
  template: `
    @if (visible().length) {
      <section
        class="bg-card rounded-xl border shadow-(--shadow-card) overflow-hidden"
        aria-labelledby="alerts-title"
      >
        <header class="flex items-center gap-3 border-b px-4 py-3">
          <span
            class="flex size-8 items-center justify-center rounded-lg"
            [class]="headerTone()"
          >
            <ng-icon [name]="tone[worst()].icon" size="16" />
          </span>
          <div class="min-w-0 grow">
            <h2 id="alerts-title" class="text-sm font-semibold">
              Needs attention
            </h2>
            <p class="text-muted-foreground text-xs">{{ summary() }}</p>
          </div>
          <a routerLink="/stock" hlmBtn variant="ghost" size="sm">
            Open stock
            <ng-icon name="lucideArrowRight" />
          </a>
        </header>

        <ul class="divide-y">
          @for (alert of shown(); track alert.id) {
            <li
              class="flex flex-wrap items-start gap-x-3 gap-y-2 px-4 py-3 sm:flex-nowrap sm:items-center"
            >
              <span
                class="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg sm:mt-0"
                [class]="tone[alert.severity].tile"
              >
                <ng-icon [name]="tone[alert.severity].icon" size="16" />
              </span>
              <div class="min-w-0 flex-1 basis-40">
                <p
                  class="flex flex-wrap items-center gap-x-2 text-sm font-medium"
                >
                  {{ alert.title }}
                  <span
                    class="rounded-full px-1.5 py-px text-[10px] font-semibold tracking-wide uppercase"
                    [class]="tone[alert.severity].tile"
                    >{{ tone[alert.severity].label }}</span
                  >
                </p>
                <p class="text-muted-foreground text-xs">{{ alert.detail }}</p>
              </div>
              <div
                class="ms-12 flex w-full shrink-0 items-center gap-1 sm:ms-0 sm:w-auto"
              >
                @if (alert.action.productId) {
                  <button
                    type="button"
                    hlmBtn
                    size="sm"
                    [variant]="
                      alert.severity === 'info' ? 'outline' : 'default'
                    "
                    (click)="
                      modal.open('receive', {
                        productId: alert.action.productId,
                      })
                    "
                  >
                    {{ alert.action.label }}
                  </button>
                } @else {
                  <a routerLink="/stock" hlmBtn size="sm" variant="outline">{{
                    alert.action.label
                  }}</a>
                }
                <button
                  type="button"
                  hlmBtn
                  variant="ghost"
                  size="icon-sm"
                  class="text-muted-foreground"
                  (click)="dismiss(alert.id)"
                  [attr.aria-label]="'Hide until tomorrow: ' + alert.title"
                  title="Hide until tomorrow"
                >
                  <ng-icon name="lucideX" />
                </button>
              </div>
            </li>
          }
        </ul>

        @if (visible().length > limit) {
          <button
            type="button"
            class="text-muted-foreground hover:bg-muted/60 hover:text-foreground w-full border-t px-4 py-2 text-xs font-medium"
            (click)="expanded.update((open) => !open)"
          >
            {{
              expanded()
                ? 'Show fewer'
                : 'Show ' + (visible().length - limit) + ' more'
            }}
          </button>
        }
      </section>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockAlertsComponent {
  private readonly inventory = inject(InventoryStore);
  protected readonly modal = inject(ModalService);
  protected readonly tone = TONE;
  protected readonly limit = VISIBLE_BY_DEFAULT;
  protected readonly expanded = signal(false);
  private readonly dismissed = signal<Set<string>>(readDismissed());

  private readonly alerts = computed<StockAlert[]>(() => {
    const today = todayIsoDate();
    const batches = this.inventory.batches();
    const alerts: StockAlert[] = [];

    for (const product of this.inventory.products()) {
      const onHand = this.inventory.onHandForProduct(product.$id, batches);
      const usable = this.inventory.usableBatches(product.$id, batches, today);
      const usableQty = usable.reduce(
        (sum, batch) => sum + batch.quantityOnHand,
        0,
      );
      const unit = (n: number) =>
        product.unit === 'ml'
          ? `${n} ml`
          : `${n} ${product.unit}${n === 1 ? '' : 's'}`;

      if (usableQty === 0) {
        alerts.push({
          id: `out:${product.$id}`,
          severity: 'critical',
          title: `${product.name} is out of stock`,
          detail:
            onHand > 0
              ? `Only expired stock left (${unit(onHand)})`
              : 'Nothing on hand to vaccinate with',
          action: { label: 'Receive stock', productId: product.$id },
        });
      } else if (usableQty <= product.lowStockThreshold) {
        alerts.push({
          id: `low:${product.$id}`,
          severity: 'warning',
          title: `${product.name} is running low`,
          detail: `${unit(usableQty)} left · you asked to be warned at ${unit(product.lowStockThreshold)}`,
          action: { label: 'Receive stock', productId: product.$id },
        });
      }

      for (const batch of batches.filter(
        (b) => b.productId === product.$id && b.quantityOnHand > 0,
      )) {
        const days = daysUntil(batch.expiryDate, today);
        if (days === null) {
          continue;
        }
        const label = batch.batchNumber
          ? `Batch ${batch.batchNumber}`
          : 'A batch';
        if (days < 0) {
          alerts.push({
            id: `expired:${batch.$id}`,
            severity: 'critical',
            title: `${product.name} has expired stock`,
            detail: `${label} · ${unit(batch.quantityOnHand)} · expired ${formatDay(batch.expiryDate)}. Don't use it.`,
            action: { label: 'Review' },
          });
        } else if (days <= EXPIRY_WINDOW_DAYS) {
          alerts.push({
            id: `expiring:${batch.$id}`,
            severity: 'info',
            title: `${product.name} expires ${days === 0 ? 'today' : days === 1 ? 'tomorrow' : `in ${days} days`}`,
            detail: `${label} · ${unit(batch.quantityOnHand)} · use before ${formatDay(batch.expiryDate)}`,
            action: { label: 'View' },
          });
        }
      }
    }
    return alerts.sort(
      (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity],
    );
  });

  protected readonly visible = computed(() =>
    this.alerts().filter((alert) => !this.dismissed().has(alert.id)),
  );
  protected readonly shown = computed(() =>
    this.expanded()
      ? this.visible()
      : this.visible().slice(0, VISIBLE_BY_DEFAULT),
  );
  protected readonly worst = computed<Severity>(
    () => this.visible()[0]?.severity ?? 'info',
  );
  protected readonly headerTone = computed(() => TONE[this.worst()].tile);

  protected readonly summary = computed(() => {
    const counts = { critical: 0, warning: 0, info: 0 };
    for (const alert of this.visible()) {
      counts[alert.severity]++;
    }
    const parts = [
      counts.critical && `${counts.critical} urgent`,
      counts.warning && `${counts.warning} low`,
      counts.info && `${counts.info} expiring soon`,
    ].filter(Boolean);
    return `Medicine cupboard · ${parts.join(' · ')}`;
  });

  protected dismiss(id: string): void {
    this.dismissed.update((current) => new Set(current).add(id));
    try {
      localStorage.setItem(
        DISMISS_KEY,
        JSON.stringify({ day: todayIsoDate(), ids: [...this.dismissed()] }),
      );
    } catch {
      /* private mode: dismissal lasts for this visit only */
    }
  }
}

/** Dismissals are kept for the current day only, so nothing stays hidden for long. */
function readDismissed(): Set<string> {
  try {
    const saved = JSON.parse(localStorage.getItem(DISMISS_KEY) ?? 'null') as {
      day: string;
      ids: string[];
    } | null;
    return saved?.day === todayIsoDate() ? new Set(saved.ids) : new Set();
  } catch {
    return new Set();
  }
}

function daysUntil(iso: string | undefined, today: string): number | null {
  const target = isoToDate(iso);
  const now = isoToDate(today);
  return target && now
    ? Math.round((target.getTime() - now.getTime()) / 86_400_000)
    : null;
}

function formatDay(iso: string): string {
  return (
    isoToDate(iso)?.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
    }) ?? iso
  );
}
