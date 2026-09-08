import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import type { LoanItem } from '../../../../core/services/loan.types';
import { Button } from '../../../../shared/ui/atoms/button/button';
import { OverdueBadge } from '../../../../shared/ui/atoms/overdue-badge/overdue-badge';
import { ColumnTemplate } from '../../../../shared/ui/organisms/data-table/column-template';
import { DataTable } from '../../../../shared/ui/organisms/data-table/data-table';
import type { TableColumn } from '../../../../shared/ui/organisms/data-table/data-table.types';

const COLUMNS: TableColumn[] = [
  { field: 'bookTitle', header: 'Libro' },
  { field: 'bookIsbn', header: 'ISBN', class: 'hidden sm:table-cell' },
  { field: 'loanDate', header: 'Fecha de préstamo', class: 'hidden md:table-cell' },
  { field: 'dueDate', header: 'Fecha límite' },
  { field: 'estado', header: 'Estado' },
  { field: 'actions', header: 'Acciones' },
];

@Component({
  selector: 'app-loans-table',
  imports: [DataTable, ColumnTemplate, OverdueBadge, Button],
  templateUrl: './loans-table.html',
  styleUrl: './loans-table.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoansTable {
  readonly loans = input.required<LoanItem[]>();
  readonly loading = input(false);

  readonly returnLoan = output<LoanItem>();

  protected readonly columns = COLUMNS;
}
