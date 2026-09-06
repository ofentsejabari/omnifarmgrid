import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SPECIES, speciesVocabulary, speciesLabel } from '../core/models/species';
import { AuthStore } from '../core/stores/auth.store';
import { OnlineStore } from '../core/stores/online.store';
import { SpeciesFilter, SpeciesFilterStore } from '../core/stores/species-filter.store';
import { SpartanUiImports } from '../core/utils/spartan-ui-imports';
import { BrandMarkComponent } from './brand-mark.component';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, BrandMarkComponent, ...SpartanUiImports],
  templateUrl: './shell.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShellComponent {
  protected readonly authStore = inject(AuthStore);
  protected readonly onlineStore = inject(OnlineStore);
  protected readonly speciesFilterStore = inject(SpeciesFilterStore);

  protected readonly species = SPECIES;
  protected readonly vocabulary = speciesVocabulary;
  protected readonly speciesName = speciesLabel;
  protected readonly navItems = [
    { path: '/', icon: 'lucideHouse', label: 'Home', exact: true },
    { path: '/flock', icon: 'lucidePawPrint', label: 'Animals', exact: false },
    { path: '/kraals', icon: 'lucideFence', label: 'Kraals', exact: false },
    { path: '/stock', icon: 'lucideSyringe', label: 'Stock', exact: false },
    { path: '/more', icon: 'lucideEllipsis', label: 'More', exact: false },
  ] as const;

  protected setFilter(filter: SpeciesFilter): void {
    this.speciesFilterStore.set(filter);
  }

  protected chipClass(filter: SpeciesFilter): string {
    const active = this.speciesFilterStore.selected() === filter;
    return active
      ? 'bg-primary text-primary-foreground shadow-sm'
      : 'text-muted-foreground hover:bg-background hover:text-foreground';
  }

  protected async logout(): Promise<void> {
    await this.authStore.logout();
    window.location.assign('/login');
  }
}
