import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import type { BookItem } from '../../../../core/services/book.types';
import { ColumnTemplate } from '../../../../shared/ui/organisms/data-table/column-template';
import { DataTable } from '../../../../shared/ui/organisms/data-table/data-table';
import type { TableColumn, TableSelectFilter } from '../../../../shared/ui/organisms/data-table/data-table.types';
import { Button } from '../../../../shared/ui/atoms/button/button';
import { StatusBadge } from '../../../../shared/ui/atoms/status-badge/status-badge';

const COLUMNS: TableColumn[] = [
  { field: 'title', header: 'Título', sortable: true },
  { field: 'author', header: 'Autor', class: 'hidden sm:table-cell', sortable: true },
  { field: 'isbn', header: 'ISBN', class: 'hidden md:table-cell', sortable: true },
  { field: 'publicationYear', header: 'Año', class: 'hidden md:table-cell', sortable: true },
  { field: 'status', header: 'Estado', sortable: true },
  { field: 'actions', header: 'Acciones' },
];

const STATUS_FILTER: TableSelectFilter = {
  field: 'status',
  placeholder: 'Todos los estados',
  options: [
    { label: 'Disponible', value: 'DISPONIBLE' },
    { label: 'Prestado', value: 'PRESTADO' },
    { label: 'Reservado', value: 'RESERVADO' },
  ],
};

@Component({
  selector: 'app-catalog-table',
  imports: [DataTable, ColumnTemplate, StatusBadge, Button],
  templateUrl: './catalog-table.html',
  styleUrl: './catalog-table.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogTable {
  readonly books = input.required<BookItem[]>();
  readonly canManage = input(false);
  readonly loading = input(false);

  readonly deleteBook = output<BookItem>();
  readonly borrowBook = output<BookItem>();
  readonly reserveBook = output<BookItem>();

  protected readonly columns = COLUMNS;
  protected readonly statusFilter = STATUS_FILTER;
}
