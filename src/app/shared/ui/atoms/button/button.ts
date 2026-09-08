import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ButtonDirective } from 'primeng/button';
import type { ButtonType } from './button.types';

@Component({
  selector: 'app-button',
  imports: [ButtonDirective],
  templateUrl: './button.html',
  styleUrl: './button.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // display:contents: el host no pinta caja propia, así que un `class="w-full"` puesto por
  // quien usa <app-button> (que igual se aplica al host de forma nativa) no tiene efecto
  // visual ahí — el ancho real lo controla el [class] del <button> interno, alimentado por
  // el input `class` de abajo.
  host: { style: 'display: contents' },
})
export class Button {
  readonly label = input.required<string>();
  readonly type = input<ButtonType>('button');
  readonly loading = input(false);
  readonly disabled = input(false);
  // Alias a "class" a propósito: permite escribir <app-button class="w-full" /> en el
  // call site en vez de un input con otro nombre — sin esto, cada contexto (botón de
  // ancho completo en un form, compacto en un header) obligaría a duplicar el atom.
  readonly extraClass = input('', { alias: 'class' });

  protected readonly computedClass = computed(() => `justify-center ${this.extraClass()}`.trim());
}
