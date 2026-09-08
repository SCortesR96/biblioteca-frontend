import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Loan } from '../../../../core/services/loan';
import type { LoanItem } from '../../../../core/services/loan.types';
import { AppHeader } from '../../../../shared/ui/organisms/app-header/app-header';
import { LoansTable } from '../../components/loans-table/loans-table';

@Component({
  selector: 'app-my-loans-page',
  imports: [AppHeader, LoansTable],
  templateUrl: './my-loans-page.html',
  styleUrl: './my-loans-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyLoansPage {
  private readonly loanService = inject(Loan);

  protected readonly loans = this.loanService.myLoans;
  protected readonly loading = this.loanService.loading;
  protected readonly error = this.loanService.error;

  constructor() {
    this.loanService.loadMine();
  }

  protected onReturn(loan: LoanItem): void {
    this.loanService.returnLoan(loan.id).subscribe({
      error: () => window.alert('No se pudo devolver el préstamo. Intenta de nuevo.'),
    });
  }
}
