import { ChangeDetectionStrategy, Component, forwardRef, input, signal } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import type { TextInputType } from './text-input.types';

@Component({
  selector: 'app-text-input',
  imports: [InputText],
  templateUrl: './text-input.html',
  styleUrl: './text-input.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextInput),
      multi: true,
    },
  ],
})
export class TextInput implements ControlValueAccessor {
  readonly id = input.required<string>();
  readonly type = input<TextInputType>('text');
  readonly placeholder = input('');
  readonly autocomplete = input<string>('off');

  protected readonly value = signal('');
  protected readonly disabled = signal(false);

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  protected handleInput(event: Event): void {
    const inputValue = (event.target as HTMLInputElement).value;
    this.value.set(inputValue);
    this.onChange(inputValue);
  }

  protected handleBlur(): void {
    this.onTouched();
  }
}
