import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideSpartanHlm } from '@spartan-ng/helm/utils';
import { appRoutes } from './app.routes';
import { provideLucideIcons } from './core/utils/lucide-icons';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      appRoutes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
        anchorScrolling: 'enabled',
      }),
    ),
    provideLucideIcons(),
    provideSpartanHlm(),
  ],
};
