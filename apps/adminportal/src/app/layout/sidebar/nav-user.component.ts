import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { HlmSidebarImports, HlmSidebarService } from '@spartan-ng/helm/sidebar';
import { AuthStore } from '../../core/stores/auth.store';

/** Signed-in farmer, with a menu to sign out. */
@Component({
  selector: 'app-nav-user',
  imports: [
    HlmSidebarImports,
    HlmAvatarImports,
    HlmDropdownMenuImports,
    NgIcon,
  ],
  template: `
    <ul hlmSidebarMenu>
      <li hlmSidebarMenuItem>
        <button
          hlmSidebarMenuButton
          size="lg"
          [hlmDropdownMenuTrigger]="menu"
          [side]="menuSide()"
          align="end"
        >
          <hlm-avatar class="size-8 rounded-lg">
            <span
              hlmAvatarFallback
              class="bg-primary text-primary-foreground rounded-lg text-xs"
            >
              {{ auth.initials() }}
            </span>
          </hlm-avatar>
          <span class="grid flex-1 text-start text-sm leading-tight">
            <span class="truncate font-medium">{{ auth.displayName() }}</span>
            <span class="text-muted-foreground truncate text-xs">{{
              auth.currentUser()?.email
            }}</span>
          </span>
          <ng-icon name="lucideChevronsUpDown" class="ms-auto" />
        </button>
      </li>
    </ul>

    <ng-template #menu>
      <hlm-dropdown-menu class="min-w-56">
        <hlm-dropdown-menu-label>
          <span class="block truncate text-sm font-medium">{{
            auth.displayName()
          }}</span>
          <span
            class="text-muted-foreground block truncate text-xs font-normal"
            >{{ auth.currentUser()?.email }}</span
          >
        </hlm-dropdown-menu-label>
        <hlm-dropdown-menu-separator />
        <button hlmDropdownMenuItem (click)="logout()">
          <ng-icon name="lucideLogOut" />
          Log out
        </button>
      </hlm-dropdown-menu>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavUserComponent {
  protected readonly auth = inject(AuthStore);
  private readonly sidebar = inject(HlmSidebarService);
  protected readonly menuSide = computed(() =>
    this.sidebar.isMobile() ? 'top' : 'right',
  );

  protected async logout(): Promise<void> {
    await this.auth.logout();
    window.location.assign('/login');
  }
}
