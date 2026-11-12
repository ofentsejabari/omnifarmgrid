import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  inject,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';

/**
 * Native-style action sheet for phones: slides up from the bottom, closes on
 * backdrop tap, Escape, or a downward swipe on the grab handle.
 */
@Component({
  selector: 'app-bottom-sheet',
  host: { '(document:keydown.escape)': 'open() && close()' },
  template: `
    @if (open()) {
      <div class="fixed inset-0 z-50 flex items-end" role="presentation">
        <div
          class="fma-sheet-backdrop absolute inset-0 bg-black/40"
          aria-hidden="true"
          (click)="close()"
        ></div>
        <div
          #panel
          class="fma-sheet relative w-full"
          role="dialog"
          aria-modal="true"
          [attr.aria-label]="title()"
          tabindex="-1"
          [style.transform]="dragY() ? 'translateY(' + dragY() + 'px)' : null"
        >
          <div
            class="fma-sheet-handle"
            (pointerdown)="dragStart($event)"
            (pointermove)="dragMove($event)"
            (pointerup)="dragEnd()"
            (pointercancel)="dragEnd()"
          >
            <span></span>
          </div>
          @if (title()) {
            <p
              class="text-muted-foreground px-5 pb-2 text-center text-sm font-medium"
            >
              {{ title() }}
            </p>
          }
          <ng-content />
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BottomSheetComponent {
  readonly open = model(false);
  readonly title = input('');

  protected readonly dragY = signal(0);
  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');
  private readonly body = inject(DOCUMENT).body;
  private startY: number | null = null;

  constructor() {
    effect(() => {
      const isOpen = this.open();
      this.body.style.overflow = isOpen ? 'hidden' : '';
      if (isOpen) {
        setTimeout(() => this.panel()?.nativeElement.focus());
      }
    });
  }

  close(): void {
    this.dragY.set(0);
    this.open.set(false);
  }

  protected dragStart(event: PointerEvent): void {
    this.startY = event.clientY;
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
  }

  protected dragMove(event: PointerEvent): void {
    if (this.startY !== null) {
      this.dragY.set(Math.max(0, event.clientY - this.startY));
    }
  }

  protected dragEnd(): void {
    if (this.startY === null) {
      return;
    }
    this.startY = null;
    if (this.dragY() > 80) {
      this.close();
    } else {
      this.dragY.set(0);
    }
  }
}
