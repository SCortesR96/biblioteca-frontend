import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Auth } from '../services/auth';
import { apiInterceptor } from './api-interceptor';

describe('apiInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let authStub: { token: string | null; isAuthenticated: () => boolean; logout: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    authStub = { token: null, isAuthenticated: () => false, logout: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([apiInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: Auth, useValue: authStub },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('does not add an Authorization header when there is no token', () => {
    http.get('/api/books').subscribe();

    const req = httpMock.expectOne('/api/books');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('adds the Bearer token when one is present', () => {
    authStub.token = 'jwt-abc';

    http.get('/api/books').subscribe();

    const req = httpMock.expectOne('/api/books');
    expect(req.request.headers.get('Authorization')).toBe('Bearer jwt-abc');
    req.flush({});
  });

  it('logs out and redirects to /login on a 401 while a session was active', () => {
    authStub.token = 'jwt-expirado';
    authStub.isAuthenticated = () => true;
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigateByUrl');

    http.get('/api/loans/mine').subscribe({ error: () => {} });

    httpMock.expectOne('/api/loans/mine').flush('no autorizado', { status: 401, statusText: 'Unauthorized' });

    expect(authStub.logout).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith('/login');
  });

  it('does not force logout on a 401 when there was no active session (e.g. wrong login credentials)', () => {
    authStub.isAuthenticated = () => false;

    http.get('/api/whatever').subscribe({ error: () => {} });

    httpMock.expectOne('/api/whatever').flush('no autorizado', { status: 401, statusText: 'Unauthorized' });

    expect(authStub.logout).not.toHaveBeenCalled();
  });
});
