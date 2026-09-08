import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Loan } from '../../../../core/services/loan';
import type { LoanItem } from '../../../../core/services/loan.types';
import { Reservation } from '../../../../core/services/reservation';
import type { ReservationItem } from '../../../../core/services/reservation.types';
import { UiFeedback } from '../../../../core/services/ui-feedback';
import { MyLoansPage } from './my-loans-page';

const loan: LoanItem = {
  id: 1, bookId: 1, bookTitle: 'Matilda', bookIsbn: '9780140328721', borrowerName: 'Ana',
  borrowerEmail: 'ana@biblioteca.com', loanDate: '2026-01-01', dueDate: '2026-01-15',
  returnDate: null, overdue: false, reminderSent: false,
};

const reservation: ReservationItem = {
  id: 1, bookId: 2, bookTitle: 'El Hobbit', bookIsbn: '9780261102217',
  requesterEmail: 'ana@biblioteca.com', requestDate: '2026-01-01T00:00:00Z', status: 'PENDIENTE',
};

describe('MyLoansPage', () => {
  let fixture: ComponentFixture<MyLoansPage>;
  let component: MyLoansPage;
  let loanStub: {
    myLoans: ReturnType<typeof signal>; loading: ReturnType<typeof signal>; error: ReturnType<typeof signal>;
    loadMine: ReturnType<typeof vi.fn>; returnLoan: ReturnType<typeof vi.fn>;
  };
  let reservationStub: {
    myReservations: ReturnType<typeof signal>; loading: ReturnType<typeof signal>; error: ReturnType<typeof signal>;
    loadMine: ReturnType<typeof vi.fn>; cancel: ReturnType<typeof vi.fn>;
  };
  let uiStub: { confirm: ReturnType<typeof vi.fn>; success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    loanStub = {
      myLoans: signal<LoanItem[]>([]), loading: signal(false), error: signal<string | null>(null),
      loadMine: vi.fn(), returnLoan: vi.fn(),
    };
    reservationStub = {
      myReservations: signal<ReservationItem[]>([]), loading: signal(false), error: signal<string | null>(null),
      loadMine: vi.fn(), cancel: vi.fn(),
    };
    uiStub = { confirm: vi.fn().mockResolvedValue(true), success: vi.fn(), error: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [MyLoansPage],
      providers: [
        provideRouter([]),
        { provide: Loan, useValue: loanStub },
        { provide: Reservation, useValue: reservationStub },
        { provide: UiFeedback, useValue: uiStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MyLoansPage);
    component = fixture.componentInstance;
  });

  it('loads loans and reservations on init', () => {
    fixture.detectChanges();
    expect(loanStub.loadMine).toHaveBeenCalled();
    expect(reservationStub.loadMine).toHaveBeenCalled();
  });

  it('onReturn() calls Loan.returnLoan with the loan id and shows a success toast', () => {
    loanStub.returnLoan.mockReturnValue(of(loan));
    fixture.detectChanges();

    component['onReturn'](loan);

    expect(loanStub.returnLoan).toHaveBeenCalledWith(1);
    expect(uiStub.success).toHaveBeenCalled();
  });

  it('onReturn() shows an error toast when the return fails', () => {
    loanStub.returnLoan.mockReturnValue(throwError(() => new Error('fail')));
    fixture.detectChanges();

    component['onReturn'](loan);

    expect(uiStub.error).toHaveBeenCalled();
  });

  it('onCancelReservation() asks for confirmation before cancelling', async () => {
    uiStub.confirm.mockResolvedValue(false);
    fixture.detectChanges();

    await component['onCancelReservation'](reservation);

    expect(uiStub.confirm).toHaveBeenCalledWith(expect.objectContaining({ severity: 'warn' }));
    expect(reservationStub.cancel).not.toHaveBeenCalled();
  });

  it('onCancelReservation() cancels and shows a success toast when confirmed', async () => {
    reservationStub.cancel.mockReturnValue(of(undefined));
    fixture.detectChanges();

    await component['onCancelReservation'](reservation);

    expect(reservationStub.cancel).toHaveBeenCalledWith(1);
    expect(uiStub.success).toHaveBeenCalled();
  });

  it('onCancelReservation() shows an error toast when the cancellation fails', async () => {
    reservationStub.cancel.mockReturnValue(throwError(() => new Error('fail')));
    fixture.detectChanges();

    await component['onCancelReservation'](reservation);

    expect(uiStub.error).toHaveBeenCalled();
  });
});
