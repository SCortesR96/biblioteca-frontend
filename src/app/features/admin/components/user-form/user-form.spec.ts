import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { Admin } from '../../../../core/services/admin';
import type { ManagedUser } from '../../../../core/services/admin.types';
import { UserForm } from './user-form';

const existing: ManagedUser = {
  id: 7,
  name: 'Ana',
  email: 'ana@biblioteca.com',
  role: 'BIBLIOTECARIO',
  blockedUntil: null,
  blocked: false,
  createdAt: '2026-01-01T00:00:00Z',
};

describe('UserForm', () => {
  let fixture: ComponentFixture<UserForm>;
  let component: UserForm;
  let adminStub: { createUser: ReturnType<typeof vi.fn>; updateUser: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    adminStub = {
      createUser: vi.fn().mockReturnValue(of(existing)),
      updateUser: vi.fn().mockReturnValue(of(existing)),
    };

    await TestBed.configureTestingModule({
      imports: [UserForm],
      providers: [{ provide: Admin, useValue: adminStub }],
    }).compileComponents();

    fixture = TestBed.createComponent(UserForm);
    component = fixture.componentInstance;
  });

  it('create mode: does not submit while the form is invalid', () => {
    fixture.detectChanges();

    component['submit']();

    expect(adminStub.createUser).not.toHaveBeenCalled();
    expect(component['nameError']()).toBe('El nombre es obligatorio');
    expect(component['passwordError']()).toBe('La contraseña es obligatoria');
  });

  it('create mode: submits the payload with the chosen role and emits saved', () => {
    fixture.detectChanges();
    const saved = vi.fn();
    component.saved.subscribe(saved);

    component['form'].setValue({
      name: 'Nuevo',
      email: 'nuevo@biblioteca.com',
      password: 'password123',
      role: 'ADMIN',
    });
    component['submit']();

    expect(adminStub.createUser).toHaveBeenCalledWith({
      name: 'Nuevo',
      email: 'nuevo@biblioteca.com',
      password: 'password123',
      role: 'ADMIN',
    });
    expect(saved).toHaveBeenCalled();
  });

  it('create mode: shows a friendly message on a 409 conflict', () => {
    adminStub.createUser.mockReturnValue(throwError(() => ({ status: 409 })));
    fixture.detectChanges();

    component['form'].setValue({
      name: 'Nuevo',
      email: 'dup@biblioteca.com',
      password: 'password123',
      role: 'BIBLIOTECARIO',
    });
    component['submit']();

    expect(component['submitError']()).toContain('Ya existe una cuenta');
  });

  it('edit mode: pre-fills name and role, drops the password requirement, and calls updateUser', () => {
    fixture.componentRef.setInput('user', existing);
    fixture.detectChanges();

    expect(component['isEdit']()).toBe(true);
    expect(component['form'].controls.name.value).toBe('Ana');
    expect(component['form'].controls.role.value).toBe('BIBLIOTECARIO');
    expect(component['form'].controls.email.disabled).toBe(true);

    component['form'].controls.name.setValue('Ana María');
    component['form'].controls.role.setValue('ADMIN');
    component['submit']();

    expect(adminStub.updateUser).toHaveBeenCalledWith(7, { name: 'Ana María', role: 'ADMIN' });
    expect(adminStub.createUser).not.toHaveBeenCalled();
  });

  it('cancel() emits cancelled', () => {
    fixture.detectChanges();
    const cancelled = vi.fn();
    component.cancelled.subscribe(cancelled);

    component['cancel']();

    expect(cancelled).toHaveBeenCalled();
  });
});
