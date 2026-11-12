import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { MODAL_OUTLET, ModalService } from './modal.service';

/**
 * Renders whatever is routed into the `modal` outlet as a popup.
 *
 * Not a native <dialog>: a modal dialog sits in the browser's top layer, which would hide
 * Spartan's select and date-picker overlays (they render in the CDK overlay container).
 */
@Component({
  selector: 'app-modal-host',
  imports: [RouterOutlet, NgIcon],
  host: { '(document:keydown.escape)': 'onEscape()' },
  template: `
    <div
      class="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
      [hidden]="!open()"
    >
      <div
        class="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
        aria-hidden="true"
        (click)="modal.close()"
      ></div>
      <div
        #panel
        class="fma-dialog relative"
        role="dialog"
        aria-modal="true"
        tabindex="-1"
      >
        <router-outlet
          [name]="outlet"
          (activate)="show()"
          (deactivate)="hide()"
        />
        <button
          type="button"
          class="text-muted-foreground hover:bg-muted hover:text-foreground absolute end-3 top-3 z-10 inline-flex size-9
            items-center justify-center rounded-lg transition-colors"
          aria-label="Close"
          (click)="modal.close()"
        >
          <ng-icon name="lucideX" size="18" />
        </button>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalHostComponent {
  protected readonly modal = inject(ModalService);
  protected readonly outlet = MODAL_OUTLET;
  protected readonly open = signal(false);
  private readonly panel = viewChild.required<ElementRef<HTMLElement>>('panel');
  private readonly body = inject(DOCUMENT).body;
  private returnFocus: HTMLElement | null = null;

  protected show(): void {
    this.returnFocus = document.activeElement as HTMLElement | null;
    this.open.set(true);
    this.body.style.overflow = 'hidden';
    // Focus the first field once the form has rendered.
    setTimeout(() => {
      const panel = this.panel().nativeElement;
      const first = panel.querySelector<HTMLElement>(
        'input, textarea, button[hlmBtn], [data-slot=select-trigger] button, button',
      );
      (first ?? panel).focus();
    });
  }

  protected hide(): void {
    this.open.set(false);
    this.body.style.overflow = '';
    this.returnFocus?.focus();
  }

  protected onEscape(): void {
    // Let an open select/date-picker overlay handle Escape first.
    if (this.open() && !document.querySelector('.cdk-overlay-pane')) {
      void this.modal.close();
    }
  }
}
