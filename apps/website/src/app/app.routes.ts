import { Route } from '@angular/router';
import { SiteShellComponent } from './layout/site-shell.component';

export const appRoutes: Route[] = [
  {
    path: '',
    component: SiteShellComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePage),
        title: 'AgroHerd — Farm records for goats, sheep and pigs',
      },
      {
        path: 'livestock',
        loadComponent: () => import('./pages/livestock/livestock.page').then((m) => m.LivestockPage),
        title: 'Livestock — goats, sheep and pigs | AgroHerd',
      },
      {
        path: 'features',
        loadComponent: () => import('./pages/features/features.page').then((m) => m.FeaturesPage),
        title: 'Features | AgroHerd Farm Manager',
      },
      {
        path: 'about',
        loadComponent: () => import('./pages/about/about.page').then((m) => m.AboutPage),
        title: 'About AgroHerd',
      },
      {
        path: 'contact',
        loadComponent: () => import('./pages/contact/contact.page').then((m) => m.ContactPage),
        title: 'Contact AgroHerd',
      },
      {
        path: '**',
        loadComponent: () => import('./pages/not-found/not-found.page').then((m) => m.NotFoundPage),
        title: 'Page not found | AgroHerd',
      },
    ],
  },
];
