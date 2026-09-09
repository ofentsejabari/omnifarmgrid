import { patchState, signalStoreFeature, withMethods, withState } from '@ngrx/signals';

export interface RequestState {
  isLoading: boolean;
  error: string;
}

export const initialRequestState: RequestState = {
  isLoading: false,
  error: '',
};


/**
 * SignalStoreFeature provide a mechanism to extend core fuctionality and encapsulating common functionality.
 * This feature allow reuse across multiple stores.
 * @returns SignalStoreFeature
 */
export const withRequestStateFeature = () =>
  signalStoreFeature(
    withState(initialRequestState),
    withMethods((store) => ({
      setLoading(isLoading: boolean): void {
        patchState(store, isLoading ? { isLoading: true, error: '' } : { isLoading: false });
      },
      setError(error: string): void {
        patchState(store, { isLoading: false, error });
      },
      clearError(): void {
        if (store.error()) {
          patchState(store, { error: '' });
        }
      },
    })),
  );
