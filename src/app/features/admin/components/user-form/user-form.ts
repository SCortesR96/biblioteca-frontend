import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Select } from 'primeng/select';
import { Admin } from '../../../../core/services/admin';
import type { ManagedUser } from '../../../../core/services/admin.types';
import type { UserRole } from '../../../../core/services/auth.types';
import { Button } from '../../../../shared/ui/atoms/button/button';
import { TextInput } from '../../../../shared/ui/atoms/text-input/text-input';
import { FormField } from '../../../../shared/ui/molecules/form-field/form-field';

type RoleOption = { label: string; value: UserRole };

const ROLE_OPTIONS: RoleOption[] = [
  { label: 'Bibliotecario', value: 'BIBLIOTECARIO' },
  { label: 'Administrador', value: 'ADMIN' },
];

/**
 * Alta y edición de cuentas para el panel de administración. Un solo componente para los
 * dos modos: si recibe `user`, edita (nombre + rol; el correo es la identidad de la cuenta
 * y no se toca, la contraseña la gestiona la persona, no el ADMIN); sin `user`, da de alta
 * (nombre, correo, contraseña y rol).
 *
 * <p>La sincronización del form con `user` se hace en un `effect`, no en los
 * inicializadores de campo ni en `ngOnInit`: Angular fija los inputs <em>después</em> de
 * construir el componente, y además el ADMIN puede pasar de editar una cuenta a otra sin
 * cerrar el formulario (mismo componente, `user` cambia) — el effect reacciona a las dos
 * situaciones.</p>
 *
 * <p>La validación es espejo de la del backend: nombre obligatorio (≤150), correo con
 * formato, contraseña de al menos 8 (solo en alta), rol obligatorio.</p>
 */
@Component({
  selector: 'app-user-form',
  imports: [ReactiveFormsModule, TextInput, Button, FormField, Select],
  templateUrl: './user-form.html',
  styleUrl: './user-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserForm {
  private readonly admin = inject(Admin);

  readonly user = input<ManagedUser | null>(null);
  readonly saved = output<void>();
  readonly cancelled = output<void>();

  protected readonly roleOptions = ROLE_OPTIONS;
  protected readonly isEdit = computed(() => this.user() !== null);

  constructor() {
    effect(() => this.syncWith(this.user()));
  }

  protected readonly form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(150)],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8)],
    }),
    role: new FormControl<UserRole>('BIBLIOTECARIO', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  protected readonly submitting = signal(false);
  protected readonly submitted = signal(false);
  protected readonly submitError = signal<string | null>(null);

  // Puente señal <-> Reactive Forms, igual que en login-form: leer estas señales dentro de
  // los computed de error hace que los mensajes se actualicen mientras se escribe en un
  // componente OnPush, sin depender de zone.js.
  private readonly nameValue = toSignal(this.form.controls.name.valueChanges, {
    initialValue: this.form.controls.name.value,
  });
  private readonly emailValue = toSignal(this.form.controls.email.valueChanges, {
    initialValue: this.form.controls.email.value,
  });
  private readonly passwordValue = toSignal(this.form.controls.password.valueChanges, {
    initialValue: this.form.controls.password.value,
  });

  private syncWith(existing: ManagedUser | null): void {
    this.submitted.set(false);
    this.submitError.set(null);
    const password = this.form.controls.password;
    const email = this.form.controls.email;

    if (existing) {
      this.form.reset({
        name: existing.name,
        email: existing.email,
        password: '',
        role: existing.role,
      });
      email.disable();
      password.clearValidators();
    } else {
      this.form.reset({ name: '', email: '', password: '', role: 'BIBLIOTECARIO' });
      email.enable();
      password.setValidators([Validators.required, Validators.minLength(8)]);
    }
    password.updateValueAndValidity();
  }

  protected readonly nameError = computed(() => {
    this.nameValue();
    if (!this.submitted()) return null;
    const control = this.form.controls.name;
    if (control.hasError('required')) return 'El nombre es obligatorio';
    if (control.hasError('maxlength')) return 'El nombre no puede superar los 150 caracteres';
    return null;
  });

  protected readonly emailError = computed(() => {
    this.emailValue();
    if (!this.submitted() || this.isEdit()) return null;
    const control = this.form.controls.email;
    if (control.hasError('required')) return 'El correo es obligatorio';
    if (control.hasError('email')) return 'El correo no tiene un formato válido';
    return null;
  });

  protected readonly passwordError = computed(() => {
    this.passwordValue();
    if (!this.submitted() || this.isEdit()) return null;
    const control = this.form.controls.password;
    if (control.hasError('required')) return 'La contraseña es obligatoria';
    if (control.hasError('minlength')) return 'La contraseña debe tener al menos 8 caracteres';
    return null;
  });

  protected submit(): void {
    this.submitted.set(true);
    this.submitError.set(null);

    if (this.form.invalid) {
      return;
    }

    const { name, email, password, role } = this.form.getRawValue();
    const target = this.user();
    const request$ = target
      ? this.admin.updateUser(target.id, { name, role })
      : this.admin.createUser({ name, email, password, role });

    this.submitting.set(true);
    request$.subscribe({
      next: () => {
        this.submitting.set(false);
        this.saved.emit();
      },
      error: (error: HttpErrorResponse) => {
        this.submitting.set(false);
        this.submitError.set(
          error.status === 409
            ? 'Ya existe una cuenta con ese correo.'
            : 'No se pudo guardar la cuenta. Intenta de nuevo.',
        );
      },
    });
  }

  protected cancel(): void {
    this.cancelled.emit();
  }
}
