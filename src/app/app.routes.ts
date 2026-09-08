import { Routes } from '@angular/router';
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
    path: 'mis-prestamos',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/loans/pages/my-loans-page/my-loans-page').then((m) => m.MyLoansPage),
  },
  { path: '**', redirectTo: '' },
];
