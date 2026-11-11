import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterOutlet,
} from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { HlmBreadcrumbImports } from '@spartan-ng/helm/breadcrumb';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { HlmSeparatorImports } from '@spartan-ng/helm/separator';
import { HlmSidebarImports } from '@spartan-ng/helm/sidebar';
import { filter, map } from 'rxjs';
import { LIST_PAGE_SIZE } from '../core/data/appwrite-client.service';
import { animalLabel } from '../core/models/animal';
import { isSpecies, SPECIES, speciesLabel } from '../core/models/species';
import { AnimalStore } from '../core/stores/animal.store';
import { KraalStore } from '../core/stores/kraal.store';
import { SpeciesFilterStore } from '../core/stores/species-filter.store';
import { AppLogoComponent } from '../core/ui/app-logo.component';
import { ModalHostComponent } from '../core/ui/modal-host.component';
import { SelectFieldComponent } from '../core/ui/select-field.component';
import { ToasterComponent } from '../core/ui/toaster.component';
import { RecordActions } from './record-actions';
import { NavItem, NavMainComponent } from './sidebar/nav-main.component';
import { NavRecordComponent } from './sidebar/nav-record.component';
import { NavSecondaryComponent } from './sidebar/nav-secondary.component';
import { NavUserComponent } from './sidebar/nav-user.component';

interface Crumb {
  label: string;
  url: string;
}

const SECTIONS: Record<string, string> = {
  '': 'Dashboard',
  animals: 'Animals',
  kraals: 'Kraals & pens',
  stock: 'Stock',
};

/** App frame: Spartan inset sidebar (spartan.ng/blocks/sidebar#sidebar-2) around the routed page. */
@Component({
  selector: 'app-shell',
  imports: [
    RouterOutlet,
    RouterLink,
    NgIcon,
    HlmSidebarImports,
    HlmBreadcrumbImports,
    HlmSeparatorImports,
    HlmButtonImports,
    HlmDropdownMenuImports,
    AppLogoComponent,
    SelectFieldComponent,
    ModalHostComponent,
    ToasterComponent,
    NavMainComponent,
    NavRecordComponent,
    NavSecondaryComponent,
    NavUserComponent,
  ],
  templateUrl: './shell.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShellComponent {
  protected readonly speciesFilter = inject(SpeciesFilterStore);
  protected readonly record = inject(RecordActions);
  private readonly router = inject(Router);
  private readonly animalStore = inject(AnimalStore);
  private readonly kraalStore = inject(KraalStore);

  protected readonly navItems: NavItem[] = [
    {
      title: 'Dashboard',
      url: '/',
      icon: 'lucideLayoutDashboard',
      exact: true,
    },
    { title: 'Animals', url: '/animals', icon: 'lucidePawPrint' },
    { title: 'Kraals & pens', url: '/kraals', icon: 'lucideFence' },
    { title: 'Stock', url: '/stock', icon: 'lucidePackage' },
  ];

  protected readonly speciesOptions = [
    { value: 'all', label: 'All animals' },
    ...SPECIES.map((species) => ({
      value: species,
      label: speciesLabel(species),
    })),
  ];

  /** Primary-outlet path segments of the current URL, e.g. ['animals', 'a1']. */
  private readonly segments = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.pageSegments()),
    ),
    { initialValue: this.pageSegments() },
  );

  protected readonly breadcrumbs = computed<Crumb[]>(() => {
    const [section = '', id] = this.segments();
    const crumbs: Crumb[] = [
      { label: SECTIONS[section] ?? 'Dashboard', url: `/${section}` },
    ];
    if (id) {
      crumbs.push({
        label: this.recordName(section, id),
        url: `/${section}/${id}`,
      });
    }
    return crumbs;
  });

  constructor() {
    // Kraal names are needed on almost every screen and in every form.
    void this.kraalStore.setPage({ page: 1, limit: LIST_PAGE_SIZE });
  }

  protected setFilter(value: string): void {
    this.speciesFilter.set(isSpecies(value) ? value : 'all');
  }

  private recordName(section: string, id: string): string {
    if (section === 'animals') {
      const animal = this.animalStore.herd().find((item) => item.$id === id);
      return animal ? animalLabel(animal) : 'Animal';
    }
    if (section === 'kraals') {
      return (
        this.kraalStore.kraals().find((item) => item.$id === id)?.name ??
        this.kraalStore.kraal()?.name ??
        'Kraal'
      );
    }
    return id;
  }

  private pageSegments(): string[] {
    const primary = this.router.parseUrl(this.router.url).root.children[
      'primary'
    ];
    return primary?.segments.map((segment) => segment.path) ?? [];
  }
}
