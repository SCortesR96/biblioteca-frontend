import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { Admin } from './admin';
import type { ActivityLogPage, AdminStats, ErrorLogPage, ManagedUser } from './admin.types';
import type { LoanItem } from './loan.types';

const stats: AdminStats = {
  prestamosActivos: 5,
  prestamosVencidos: 1,
  reservasActivas: 2,
  cuentasBloqueadas: 1,
};
const user: ManagedUser = {
  id: 1,
  name: 'Ana',
  email: 'ana@biblioteca.com',
  role: 'BIBLIOTECARIO',
  blockedUntil: null,
  blocked: false,
  createdAt: '2026-01-01T00:00:00Z',
};
const logPage: ErrorLogPage = {
  content: [
    {
      id: 1,
      level: 'ERROR',
      message: 'boom',
      exceptionType: null,
      path: null,
      httpMethod: null,
      createdAt: '2026-06-15T00:00:00Z',
    },
  ],
  totalElements: 1,
  totalPages: 1,
  number: 0,
  size: 20,
};

describe('Admin (service)', () => {
  let service: Admin;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(Admin);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('loadStats() populates the stats signal on success', () => {
    service.loadStats();

    httpMock.expectOne(`${environment.apiUrl}/admin/stats`).flush(stats);

    expect(service.stats()).toEqual(stats);
    expect(service.loading()).toBe(false);
  });

  it('loadStats() sets an error message on failure', () => {
    service.loadStats();

    httpMock
      .expectOne(`${environment.apiUrl}/admin/stats`)
      .flush('error', { status: 500, statusText: 'Server Error' });

    expect(service.error()).toContain('No se pudieron cargar');
  });

  it('loadUsers() populates the users signal', () => {
    service.loadUsers();

    httpMock.expectOne(`${environment.apiUrl}/admin/users`).flush([user]);

    expect(service.users()).toEqual([user]);
  });

  it('loadUsers() sets an error message on failure', () => {
    service.loadUsers();

    httpMock
      .expectOne(`${environment.apiUrl}/admin/users`)
      .flush('x', { status: 500, statusText: 'Server Error' });

    expect(service.error()).toContain('No se pudo cargar la lista de usuarios');
  });

  it('createUser() posts the payload and refreshes the users list', () => {
    const payload = {
      name: 'Beto',
      email: 'beto@biblioteca.com',
      password: 'password123',
      role: 'ADMIN' as const,
    };
    service.createUser(payload).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/admin/users`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ ...user, ...payload, id: 2 });

    httpMock.expectOne(`${environment.apiUrl}/admin/users`).flush([user]);
  });

  it('updateUser() puts to the user id and refreshes the users list', () => {
    service.updateUser(1, { name: 'Ana María', role: 'ADMIN' }).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/admin/users/1`);
    expect(req.request.method).toBe('PUT');
    req.flush({ ...user, name: 'Ana María', role: 'ADMIN' });

    httpMock.expectOne(`${environment.apiUrl}/admin/users`).flush([user]);
  });

  it('deleteUser() sends DELETE and refreshes the users list', () => {
    service.deleteUser(1).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/admin/users/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);

    httpMock.expectOne(`${environment.apiUrl}/admin/users`).flush([]);
    expect(service.users()).toEqual([]);
  });

  it('blockUser() sends the days in the body and refreshes the users list', () => {
    service.blockUser(1, 5).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/admin/users/1/block`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ days: 5 });
    req.flush({ ...user, blocked: true, blockedUntil: '2026-06-20T00:00:00Z' });

    httpMock.expectOne(`${environment.apiUrl}/admin/users`).flush([user]);
  });

  it('unblockUser() sends PUT and refreshes the users list', () => {
    service.unblockUser(1).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/admin/users/1/unblock`);
    expect(req.request.method).toBe('PUT');
    req.flush(null);

    httpMock.expectOne(`${environment.apiUrl}/admin/users`).flush([user]);
    expect(service.users()).toEqual([user]);
  });

  it('loadErrorLogs() populates the errorLogs signal', () => {
    service.loadErrorLogs();

    httpMock.expectOne(`${environment.apiUrl}/admin/logs?page=0&size=20`).flush(logPage);

    expect(service.errorLogs()).toEqual(logPage);
  });

  it('loadLoans() populates the loans signal and tracks the includeReturned flag', () => {
    const loan = { id: 1, bookTitle: 'X' } as unknown as LoanItem;
    service.loadLoans(true);

    expect(service.loansIncludeReturned()).toBe(true);
    httpMock.expectOne(`${environment.apiUrl}/admin/loans?includeReturned=true`).flush([loan]);
    expect(service.loans()).toEqual([loan]);
  });

  it('returnLoan() PUTs to the shared return endpoint and refreshes with the active filter', () => {
    service.loadLoans(false);
    httpMock.expectOne(`${environment.apiUrl}/admin/loans?includeReturned=false`).flush([]);

    service.returnLoan(9).subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/loans/9/return`);
    expect(req.request.method).toBe('PUT');
    req.flush({ id: 9 });

    httpMock.expectOne(`${environment.apiUrl}/admin/loans?includeReturned=false`).flush([]);
  });

  it('loadActivity() populates the activity signal', () => {
    const activityPage = {
      content: [
        {
          id: 1,
          actorEmail: 'ana@biblioteca.com',
          action: 'LOAN_CREATED',
          description: '«Matilda»',
          createdAt: '2026-06-15T00:00:00Z',
        },
      ],
      totalElements: 1,
      totalPages: 1,
      number: 0,
      size: 30,
    } as ActivityLogPage;

    service.loadActivity();

    httpMock.expectOne(`${environment.apiUrl}/admin/activity?page=0&size=30`).flush(activityPage);
    expect(service.activity()).toEqual(activityPage);
  });
});
