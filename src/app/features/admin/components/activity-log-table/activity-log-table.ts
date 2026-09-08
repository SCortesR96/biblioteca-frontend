import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Tag } from 'primeng/tag';
import type { ActivityAction, ActivityLogEntry } from '../../../../core/services/admin.types';
import { ColumnTemplate } from '../../../../shared/ui/organisms/data-table/column-template';
import { DataTable } from '../../../../shared/ui/organisms/data-table/data-table';
import type {
  TableColumn,
  TableSelectFilter,
} from '../../../../shared/ui/organisms/data-table/data-table.types';

type Severity = 'info' | 'success' | 'warn' | 'secondary' | 'contrast';

const ACTION_LABELS: Record<ActivityAction, string> = {
  LOGIN: 'Inicio de sesión',
  LOAN_CREATED: 'Préstamo pedido',
  LOAN_RETURNED: 'Préstamo devuelto',
  RESERVATION_CREATED: 'Reserva creada',
  RESERVATION_CANCELLED: 'Reserva cancelada',
  BOOK_CREATED: 'Libro registrado',
  BOOK_DELETED: 'Libro eliminado',
  USER_CREATED: 'Usuario creado',
  USER_UPDATED: 'Usuario editado',
  USER_DELETED: 'Usuario eliminado',
  USER_BLOCKED: 'Cuenta bloqueada',
  USER_UNBLOCKED: 'Cuenta desbloqueada',
};

const ACTION_SEVERITIES: Record<ActivityAction, Severity> = {
  LOGIN: 'secondary',
  LOAN_CREATED: 'info',
  LOAN_RETURNED: 'info',
  RESERVATION_CREATED: 'warn',
  RESERVATION_CANCELLED: 'warn',
  BOOK_CREATED: 'success',
  BOOK_DELETED: 'contrast',
  USER_CREATED: 'success',
  USER_UPDATED: 'secondary',
  USER_DELETED: 'contrast',
  USER_BLOCKED: 'contrast',
  USER_UNBLOCKED: 'secondary',
};

const COLUMNS: TableColumn[] = [
  { field: 'createdAt', header: 'Fecha', sortable: true },
  { field: 'actorEmail', header: 'Quién', sortable: true },
  { field: 'action', header: 'Acción', sortable: true },
  { field: 'description', header: 'Detalle' },
];

const ACTION_FILTER: TableSelectFilter = {
  field: 'action',
  placeholder: 'Todas las acciones',
  options: (Object.keys(ACTION_LABELS) as ActivityAction[]).map((value) => ({
    label: ACTION_LABELS[value],
    value,
  })),
};

/**
 * Bitácora de actividad del panel de administración: la lista de acciones exitosas que
 * ocurrieron en el sistema (préstamos, reservas, altas/bajas, bloqueos, logins). De solo
 * lectura — reutiliza {@link DataTable} con buscador y filtro por tipo de acción.
 */
@Component({
  selector: 'app-activity-log-table',
  imports: [DataTable, ColumnTemplate, Tag, DatePipe],
  templateUrl: './activity-log-table.html',
  styleUrl: './activity-log-table.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivityLogTable {
  readonly entries = input.required<ActivityLogEntry[]>();

  protected readonly columns = COLUMNS;
  protected readonly actionFilter = ACTION_FILTER;

  protected labelFor(action: ActivityAction): string {
    return ACTION_LABELS[action];
  }

  protected severityFor(action: ActivityAction): Severity {
    return ACTION_SEVERITIES[action];
  }
}
