import { patchState, signalStore, withHooks, withState } from '@ngrx/signals';

interface OnlineState {
  online: boolean;
}

export const OnlineStore = signalStore(
  { providedIn: 'root' },
  withState<OnlineState>({ online: navigator.onLine }),
  withHooks((store) => ({
    onInit() {
      window.addEventListener('online', () => patchState(store, { online: true }));
      window.addEventListener('offline', () => patchState(store, { online: false }));
    },
  })),
);

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type OnlineStore = InstanceType<typeof OnlineStore>;
