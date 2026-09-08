import { Directive, TemplateRef, inject, input } from '@angular/core';

// Marca un <ng-template> dentro de <app-data-table> como el renderizador de una columna
// (por su field) en vez de la celda de texto por defecto.
// Uso: <ng-template appColumnTemplate="status" let-row>...</ng-template>.
@Directive({
  selector: 'ng-template[appColumnTemplate]',
})
export class ColumnTemplate {
  readonly field = input.required<string>({ alias: 'appColumnTemplate' });
  readonly templateRef = inject(TemplateRef<unknown>);
}
