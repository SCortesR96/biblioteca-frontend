import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, output, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Auth } from '../../../../core/services/auth';
import { Button } from '../../../../shared/ui/atoms/button/button';
import { TextInput } from '../../../../shared/ui/atoms/text-input/text-input';
import { FormField } from '../../../../shared/ui/molecules/form-field/form-field';

@Component({
  selector: 'app-login-form',
  imports: [ReactiveFormsModule, TextInput, Button, FormField],
  templateUrl: './login-form.html',
  styleUrl: './login-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginForm {
  private readonly auth = inject(Auth);

  readonly loggedIn = output<void>();

  protected readonly form = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(8)] }),
  });

  protected readonly submitting = signal(false);
  protected readonly submitted = signal(false);
  protected readonly loginError = signal<string | null>(null);

  // Puente señal <-> Reactive Forms: leer estas señales dentro de los computed de abajo
  // es lo que hace que los mensajes de error se actualicen mientras el usuario escribe,
  // sin depender de que zone.js decida revisar este componente OnPush.
  private readonly emailValue = toSignal(this.form.controls.email.valueChanges, {
    initialValue: this.form.controls.email.value,
  });
  private readonly passwordValue = toSignal(this.form.controls.password.valueChanges, {
    initialValue: this.form.controls.password.value,
  });

  protected readonly emailError = computed(() => {
    this.emailValue();
    if (!this.submitted()) return null;
    const control = this.form.controls.email;
    if (control.hasError('required')) return 'El correo es obligatorio';
    if (control.hasError('email')) return 'El correo no tiene un formato válido';
    return null;
  });

  protected readonly passwordError = computed(() => {
    this.passwordValue();
    if (!this.submitted()) return null;
    const control = this.form.controls.password;
    if (control.hasError('required')) return 'La contraseña es obligatoria';
    if (control.hasError('minlength')) return 'La contraseña debe tener al menos 8 caracteres';
    return null;
  });

  protected submit(): void {
    this.submitted.set(true);
    this.loginError.set(null);

    if (this.form.invalid) {
      return;
    }

    this.submitting.set(true);
    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.submitting.set(false);
        this.loggedIn.emit();
      },
      error: (error: HttpErrorResponse) => {
        this.submitting.set(false);
        this.loginError.set(
          error.status === 401 ? 'Correo o contraseña incorrectos' : 'No se pudo iniciar sesión. Intenta de nuevo.',
        );
      },
    });
  }
}
