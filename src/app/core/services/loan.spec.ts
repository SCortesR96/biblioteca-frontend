import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { Loan } from './loan';
import type { LoanItem } from './loan.types';

const sampleLoan: LoanItem = {
  id: 1, bookId: 1, bookTitle: 'Matilda', bookIsbn: '9780140328721',
  borrowerName: 'Ana', borrowerEmail: 'ana@biblioteca.com',
  loanDate: '2026-01-01', dueDate: '2026-01-15', returnDate: null, overdue: false, reminderSent: false,
};

describe('Loan (service)', () => {
  let service: Loan;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(Loan);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('loadMine() populates myLoans on success', () => {
    service.loadMine();

    const req = httpMock.expectOne(`${environment.apiUrl}/loans/mine`);
    expect(req.request.method).toBe('GET');
    req.flush([sampleLoan]);

    expect(service.myLoans()).toEqual([sampleLoan]);
    expect(service.loading()).toBe(false);
  });

  it('loadMine() sets an error message on failure', () => {
    service.loadMine();

    httpMock.expectOne(`${environment.apiUrl}/loans/mine`).flush('err', { status: 500, statusText: 'Server Error' });

    expect(service.error()).toContain('No se pudieron cargar');
  });

  it('create() posts { bookId } to /loans', () => {
    service.create(1).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/loans`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ bookId: 1 });
    req.flush(sampleLoan);
  });

  it('returnLoan() PUTs to /loans/{id}/return and reloads "mine"', () => {
    service.returnLoan(1).subscribe();

    const putReq = httpMock.expectOne(`${environment.apiUrl}/loans/1/return`);
    expect(putReq.request.method).toBe('PUT');
    putReq.flush({ ...sampleLoan, returnDate: '2026-01-10' });

    httpMock.expectOne(`${environment.apiUrl}/loans/mine`).flush([]);
  });
});
