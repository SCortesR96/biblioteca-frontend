import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { ReservationItem } from '../../../../core/services/reservation.types';
import { ReservationsTable } from './reservations-table';

const reservations: ReservationItem[] = [
  {
    id: 1, bookId: 1, bookTitle: 'Matilda', bookIsbn: '9780140328721',
    requesterEmail: 'ana@biblioteca.com', requestDate: '2026-01-01T00:00:00Z', status: 'PENDIENTE',
  },
  {
    id: 2, bookId: 2, bookTitle: 'El Hobbit', bookIsbn: '9780261102217',
    requesterEmail: 'ana@biblioteca.com', requestDate: '2025-12-01T00:00:00Z', status: 'CUMPLIDO',
  },
];

describe('ReservationsTable', () => {
  let fixture: ComponentFixture<ReservationsTable>;
  let component: ReservationsTable;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ReservationsTable] }).compileComponents();
    fixture = TestBed.createComponent(ReservationsTable);
    fixture.componentRef.setInput('reservations', reservations);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('renders one row per reservation', () => {
    expect(fixture.nativeElement.textContent).toContain('Matilda');
    expect(fixture.nativeElement.textContent).toContain('El Hobbit');
  });

  it('shows "Cancelar" only for PENDIENTE/NOTIFICADO reservations', () => {
    expect(fixture.nativeElement.querySelectorAll('app-button').length).toBe(1);
  });

  it('emits cancelReservation with the right reservation when clicked', () => {
    const emitted: ReservationItem[] = [];
    component.cancelReservation.subscribe((reservation) => emitted.push(reservation));

    fixture.nativeElement.querySelector('app-button').dispatchEvent(new Event('click'));

    expect(emitted).toEqual([reservations[0]]);
  });
});
