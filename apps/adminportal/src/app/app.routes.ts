import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth/auth.guard';
import { ShellComponent } from './layout/shell.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { AnimalListComponent } from './features/animals/animal-list.component';
import { AnimalFormComponent } from './features/animals/animal-form.component';
import { AnimalDetailComponent } from './features/animals/animal-detail.component';
import { KraalListComponent } from './features/kraals/kraal-list.component';
import { VaccinateKraalComponent } from './features/vaccination/vaccinate-kraal.component';
import { KraalDetailComponent } from './features/kraals/kraal-detail.component';
import { BirthFormComponent } from './features/births/birth-form.component';
import { DeathFormComponent } from './features/deaths/death-form.component';
import { InventoryListComponent } from './features/inventory/inventory-list.component';
import { LoginComponent } from './features/login/login.component';
// import { MorePageComponent } from './features/more/more-page.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [guestGuard],
  },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', component: DashboardComponent },
      { path: 'flock', component: AnimalListComponent },
      { path: 'flock/new', component: AnimalFormComponent },
      { path: 'flock/:id/edit', component: AnimalFormComponent },
      { path: 'flock/:id', component: AnimalDetailComponent },
      { path: 'kraals', component: KraalListComponent },
      { path: 'kraals/:id/vaccinate', component: VaccinateKraalComponent },
      { path: 'kraals/:id', component: KraalDetailComponent },
      { path: 'births/new', component: BirthFormComponent },
      { path: 'deaths/new', component: DeathFormComponent },
      { path: 'stock', component: InventoryListComponent },
      // { path: 'more', component: MorePageComponent },
    ],
  },
];
