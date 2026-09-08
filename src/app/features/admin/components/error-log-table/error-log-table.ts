import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Tag } from 'primeng/tag';
import type { ErrorLogEntry, LogLevel } from '../../../../core/services/admin.types';
import { ColumnTemplate } from '../../../../shared/ui/organisms/data-table/column-template';
import { DataTable } from '../../../../shared/ui/organisms/data-table/data-table';
import type { TableColumn, TableSelectFilter } from '../../../../shared/ui/organisms/data-table/data-table.types';

const LEVEL_SEVERITIES: Record<LogLevel, 'info' | 'warn' | 'danger'> = {
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'danger',
};

const COLUMNS: TableColumn[] = [
  { field: 'level', header: 'Nivel', sortable: true },
  { field: 'message', header: 'Mensaje', sortable: true },
  { field: 'exceptionType', header: 'Excepción', class: 'hidden md:table-cell text-xs text-surface-500', sortable: true },
  { field: 'path', header: 'Ruta', class: 'hidden lg:table-cell' },
  { field: 'createdAt', header: 'Fecha', sortable: true },
];

const LEVEL_FILTER: TableSelectFilter = {
  field: 'level',
  placeholder: 'Todos los niveles',
  options: [
    { label: 'Info', value: 'INFO' },
    { label: 'Advertencia', value: 'WARN' },
    { label: 'Error', value: 'ERROR' },
  ],
};

@Component({
  selector: 'app-error-log-table',
  imports: [DataTable, ColumnTemplate, Tag, DatePipe],
  templateUrl: './error-log-table.html',
  styleUrl: './error-log-table.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorLogTable {
  readonly logs = input.required<ErrorLogEntry[]>();

  protected readonly columns = COLUMNS;
  protected readonly levelFilter = LEVEL_FILTER;

  protected severityFor(level: LogLevel): 'info' | 'warn' | 'danger' {
    return LEVEL_SEVERITIES[level];
  }
}
