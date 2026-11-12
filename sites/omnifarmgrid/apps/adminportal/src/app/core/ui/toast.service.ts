import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
}

/** Small confirmation messages ("Birth recorded") after a modal saves. */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 1;
  readonly toasts = signal<Toast[]>([]);

  show(message: string, durationMs = 3500): void {
    const toast = { id: this.nextId++, message };
    this.toasts.update((list) => [...list, toast]);
    setTimeout(() => this.dismiss(toast.id), durationMs);
  }

  dismiss(id: number): void {
    this.toasts.update((list) => list.filter((toast) => toast.id !== id));
  }
}
