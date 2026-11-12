import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { HlmSidebarImports } from '@spartan-ng/helm/sidebar';
import { OnlineStore } from '../../core/stores/online.store';

/** Secondary navigation pinned to the bottom of the sidebar: sync status and help. */
@Component({
  selector: 'app-nav-secondary',
  imports: [HlmSidebarImports, NgIcon],
  template: `
    <hlm-sidebar-group>
      <div hlmSidebarGroupContent>
        <ul hlmSidebarMenu>
          <li hlmSidebarMenuItem>
            <button
              type="button"
              hlmSidebarMenuButton
              size="sm"
              class="cursor-default hover:bg-transparent"
              role="status"
            >
              <ng-icon
                [name]="online.online() ? 'lucideCloud' : 'lucideCloudOff'"
              />
              <span>{{
                online.online() ? 'Online · synced' : 'Offline · not saving'
              }}</span>
            </button>
          </li>
          <li hlmSidebarMenuItem>
            <a
              hlmSidebarMenuButton
              size="sm"
              href="mailto:hello@agroherd.co.bw?subject=OmniFarmGrid%20help"
            >
              <ng-icon name="lucideLifeBuoy" />
              <span>Help &amp; support</span>
            </a>
          </li>
          <li hlmSidebarMenuItem>
            <a
              hlmSidebarMenuButton
              size="sm"
              href="mailto:hello@agroherd.co.bw?subject=OmniFarmGrid%20feedback"
            >
              <ng-icon name="lucideSend" />
              <span>Send feedback</span>
            </a>
          </li>
        </ul>
      </div>
    </hlm-sidebar-group>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavSecondaryComponent {
  protected readonly online = inject(OnlineStore);
}
