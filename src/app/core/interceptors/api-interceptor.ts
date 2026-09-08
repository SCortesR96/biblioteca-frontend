import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { Auth } from '../services/auth';

/**
 * Agrega el token a cada request saliente y, si el backend responde 401 (token vencido o
 * inválido), cierra la sesión local y manda al login — así una sesión vencida nunca deja a
 * la UI mostrando datos obsoletos como si todo estuviera bien.
 */
export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(Auth);
  const router = inject(Router);

  const token = auth.token;
  const authorizedReq = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(authorizedReq).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401 && auth.isAuthenticated()) {
        auth.logout();
        router.navigateByUrl('/login');
      }
      return throwError(() => error);
    }),
  );
};
