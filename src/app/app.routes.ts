import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin-guard';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/pages/login-page/login-page').then((m) => m.LoginPage),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/catalog/pages/catalog-page/catalog-page').then((m) => m.CatalogPage),
  },
  {
    path: 'my-loans',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/loans/pages/my-loans-page/my-loans-page').then((m) => m.MyLoansPage),
  },
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./features/admin/pages/admin-page/admin-page').then((m) => m.AdminPage),
  },
  { path: '**', redirectTo: '' },
];
