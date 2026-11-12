import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth/auth.guard';
import { MODAL_OUTLET } from './core/ui/modal.service';
import { ShellComponent } from './layout/shell.component';

export const routes: Routes = [
  {
    path: 'login',
    title: 'Sign in · OmniFarmGrid',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      // ── Pages ──────────────────────────────────────────
      {
        path: '',
        title: 'Dashboard · OmniFarmGrid',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent,
          ),
      },
      {
        path: 'animals',
        title: 'Animals · OmniFarmGrid',
        loadComponent: () =>
          import('./features/animals/animal-list.component').then(
            (m) => m.AnimalListComponent,
          ),
      },
      {
        path: 'animals/:id',
        title: 'Animal · OmniFarmGrid',
        loadComponent: () =>
          import('./features/animals/animal-detail.component').then(
            (m) => m.AnimalDetailComponent,
          ),
      },
      {
        path: 'kraals',
        title: 'Kraals · OmniFarmGrid',
        loadComponent: () =>
          import('./features/kraals/kraal-list.component').then(
            (m) => m.KraalListComponent,
          ),
      },
      {
        path: 'kraals/:id',
        title: 'Kraal · OmniFarmGrid',
        loadComponent: () =>
          import('./features/kraals/kraal-detail.component').then(
            (m) => m.KraalDetailComponent,
          ),
      },
      {
        path: 'stock',
        title: 'Stock · OmniFarmGrid',
        loadComponent: () =>
          import('./features/inventory/inventory-list.component').then(
            (m) => m.InventoryListComponent,
          ),
      },
      // Old links
      { path: 'flock', redirectTo: 'animals' },
      { path: 'flock/:id', redirectTo: 'animals/:id' },

      // ── Popups (see ModalService) ──────────────────────
      {
        path: 'animal',
        outlet: MODAL_OUTLET,
        loadComponent: () =>
          import('./features/animals/animal-form.component').then(
            (m) => m.AnimalFormComponent,
          ),
      },
      {
        path: 'kraal',
        outlet: MODAL_OUTLET,
        loadComponent: () =>
          import('./features/kraals/kraal-form.component').then(
            (m) => m.KraalFormComponent,
          ),
      },
      {
        path: 'birth',
        outlet: MODAL_OUTLET,
        loadComponent: () =>
          import('./features/births/birth-form.component').then(
            (m) => m.BirthFormComponent,
          ),
      },
      {
        path: 'death',
        outlet: MODAL_OUTLET,
        loadComponent: () =>
          import('./features/deaths/death-form.component').then(
            (m) => m.DeathFormComponent,
          ),
      },
      {
        path: 'vaccinate',
        outlet: MODAL_OUTLET,
        loadComponent: () =>
          import('./features/vaccination/vaccinate-kraal.component').then(
            (m) => m.VaccinateKraalComponent,
          ),
      },
      {
        path: 'product',
        outlet: MODAL_OUTLET,
        loadComponent: () =>
          import('./features/inventory/product-form.component').then(
            (m) => m.ProductFormComponent,
          ),
      },
      {
        path: 'receive',
        outlet: MODAL_OUTLET,
        loadComponent: () =>
          import('./features/inventory/receive-stock-form.component').then(
            (m) => m.ReceiveStockFormComponent,
          ),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
