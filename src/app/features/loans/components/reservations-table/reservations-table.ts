import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Tag } from 'primeng/tag';
import type { ReservationItem } from '../../../../core/services/reservation.types';
import { Button } from '../../../../shared/ui/atoms/button/button';
import { ColumnTemplate } from '../../../../shared/ui/organisms/data-table/column-template';
import { DataTable } from '../../../../shared/ui/organisms/data-table/data-table';
import type { TableColumn, TableSelectFilter } from '../../../../shared/ui/organisms/data-table/data-table.types';

const COLUMNS: TableColumn[] = [
  { field: 'bookTitle', header: 'Libro', sortable: true },
  { field: 'bookIsbn', header: 'ISBN', class: 'hidden sm:table-cell', sortable: true },
  { field: 'requestDate', header: 'Solicitada', class: 'hidden md:table-cell', sortable: true },
  { field: 'status', header: 'Estado', sortable: true },
  { field: 'actions', header: 'Acciones' },
];

const STATUS_FILTER: TableSelectFilter = {
  field: 'status',
  placeholder: 'Todos los estados',
  options: [
    { label: 'Pendiente', value: 'PENDIENTE' },
    { label: 'Notificado', value: 'NOTIFICADO' },
    { label: 'Cancelado', value: 'CANCELADO' },
    { label: 'Cumplido', value: 'CUMPLIDO' },
  ],
};

@Component({
  selector: 'app-reservations-table',
  imports: [DataTable, ColumnTemplate, Tag, Button, DatePipe],
  templateUrl: './reservations-table.html',
  styleUrl: './reservations-table.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReservationsTable {
  readonly reservations = input.required<ReservationItem[]>();
  readonly loading = input(false);

  readonly cancelReservation = output<ReservationItem>();

  protected readonly columns = COLUMNS;
  protected readonly statusFilter = STATUS_FILTER;
}
