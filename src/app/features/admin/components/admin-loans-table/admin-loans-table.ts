import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import type { LoanItem } from '../../../../core/services/loan.types';
import { Button } from '../../../../shared/ui/atoms/button/button';
import { OverdueBadge } from '../../../../shared/ui/atoms/overdue-badge/overdue-badge';
import { ColumnTemplate } from '../../../../shared/ui/organisms/data-table/column-template';
import { DataTable } from '../../../../shared/ui/organisms/data-table/data-table';
import type { TableColumn } from '../../../../shared/ui/organisms/data-table/data-table.types';

const COLUMNS: TableColumn[] = [
  { field: 'bookTitle', header: 'Libro', sortable: true },
  { field: 'borrower', header: 'Prestatario', sortable: true },
  { field: 'loanDate', header: 'Prestado', class: 'hidden md:table-cell', sortable: true },
  { field: 'dueDate', header: 'Vence', sortable: true },
  { field: 'estado', header: 'Estado' },
  { field: 'actions', header: 'Acciones' },
];

/**
 * Tabla de préstamos para el panel de administración: como {@code LoansTable} pero con la
 * columna del prestatario (el ADMIN necesita saber de quién es cada préstamo) y la acción
 * "Devolver" disponible para cualquier préstamo activo, no solo los propios. Tonta: emite
 * `returnLoan` y la página confirma y llama al servicio.
 */
@Component({
  selector: 'app-admin-loans-table',
  imports: [DataTable, ColumnTemplate, OverdueBadge, Button],
  templateUrl: './admin-loans-table.html',
  styleUrl: './admin-loans-table.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLoansTable {
  readonly loans = input.required<LoanItem[]>();

  readonly returnLoan = output<LoanItem>();

  protected readonly columns = COLUMNS;
}
