import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CanActivateFn, provideRouter, Router, UrlTree } from '@angular/router';
import { authGuard } from './auth-guard';

const STORAGE_KEY = 'biblioteca.auth';

describe('authGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => authGuard(...guardParameters));

  afterEach(() => {
    localStorage.removeItem(STORAGE_KEY);
  });

  function configure(): void {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
  }

  it('allows navigation when the user is authenticated', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ token: 'valid-token', user: { name: 'Ana', email: 'ana@biblioteca.com', role: 'BIBLIOTECARIO' } }),
    );
    configure();

    const result = executeGuard({} as never, {} as never);

    expect(result).toBe(true);
  });

  it('redirects to /login when the user is not authenticated', () => {
    configure();

    const result = executeGuard({} as never, {} as never);

    expect(result).not.toBe(true);
    const router = TestBed.inject(Router);
    expect((result as UrlTree).toString()).toBe(router.createUrlTree(['/login']).toString());
  });
});
