import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ButtonDirective } from 'primeng/button';
import type { ButtonType } from './button.types';

@Component({
  selector: 'app-button',
  imports: [ButtonDirective],
  templateUrl: './button.html',
  styleUrl: './button.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Button {
  readonly label = input.required<string>();
  readonly type = input<ButtonType>('button');
  readonly loading = input(false);
  readonly disabled = input(false);
}
