import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TableModule } from 'primeng/table';
import type { LoanItem } from '../../../../core/services/loan.types';
import { Button } from '../../../../shared/ui/atoms/button/button';
import { OverdueBadge } from '../../../../shared/ui/atoms/overdue-badge/overdue-badge';

@Component({
  selector: 'app-loans-table',
  imports: [TableModule, OverdueBadge, Button],
  templateUrl: './loans-table.html',
  styleUrl: './loans-table.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoansTable {
  readonly loans = input.required<LoanItem[]>();
  readonly loading = input(false);

  readonly returnLoan = output<LoanItem>();

  protected trackById(_index: number, loan: LoanItem): number {
    return loan.id;
  }
}
