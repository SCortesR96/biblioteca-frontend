import { Directive, TemplateRef, inject, input } from '@angular/core';

/**
 * Marca un `<ng-template>` proyectado dentro de `<app-data-table>` como el renderizador de
 * una columna puntual (por su `field`), en vez de la celda de texto por defecto. Así cada
 * tabla concreta (catálogo, préstamos, reservas, ...) decide cómo se ve una celda —badge de
 * estado, botones de acción— sin que `DataTable` conozca ningún dominio específico.
 *
 * Uso: `<ng-template appColumnTemplate="status" let-row>...</ng-template>`.
 */
@Directive({
  selector: 'ng-template[appColumnTemplate]',
})
export class ColumnTemplate {
  readonly field = input.required<string>({ alias: 'appColumnTemplate' });
  readonly templateRef = inject(TemplateRef<unknown>);
}
