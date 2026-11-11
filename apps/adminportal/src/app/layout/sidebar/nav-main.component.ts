import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { HlmSidebarImports } from '@spartan-ng/helm/sidebar';

export interface NavItem {
  title: string;
  url: string;
  icon: string;
  exact?: boolean;
}

/** Primary sections of the app. */
@Component({
  selector: 'app-nav-main',
  imports: [HlmSidebarImports, NgIcon, RouterLink, RouterLinkActive],
  template: `
    <hlm-sidebar-group>
      <div hlmSidebarGroupLabel>Farm</div>
      <ul hlmSidebarMenu>
        @for (item of items(); track item.url) {
          <li hlmSidebarMenuItem>
            <a
              hlmSidebarMenuButton
              [routerLink]="item.url"
              routerLinkActive
              #link="routerLinkActive"
              [routerLinkActiveOptions]="{ exact: item.exact ?? false }"
              [isActive]="link.isActive"
              [attr.aria-current]="link.isActive ? 'page' : null"
            >
              <ng-icon [name]="item.icon" />
              <span>{{ item.title }}</span>
            </a>
          </li>
        }
      </ul>
    </hlm-sidebar-group>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavMainComponent {
  readonly items = input.required<NavItem[]>();
}
