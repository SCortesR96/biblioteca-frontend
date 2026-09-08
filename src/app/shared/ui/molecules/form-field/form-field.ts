import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-form-field',
  imports: [],
  templateUrl: './form-field.html',
  styleUrl: './form-field.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormField {
  readonly label = input.required<string>();
  readonly inputId = input.required<string>();
  readonly errorMessage = input<string | null>(null);
}
