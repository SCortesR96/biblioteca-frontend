import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, TemplateRef, contentChildren, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { ColumnTemplate } from './column-template';
import type { TableColumn, TableSelectFilter } from './data-table.types';

/**
 * Tabla genérica reutilizada por todas las tablas de la app (catálogo, préstamos,
 * reservas, cuentas bloqueadas, bitácora de errores): un único lugar define el buscador
 * global, el filtro por categoría opcional, el scroll horizontal responsive y el mensaje
 * de "sin resultados" — cada tabla concreta solo aporta sus columnas y, cuando una celda
 * necesita algo más que texto plano (un badge, botones de acción), un
 * `<ng-template appColumnTemplate="campo">` proyectado.
 *
 * El filtro es 100% client-side sobre las filas ya cargadas (vía el propio motor de
 * filtros de `p-table`), independiente de cualquier búsqueda server-side que la página ya
 * tenga (p. ej. el formulario de búsqueda del catálogo): no reemplaza esa búsqueda, la
 * complementa con un filtrado instantáneo sin ida y vuelta al backend.
 */
@Component({
  selector: 'app-data-table',
  imports: [TableModule, IconField, InputIcon, InputText, Select, FormsModule, NgTemplateOutlet],
  templateUrl: './data-table.html',
  styleUrl: './data-table.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTable<T> {
  readonly value = input.required<T[]>();
  readonly columns = input.required<TableColumn[]>();
  readonly loading = input(false);
  readonly dataKey = input('id');
  readonly globalFilterFields = input<string[]>([]);
  readonly searchPlaceholder = input('Buscar...');
  readonly selectFilter = input<TableSelectFilter | null>(null);
  readonly emptyMessage = input('Sin resultados.');

  private readonly columnTemplates = contentChildren(ColumnTemplate);

  protected templateFor(field: string): TemplateRef<unknown> | undefined {
    return this.columnTemplates().find((tpl) => tpl.field() === field)?.templateRef;
  }

  protected resolveValue(row: T, field: string): string {
    const value = (row as Record<string, unknown>)[field];
    return value === null || value === undefined || value === '' ? '—' : String(value);
  }

  protected trackByRow = (_index: number, row: T): unknown => (row as Record<string, unknown>)[this.dataKey()];

  protected trackByField = (_index: number, column: TableColumn): string => column.field;
}
