import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

/**
 * Protege rutas que exigen sesión iniciada. La restricción por rol (solo ADMIN) llega en
 * la fase del panel de administración, con un guard aparte — mezclar ambos aquí obligaría
 * a cada ruta a declarar qué rol necesita incluso cuando solo le importa "¿hay sesión?".
 */
export const authGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  return auth.isAuthenticated() || router.createUrlTree(['/login']);
};
