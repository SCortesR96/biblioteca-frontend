import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject, of, throwError } from 'rxjs';
import { Auth } from '../../../../core/services/auth';
import type { AuthResponse, LoginPayload } from '../../../../core/services/auth.types';
import { LoginForm } from './login-form';

describe('LoginForm', () => {
  let fixture: ComponentFixture<LoginForm>;
  let component: LoginForm;
  let authStub: { login: ReturnType<typeof vi.fn> };

  const authResponse: AuthResponse = {
    token: 'jwt-abc',
    name: 'Ana',
    email: 'ana@biblioteca.com',
    role: 'BIBLIOTECARIO',
  };

  beforeEach(async () => {
    authStub = { login: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [LoginForm],
      providers: [{ provide: Auth, useValue: authStub }],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  function nativeInputs(): { email: HTMLInputElement; password: HTMLInputElement } {
    const inputs = fixture.nativeElement.querySelectorAll('input');
    return { email: inputs[0], password: inputs[1] };
  }

  function fillForm(email: string, password: string): void {
    const { email: emailInput, password: passwordInput } = nativeInputs();
    emailInput.value = email;
    emailInput.dispatchEvent(new Event('input'));
    passwordInput.value = password;
    passwordInput.dispatchEvent(new Event('input'));
  }

  async function submit(): Promise<void> {
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  function submitButton(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('button[type="submit"]');
  }

  it('does not call Auth.login and shows required errors when the form is empty', async () => {
    await submit();

    expect(authStub.login).not.toHaveBeenCalled();
    const errors = fixture.nativeElement.querySelectorAll('[role="alert"]');
    expect(errors.length).toBeGreaterThanOrEqual(2); // correo obligatorio + contraseña obligatoria
  });

  it('shows an email-format error without calling Auth.login', async () => {
    fillForm('no-es-un-correo', 'password123');
    await submit();

    expect(authStub.login).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('no tiene un formato válido');
  });

  it('calls Auth.login with the form values and emits loggedIn on success', async () => {
    authStub.login.mockReturnValue(of(authResponse));
    const loggedInSpy = vi.fn();
    component.loggedIn.subscribe(loggedInSpy);

    fillForm('ana@biblioteca.com', 'password123');
    await submit();

    const payload = authStub.login.mock.calls[0][0] as LoginPayload;
    expect(payload).toEqual({ email: 'ana@biblioteca.com', password: 'password123' });
    expect(loggedInSpy).toHaveBeenCalled();
  });

  it('shows a specific message on 401 and re-enables the submit button', async () => {
    authStub.login.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 401 })));

    fillForm('ana@biblioteca.com', 'incorrecta');
    await submit();

    expect(fixture.nativeElement.textContent).toContain('Correo o contraseña incorrectos');
    expect(submitButton().disabled).toBe(false);
  });

  it('shows a generic message on unexpected errors', async () => {
    authStub.login.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 500 })));

    fillForm('ana@biblioteca.com', 'password123');
    await submit();

    expect(fixture.nativeElement.textContent).toContain('No se pudo iniciar sesión');
  });

  it('disables the submit button while the request is in flight', async () => {
    const pending = new Subject<AuthResponse>();
    authStub.login.mockReturnValue(pending.asObservable());

    fillForm('ana@biblioteca.com', 'password123');
    await submit();

    expect(submitButton().disabled).toBe(true);

    pending.next(authResponse);
    pending.complete();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(submitButton().disabled).toBe(false);
  });

  it('ignores a second submit while the first request is still in flight', async () => {
    const pending = new Subject<AuthResponse>();
    authStub.login.mockReturnValue(pending.asObservable());

    fillForm('ana@biblioteca.com', 'password123');
    await submit();
    await submit(); // segundo clic/Enter antes de que responda el primero

    expect(authStub.login).toHaveBeenCalledTimes(1);
  });
});
