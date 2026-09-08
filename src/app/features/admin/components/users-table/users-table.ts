import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Tag } from 'primeng/tag';
import type { ManagedUser } from '../../../../core/services/admin.types';
import { Button } from '../../../../shared/ui/atoms/button/button';
import { ColumnTemplate } from '../../../../shared/ui/organisms/data-table/column-template';
import { DataTable } from '../../../../shared/ui/organisms/data-table/data-table';
import type {
  TableColumn,
  TableSelectFilter,
} from '../../../../shared/ui/organisms/data-table/data-table.types';

const COLUMNS: TableColumn[] = [
  { field: 'name', header: 'Nombre' },
  { field: 'email', header: 'Correo' },
  { field: 'role', header: 'Rol' },
  { field: 'status', header: 'Estado' },
  { field: 'createdAt', header: 'Alta', class: 'hidden lg:table-cell' },
  { field: 'actions', header: 'Acciones' },
];

const ROLE_FILTER: TableSelectFilter = {
  field: 'role',
  placeholder: 'Todos los roles',
  options: [
    { label: 'Administrador', value: 'ADMIN' },
    { label: 'Bibliotecario', value: 'BIBLIOTECARIO' },
  ],
};

/**
 * Tabla de gestión de usuarios: reutiliza {@link DataTable} (buscador + filtro por rol) y
 * solo aporta columnas y celdas custom (badge de rol, badge de estado activa/bloqueada, y
 * los botones de acción). Componente "tonto": recibe la lista por input y comunica cada
 * intención por output; la página es la que habla con el servicio {@code Admin} y pide
 * confirmación.
 */
@Component({
  selector: 'app-users-table',
  imports: [DataTable, ColumnTemplate, Button, Tag, DatePipe],
  templateUrl: './users-table.html',
  styleUrl: './users-table.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersTable {
  readonly users = input.required<ManagedUser[]>();

  readonly edit = output<ManagedUser>();
  readonly block = output<ManagedUser>();
  readonly unblock = output<ManagedUser>();
  readonly remove = output<ManagedUser>();

  protected readonly columns = COLUMNS;
  protected readonly roleFilter = ROLE_FILTER;

  protected roleLabel(role: ManagedUser['role']): string {
    return role === 'ADMIN' ? 'Administrador' : 'Bibliotecario';
  }
}
