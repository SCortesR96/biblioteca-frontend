import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { Auth } from './auth';
import type { AuthResponse } from './auth.types';

const STORAGE_KEY = 'biblioteca.auth';

const sampleResponse: AuthResponse = {
  token: 'jwt-token-abc',
  name: 'Ana',
  email: 'ana@biblioteca.com',
  role: 'BIBLIOTECARIO',
};

describe('Auth', () => {
  let service: Auth;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEY);
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(Auth);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.removeItem(STORAGE_KEY);
  });

  it('starts unauthenticated when there is nothing in storage', () => {
    expect(service.isAuthenticated()).toBe(false);
    expect(service.currentUser()).toBeNull();
    expect(service.token).toBeNull();
  });

  it('login() stores the session and exposes it via signals', () => {
    service.login({ email: sampleResponse.email, password: 'password123' }).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    req.flush(sampleResponse);

    expect(service.isAuthenticated()).toBe(true);
    expect(service.token).toBe('jwt-token-abc');
    expect(service.currentUser()).toEqual({ name: 'Ana', email: sampleResponse.email, role: 'BIBLIOTECARIO' });
    expect(service.isAdmin()).toBe(false);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).token).toBe('jwt-token-abc');
  });

  it('register() also stores the session (auto-login after registering)', () => {
    service.register({ name: 'Ana', email: sampleResponse.email, password: 'password123' }).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/register`);
    expect(req.request.method).toBe('POST');
    req.flush(sampleResponse);

    expect(service.isAuthenticated()).toBe(true);
  });

  it('isAdmin() reflects the ADMIN role', () => {
    service.login({ email: 'admin@biblioteca.com', password: 'x' }).subscribe();
    httpMock.expectOne(`${environment.apiUrl}/auth/login`).flush({ ...sampleResponse, role: 'ADMIN' });

    expect(service.isAdmin()).toBe(true);
  });

  it('logout() clears the signal state and storage', () => {
    service.login({ email: sampleResponse.email, password: 'password123' }).subscribe();
    httpMock.expectOne(`${environment.apiUrl}/auth/login`).flush(sampleResponse);

    service.logout();

    expect(service.isAuthenticated()).toBe(false);
    expect(service.currentUser()).toBeNull();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('restores the session from storage on a fresh service instance', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ token: 'stored-token', user: { name: 'Ana', email: sampleResponse.email, role: 'ADMIN' } }),
    );

    const freshService = TestBed.inject(Auth); // mismo singleton en este TestBed; probamos lectura directa
    expect(freshService).toBeTruthy();

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    const rehydrated = TestBed.inject(Auth);

    expect(rehydrated.isAuthenticated()).toBe(true);
    expect(rehydrated.token).toBe('stored-token');
    expect(rehydrated.isAdmin()).toBe(true);
  });
});
