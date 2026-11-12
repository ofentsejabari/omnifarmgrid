import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { ThemeService } from './core/ui/theme.service';
import { provideLucideIcons } from './core/utils/lucide-icons';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideLucideIcons(),
    // Start the theme service at boot so the sign-in page follows it too.
    provideAppInitializer(() => void inject(ThemeService)),
  ],
};
