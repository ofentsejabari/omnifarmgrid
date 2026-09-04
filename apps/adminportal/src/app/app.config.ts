import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHlmDatePickerConfig } from '@spartan-ng/helm/date-picker';
import { provideSpartanHlm } from '@spartan-ng/helm/utils';
import { routes } from './app.routes';
import { dateToIso, isoToDate } from './core/utils/dates';
import { provideLucideIcons } from './core/utils/lucide-icons';

const formatPickerDate = (date: Date): string =>
  date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideLucideIcons(),
    provideSpartanHlm(),
    provideHlmDatePickerConfig<Date>({
      autoCloseOnSelect: true,
      formatDate: formatPickerDate,
      formatInputDate: dateToIso,
      parseDate: (value: string) => {
        const iso = isoToDate(value.trim());
        if (iso) {
          return iso;
        }
        const parsed = new Date(value);
        return Number.isNaN(parsed.getTime()) ? null : parsed;
      },
    }),
  ],
};
