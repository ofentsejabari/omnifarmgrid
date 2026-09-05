import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { NAV_LINKS, SITE_CONTACT_EMAIL, SITE_LOCATION, SITE_NAME, SPECIES } from '../core/content/site';
import { SpartanUiImports } from '../core/utils/spartan-ui-imports';

@Component({
  selector: 'app-site-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ...SpartanUiImports],
  templateUrl: './site-shell.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteShellComponent {
  private readonly router = inject(Router);

  protected readonly name = SITE_NAME;
  protected readonly email = SITE_CONTACT_EMAIL;
  protected readonly location = SITE_LOCATION;
  protected readonly navLinks = NAV_LINKS;
  protected readonly species = SPECIES;
  protected readonly year = new Date().getFullYear();
  protected readonly menuOpen = signal(false);

  constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.menuOpen.set(false));
  }

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }
}
