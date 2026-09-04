import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { eventTypeIcon, eventTypeLabel } from '../../core/models/event';
import {
  SPECIES,
  Species,
  speciesAccentClass,
  speciesAvatarClass,
  speciesCopy,
  speciesIconClass,
  speciesLabel,
} from '../../core/models/species';
import { AnimalStore } from '../../core/stores/animal.store';
import { EventStore } from '../../core/stores/event.store';
import { InventoryStore } from '../../core/stores/inventory.store';
import { KraalStore } from '../../core/stores/kraal.store';
import { SpeciesFilterStore } from '../../core/stores/species-filter.store';
import { expiresWithinDays, monthsAgoIsoDate } from '../../core/utils/dates';
import { SpartanUiImports } from '../../core/utils/spartan-ui-imports';

@Component({
  selector: 'fma-dashboard',
  imports: [RouterLink, ...SpartanUiImports],
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  protected readonly kraalStore = inject(KraalStore);
  protected readonly speciesFilterStore = inject(SpeciesFilterStore);
  private readonly animalStore = inject(AnimalStore);
  private readonly eventStore = inject(EventStore);
  private readonly inventoryStore = inject(InventoryStore);
  private readonly router = inject(Router);

  private readonly youngCutoff = monthsAgoIsoDate(6);
  protected readonly speciesName = speciesLabel;
  protected readonly accentClass = speciesAccentClass;
  protected readonly avatarClass = speciesAvatarClass;
  protected readonly iconClass = speciesIconClass;

  protected readonly aliveAnimals = computed(() =>
    this.animalStore
      .animals()
      .filter(
        (animal) =>
          animal.status === 'alive' && this.speciesFilterStore.matches(animal.species),
      ),
  );

  protected readonly speciesRows = computed(() =>
    SPECIES.map((species) => {
      const animals = this.animalStore
        .animals()
        .filter((animal) => animal.status === 'alive' && animal.species === species);
      const copy = speciesCopy(species);
      return {
        species,
        copy,
        count: animals.length,
        females: animals.filter((animal) => animal.sex === 'female').length,
        young: animals.filter(
          (animal) => animal.dateOfBirth && animal.dateOfBirth >= this.youngCutoff,
        ).length,
      };
    }),
  );

  protected readonly kraalCounts = computed(() => {
    const animals = this.aliveAnimals();
    return this.kraalStore
      .kraals()
      .filter((kraal) => this.speciesFilterStore.matches(kraal.species))
      .map((kraal) => ({
        kraal,
        copy: speciesCopy(kraal.species),
        count: animals.filter((animal) => animal.kraalId === kraal.id).length,
      }));
  });

  protected readonly recentEvents = computed(() => this.eventStore.events().slice(0, 6));

  protected readonly lowStock = computed(() => {
    const batches = this.inventoryStore.batches();
    return this.inventoryStore.products().filter((product) => {
      const onHand = this.inventoryStore.onHandForProduct(product.id, batches);
      return onHand <= product.lowStockThreshold;
    });
  });

  protected readonly expiring = computed(() =>
    this.inventoryStore.batches().filter((batch) => expiresWithinDays(batch.expiryDate, 30)),
  );

  protected eventLabel = eventTypeLabel;
  protected eventIcon = eventTypeIcon;

  protected cardClass(species: Species): string {
    const selected = this.speciesFilterStore.selected();
    const dimmed = selected !== 'all' && selected !== species;
    return [
      'fma-list-card h-full',
      this.accentClass(species),
      dimmed ? 'opacity-50' : '',
    ].join(' ');
  }

  protected focusSpecies(species: Species): void {
    this.speciesFilterStore.set(species);
    void this.router.navigate(['/flock']);
  }

  protected birthVerb(): string {
    const selected = this.speciesFilterStore.selected();
    return selected === 'all' ? 'Record birth' : speciesCopy(selected).birthVerb;
  }

  protected productName(productId: string): string {
    return (
      this.inventoryStore.products().find((product) => product.id === productId)?.name ?? 'Stock'
    );
  }
}
