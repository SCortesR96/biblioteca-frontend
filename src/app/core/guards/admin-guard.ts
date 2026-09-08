import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

/**
 * Restringe rutas al rol ADMIN. Separado de {@link authGuard} a propósito (ver nota ahí):
 * una ruta de admin necesita las dos cosas, así que las combina en su propio arreglo
 * `canActivate` (`[authGuard, adminGuard]`) en vez de que este guard reimplemente la
 * comprobación de sesión.
 */
export const adminGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  return auth.isAdmin() || router.createUrlTree(['/']);
};
