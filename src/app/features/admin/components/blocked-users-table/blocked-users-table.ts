import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import type { BlockedUser } from '../../../../core/services/admin.types';
import { Button } from '../../../../shared/ui/atoms/button/button';
import { ColumnTemplate } from '../../../../shared/ui/organisms/data-table/column-template';
import { DataTable } from '../../../../shared/ui/organisms/data-table/data-table';
import type { TableColumn } from '../../../../shared/ui/organisms/data-table/data-table.types';

const COLUMNS: TableColumn[] = [
  { field: 'name', header: 'Nombre' },
  { field: 'email', header: 'Correo' },
  { field: 'blockedUntil', header: 'Bloqueada hasta', class: 'hidden sm:table-cell' },
  { field: 'actions', header: 'Acciones' },
];

@Component({
  selector: 'app-blocked-users-table',
  imports: [DataTable, ColumnTemplate, Button, DatePipe],
  templateUrl: './blocked-users-table.html',
  styleUrl: './blocked-users-table.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlockedUsersTable {
  readonly users = input.required<BlockedUser[]>();

  readonly unblock = output<BlockedUser>();

  protected readonly columns = COLUMNS;
}
