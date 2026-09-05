import { makeEnvironmentProviders, type EnvironmentProviders } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import {
  lucideArrowRight,
  lucideBaby,
  lucideCircleCheck,
  lucideClipboardList,
  lucideDownload,
  lucideFence,
  lucideHeartPulse,
  lucideHouse,
  lucideInbox,
  lucideMail,
  lucideMapPin,
  lucideMenu,
  lucideNotebookPen,
  lucidePackage,
  lucidePawPrint,
  lucidePhone,
  lucideSend,
  lucideShield,
  lucideSprout,
  lucideSyringe,
  lucideWifiOff,
  lucideX,
} from '@ng-icons/lucide';

export const LUCIDE_ICONS = {
  lucideArrowRight,
  lucideBaby,
  lucideCircleCheck,
  lucideClipboardList,
  lucideDownload,
  lucideFence,
  lucideHeartPulse,
  lucideHouse,
  lucideInbox,
  lucideMail,
  lucideMapPin,
  lucideMenu,
  lucideNotebookPen,
  lucidePackage,
  lucidePawPrint,
  lucidePhone,
  lucideSend,
  lucideShield,
  lucideSprout,
  lucideSyringe,
  lucideWifiOff,
  lucideX,
};

export const provideLucideIcons = (): EnvironmentProviders =>
  makeEnvironmentProviders(provideIcons(LUCIDE_ICONS));
