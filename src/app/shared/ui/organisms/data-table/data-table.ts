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

// Tabla genérica que reutilizan todas las tablas de la app: buscador, filtro opcional,
// scroll y "sin resultados" en un solo lugar. Cada tabla concreta solo pone sus columnas
// y, si una celda necesita más que texto, un <ng-template appColumnTemplate="campo">.
// El filtro es client-side sobre lo ya cargado, no reemplaza una búsqueda server-side.
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
  /** Debounce del filtro global, en ms. Bajo a propósito: se pidió que se sienta "en tiempo real". */
  readonly filterDelay = input(100);
  /** Alto máximo del cuerpo de la tabla antes de scrollear verticalmente (header queda fijo). */
  readonly scrollHeight = input('28rem');

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
