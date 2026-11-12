import { DOCUMENT } from '@angular/common';
import {
  computed,
  DestroyRef,
  effect,
  inject,
  Injectable,
  signal,
} from '@angular/core';

export type ThemePreference = 'light' | 'dark' | 'system';

/** Keep in sync with the inline script in index.html, which applies the theme before Angular starts. */
const STORAGE_KEY = 'ofg-theme';
/** Browser/status bar colours: the page background of each theme. */
const BAR_COLOR = { light: '#ffffff', dark: '#0d1412' } as const;

const readPreference = (): ThemePreference => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored;
    }
  } catch {
    /* private mode */
  }
  return 'system';
};

/** Light, dark or follow the device. Applies the `dark` class to <html>. */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly media = this.document.defaultView?.matchMedia(
    '(prefers-color-scheme: dark)',
  );
  private readonly systemDark = signal(this.media?.matches ?? false);

  readonly preference = signal<ThemePreference>(readPreference());
  readonly resolved = computed<'light' | 'dark'>(() => {
    const preference = this.preference();
    if (preference === 'system') {
      return this.systemDark() ? 'dark' : 'light';
    }
    return preference;
  });

  constructor() {
    const onChange = (event: MediaQueryListEvent) =>
      this.systemDark.set(event.matches);
    this.media?.addEventListener('change', onChange);
    inject(DestroyRef).onDestroy(() =>
      this.media?.removeEventListener('change', onChange),
    );

    effect(() => {
      const theme = this.resolved();
      const root = this.document.documentElement;
      root.classList.toggle('dark', theme === 'dark');
      root.style.colorScheme = theme;
      this.document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute('content', BAR_COLOR[theme]);
    });
  }

  set(preference: ThemePreference): void {
    this.preference.set(preference);
    try {
      localStorage.setItem(STORAGE_KEY, preference);
    } catch {
      /* private mode */
    }
  }
}
