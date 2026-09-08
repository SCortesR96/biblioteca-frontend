import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Un número clave con su etiqueta, para los cards del dashboard de admin. Deliberadamente
 * simple (sin PrimeNG debajo): es solo texto con estilo, no necesita ningún componente de
 * librería.
 */
@Component({
  selector: 'app-stat-card',
  imports: [],
  templateUrl: './stat-card.html',
  styleUrl: './stat-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatCard {
  readonly label = input.required<string>();
  readonly value = input.required<number>();
}
