import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { Admin } from './admin';
import type { AdminStats, BlockedUser, ErrorLogPage } from './admin.types';

const stats: AdminStats = { prestamosActivos: 5, prestamosVencidos: 1, reservasActivas: 2, cuentasBloqueadas: 1 };
const blockedUser: BlockedUser = { id: 1, name: 'Ana', email: 'ana@biblioteca.com', blockedUntil: '2026-06-22T00:00:00Z' };
const logPage: ErrorLogPage = {
  content: [{ id: 1, level: 'ERROR', message: 'boom', exceptionType: null, path: null, httpMethod: null, createdAt: '2026-06-15T00:00:00Z' }],
  totalElements: 1, totalPages: 1, number: 0, size: 20,
};

describe('Admin (service)', () => {
  let service: Admin;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
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

    httpMock.expectOne(`${environment.apiUrl}/admin/stats`).flush('error', { status: 500, statusText: 'Server Error' });

    expect(service.error()).toContain('No se pudieron cargar');
  });

  it('loadBlockedUsers() populates the blockedUsers signal', () => {
    service.loadBlockedUsers();

    httpMock.expectOne(`${environment.apiUrl}/admin/users/blocked`).flush([blockedUser]);

    expect(service.blockedUsers()).toEqual([blockedUser]);
  });

  it('unblockUser() sends PUT and refreshes the blocked users list', () => {
    service.unblockUser(1).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/admin/users/1/unblock`);
    expect(req.request.method).toBe('PUT');
    req.flush(null);

    httpMock.expectOne(`${environment.apiUrl}/admin/users/blocked`).flush([]);
    expect(service.blockedUsers()).toEqual([]);
  });

  it('loadErrorLogs() populates the errorLogs signal', () => {
    service.loadErrorLogs();

    httpMock.expectOne(`${environment.apiUrl}/admin/logs?page=0&size=20`).flush(logPage);

    expect(service.errorLogs()).toEqual(logPage);
  });
});
