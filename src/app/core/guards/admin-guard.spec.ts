import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CanActivateFn, provideRouter, Router, UrlTree } from '@angular/router';
import { adminGuard } from './admin-guard';

const STORAGE_KEY = 'biblioteca.auth';

describe('adminGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => adminGuard(...guardParameters));

  afterEach(() => {
    localStorage.removeItem(STORAGE_KEY);
  });

  function configure(): void {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
  }

  it('allows navigation when the user is an ADMIN', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ token: 'valid-token', user: { name: 'Admin', email: 'admin@biblioteca.com', role: 'ADMIN' } }),
    );
    configure();

    const result = executeGuard({} as never, {} as never);

    expect(result).toBe(true);
  });

  it('redirects to / when the user is not an ADMIN', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ token: 'valid-token', user: { name: 'Ana', email: 'ana@biblioteca.com', role: 'BIBLIOTECARIO' } }),
    );
    configure();

    const result = executeGuard({} as never, {} as never);

    expect(result).not.toBe(true);
    const router = TestBed.inject(Router);
    expect((result as UrlTree).toString()).toBe(router.createUrlTree(['/']).toString());
  });

  it('redirects to / when there is no session at all', () => {
    configure();

    const result = executeGuard({} as never, {} as never);

    expect(result).not.toBe(true);
  });
});
