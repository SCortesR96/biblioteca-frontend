import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Loan } from '../../../../core/services/loan';
import type { LoanItem } from '../../../../core/services/loan.types';
import { Reservation } from '../../../../core/services/reservation';
import type { ReservationItem } from '../../../../core/services/reservation.types';
import { AppHeader } from '../../../../shared/ui/organisms/app-header/app-header';
import { LoansTable } from '../../components/loans-table/loans-table';
import { ReservationsTable } from '../../components/reservations-table/reservations-table';

@Component({
  selector: 'app-my-loans-page',
  imports: [AppHeader, LoansTable, ReservationsTable],
  templateUrl: './my-loans-page.html',
  styleUrl: './my-loans-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyLoansPage {
  private readonly loanService = inject(Loan);
  private readonly reservationService = inject(Reservation);

  protected readonly loans = this.loanService.myLoans;
  protected readonly loansLoading = this.loanService.loading;
  protected readonly loansError = this.loanService.error;

  protected readonly reservations = this.reservationService.myReservations;
  protected readonly reservationsLoading = this.reservationService.loading;
  protected readonly reservationsError = this.reservationService.error;

  constructor() {
    this.loanService.loadMine();
    this.reservationService.loadMine();
  }

  protected onReturn(loan: LoanItem): void {
    this.loanService.returnLoan(loan.id).subscribe({
      error: () => window.alert('No se pudo devolver el préstamo. Intenta de nuevo.'),
    });
  }

  protected onCancelReservation(reservation: ReservationItem): void {
    this.reservationService.cancel(reservation.id).subscribe({
      error: () => window.alert('No se pudo cancelar la reserva. Intenta de nuevo.'),
    });
  }
}
