import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { HlmSidebarImports } from '@spartan-ng/helm/sidebar';
import { RecordAction } from '../record-actions';

/** Quick "record something" actions; each opens a popup form. */
@Component({
  selector: 'app-nav-record',
  imports: [HlmSidebarImports, NgIcon],
  template: `
    <hlm-sidebar-group>
      <div hlmSidebarGroupLabel>Record</div>
      <ul hlmSidebarMenu>
        @for (action of actions(); track action.modal) {
          <li hlmSidebarMenuItem>
            <button hlmSidebarMenuButton (click)="action.run()">
              <ng-icon [name]="action.icon" />
              <span>{{ action.label }}</span>
            </button>
          </li>
        }
      </ul>
    </hlm-sidebar-group>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavRecordComponent {
  readonly actions = input.required<RecordAction[]>();
}
