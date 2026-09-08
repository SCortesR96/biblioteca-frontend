import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { Reservation } from './reservation';
import type { ReservationItem } from './reservation.types';

const sampleReservation: ReservationItem = {
  id: 1, bookId: 1, bookTitle: 'Matilda', bookIsbn: '9780140328721',
  requesterEmail: 'ana@biblioteca.com', requestDate: '2026-01-01T00:00:00Z', status: 'PENDIENTE',
};

describe('Reservation (service)', () => {
  let service: Reservation;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(Reservation);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('loadMine() populates myReservations on success', () => {
    service.loadMine();

    const req = httpMock.expectOne(`${environment.apiUrl}/reservations/mine`);
    expect(req.request.method).toBe('GET');
    req.flush([sampleReservation]);

    expect(service.myReservations()).toEqual([sampleReservation]);
  });

  it('loadMine() sets an error message on failure', () => {
    service.loadMine();

    httpMock.expectOne(`${environment.apiUrl}/reservations/mine`).flush('err', { status: 500, statusText: 'Server Error' });

    expect(service.error()).toContain('No se pudieron cargar');
  });

  it('create() posts { bookId } to /reservations', () => {
    service.create(1).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/reservations`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ bookId: 1 });
    req.flush(sampleReservation);
  });

  it('cancel() DELETEs /reservations/{id} and reloads "mine"', () => {
    service.cancel(1).subscribe();

    const deleteReq = httpMock.expectOne(`${environment.apiUrl}/reservations/1`);
    expect(deleteReq.request.method).toBe('DELETE');
    deleteReq.flush(null);

    httpMock.expectOne(`${environment.apiUrl}/reservations/mine`).flush([]);
  });
});
