import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

// Protege rutas que exigen sesión iniciada. La restricción por rol vive en adminGuard,
// aparte, para no mezclar "¿hay sesión?" con "¿qué rol hace falta?".
export const authGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  return auth.isAuthenticated() || router.createUrlTree(['/login']);
};
