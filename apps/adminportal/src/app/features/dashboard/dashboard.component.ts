import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import {
  deathReasonLabel,
  eventTypeIcon,
  eventTypeLabel,
  FlockEventRow,
} from '../../core/models/event';
import {
  SPECIES,
  speciesChartColor,
  speciesLabel,
  speciesVocabulary,
} from '../../core/models/species';
import { AnimalStore } from '../../core/stores/animal.store';
import { EventStore } from '../../core/stores/event.store';
import { InventoryStore } from '../../core/stores/inventory.store';
import { KraalStore } from '../../core/stores/kraal.store';
import { SpeciesFilterStore } from '../../core/stores/species-filter.store';
import {
  BarChartComponent,
  BarSeries,
} from '../../core/ui/charts/bar-chart.component';
import {
  DonutChartComponent,
  DonutSlice,
} from '../../core/ui/charts/donut-chart.component';
import { SpeciesAvatarComponent } from '../../core/ui/species-avatar.component';
import { StockAlertsComponent } from './stock-alerts.component';
import { daysAgoIsoDate, friendlyDate } from '../../core/utils/dates';

const MONTHS_SHOWN = 6;

@Component({
  selector: 'fma-dashboard',
  imports: [
    RouterLink,
    NgIcon,
    DonutChartComponent,
    BarChartComponent,
    SpeciesAvatarComponent,
    StockAlertsComponent,
  ],
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  private readonly animalStore = inject(AnimalStore);
  private readonly eventStore = inject(EventStore);
  private readonly inventoryStore = inject(InventoryStore);
  private readonly kraalStore = inject(KraalStore);
  private readonly speciesFilter = inject(SpeciesFilterStore);

  protected readonly todayLabel = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  protected readonly when = friendlyDate;
  protected readonly eventLabel = eventTypeLabel;
  protected readonly eventIcon = eventTypeIcon;

  protected readonly scopeLabel = computed(() => {
    const selected = this.speciesFilter.selected();
    return selected === 'all'
      ? 'All animals'
      : speciesVocabulary(selected).plural.replace(/^./, (c) =>
          c.toUpperCase(),
        );
  });
  protected readonly scopeSuffix = computed(() =>
    this.speciesFilter.selected() === 'all'
      ? ''
      : ` · ${this.scopeLabel().toLowerCase()}`,
  );

  // ── Data ───────────────────────────────────────────────
  protected readonly aliveAll = computed(() =>
    this.animalStore.herd().filter((a) => a.status === 'alive'),
  );
  private readonly alive = computed(() =>
    this.aliveAll().filter((a) => this.speciesFilter.matches(a.species)),
  );

  /** Events limited to the selected species (via the kraal they happened in). */
  private readonly events = computed(() => {
    if (this.speciesFilter.selected() === 'all') {
      return this.eventStore.events();
    }
    const kraals = new Set(
      this.kraalStore
        .kraals()
        .filter((k) => this.speciesFilter.matches(k.species))
        .map((k) => k.$id),
    );
    return this.eventStore
      .events()
      .filter((event) => 'kraalId' in event && kraals.has(event.kraalId));
  });

  private readonly lastMonth = computed(() => {
    const since = daysAgoIsoDate(30);
    return this.events().filter((event) => event.date >= since);
  });

  protected readonly kpis = computed(() => {
    const month = this.lastMonth();
    const born = month.reduce(
      (sum, e) => sum + (e.type === 'birth' ? e.kidIds.length : 0),
      0,
    );
    const lost = month.filter((e) => e.type === 'death').length;
    const treated = month.reduce(
      (sum, e) =>
        sum + (e.type === 'treatment' ? e.treatedAnimalIds.length : 0),
      0,
    );
    const females = this.alive().filter((a) => a.sex === 'female').length;
    return [
      {
        label: 'Animals',
        value: this.alive().length,
        hint: `${females} female`,
        icon: 'lucidePawPrint',
        tone: 'bg-secondary text-primary',
      },
      {
        label: 'Born',
        value: born,
        hint: 'Last 30 days',
        icon: 'lucideBaby',
        tone: 'bg-info text-info-foreground',
      },
      {
        label: 'Lost',
        value: lost,
        hint: 'Last 30 days',
        icon: 'lucideHeartOff',
        tone: 'bg-destructive/10 text-destructive',
      },
      {
        label: 'Vaccinated',
        value: treated,
        hint: 'Last 30 days',
        icon: 'lucideSyringe',
        tone: 'bg-warning text-warning-foreground',
      },
    ];
  });

  protected readonly speciesSlices = computed<DonutSlice[]>(() =>
    SPECIES.map((species) => ({
      label: speciesLabel(species),
      value: this.aliveAll().filter((a) => a.species === species).length,
      color: speciesChartColor(species),
    })),
  );

  protected readonly monthly = computed<{
    labels: string[];
    series: BarSeries[];
  }>(() => {
    const now = new Date();
    const months = Array.from({ length: MONTHS_SHOWN }, (_, i) => {
      const date = new Date(
        now.getFullYear(),
        now.getMonth() - (MONTHS_SHOWN - 1 - i),
        1,
      );
      return {
        key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
        label: date.toLocaleDateString('en-GB', { month: 'short' }),
      };
    });
    const count = (type: 'birth' | 'death') =>
      months.map(({ key }) =>
        this.events()
          .filter((e) => e.type === type && e.date.startsWith(key))
          .reduce(
            (sum, e) => sum + (e.type === 'birth' ? e.kidIds.length : 1),
            0,
          ),
      );
    return {
      labels: months.map((m) => m.label),
      series: [
        { name: 'Born', color: 'var(--chart-births)', values: count('birth') },
        { name: 'Died', color: 'var(--chart-deaths)', values: count('death') },
      ],
    };
  });

  protected readonly kraalBars = computed(() => {
    const alive = this.alive();
    const rows = this.kraalStore
      .kraals()
      .filter((kraal) => this.speciesFilter.matches(kraal.species))
      .map((kraal) => ({
        id: kraal.$id,
        name: kraal.name,
        species: kraal.species,
        color: speciesChartColor(kraal.species),
        count: alive.filter((a) => a.kraalId === kraal.$id).length,
      }))
      .sort((a, b) => b.count - a.count);
    const max = Math.max(1, ...rows.map((row) => row.count));
    return rows.map((row) => ({ ...row, share: (row.count / max) * 100 }));
  });

  protected readonly recentEvents = computed(() => this.events().slice(0, 6));

  protected eventTone(type: FlockEventRow['type']): string {
    return {
      birth: 'bg-info text-info-foreground',
      death: 'bg-destructive/10 text-destructive',
      treatment: 'bg-warning text-warning-foreground',
      move: 'bg-muted text-muted-foreground',
    }[type];
  }

  protected eventDetail(event: FlockEventRow): string {
    const kraal = (id: string) =>
      this.kraalStore.kraals().find((k) => k.$id === id)?.name ?? '';
    const join = (...parts: string[]) => parts.filter(Boolean).join(' · ');
    switch (event.type) {
      case 'birth':
        return join(`${event.kidIds.length} born`, kraal(event.kraalId));
      case 'death':
        return join(deathReasonLabel(event.reason), kraal(event.kraalId));
      case 'treatment':
        return join(
          this.productName(event.productId),
          `${event.treatedAnimalIds.length} animals`,
          kraal(event.kraalId),
        );
      case 'move':
        return kraal(event.toKraalId)
          ? `To ${kraal(event.toKraalId)}`
          : 'Between kraals';
    }
  }

  private productName(productId: string): string {
    return (
      this.inventoryStore.products().find((p) => p.$id === productId)?.name ??
      'Stock'
    );
  }
}
