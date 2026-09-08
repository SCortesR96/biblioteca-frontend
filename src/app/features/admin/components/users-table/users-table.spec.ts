import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { ManagedUser } from '../../../../core/services/admin.types';
import { UsersTable } from './users-table';

const activeUser: ManagedUser = {
  id: 1,
  name: 'Ana',
  email: 'ana@biblioteca.com',
  role: 'ADMIN',
  blockedUntil: null,
  blocked: false,
  createdAt: '2026-01-01T00:00:00Z',
};
const blockedUser: ManagedUser = {
  id: 2,
  name: 'Beto',
  email: 'beto@biblioteca.com',
  role: 'BIBLIOTECARIO',
  blockedUntil: '2026-06-22T00:00:00Z',
  blocked: true,
  createdAt: '2026-02-01T00:00:00Z',
};

function buttonByText(host: HTMLElement, text: string): HTMLElement {
  const match = Array.from(host.querySelectorAll('app-button')).find(
    (el) => (el.textContent ?? '').trim() === text,
  );
  if (!match) throw new Error(`no <app-button> with text "${text}"`);
  return match as HTMLElement;
}

describe('UsersTable', () => {
  let fixture: ComponentFixture<UsersTable>;
  let component: UsersTable;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [UsersTable] }).compileComponents();
    fixture = TestBed.createComponent(UsersTable);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('users', [activeUser, blockedUser]);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('renders one row per user with role and status', () => {
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('ana@biblioteca.com');
    expect(text).toContain('beto@biblioteca.com');
    expect(text).toContain('Administrador');
    expect(text).toContain('Activa');
    expect(text).toContain('Bloqueada');
  });

  it('shows an empty message when there are no users', async () => {
    fixture.componentRef.setInput('users', []);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('No hay usuarios');
  });

  it('offers "Bloquear" for an active user and "Desbloquear" for a blocked one', () => {
    const host = fixture.nativeElement as HTMLElement;
    expect(() => buttonByText(host, 'Bloquear')).not.toThrow();
    expect(() => buttonByText(host, 'Desbloquear')).not.toThrow();
  });

  it('emits block for the active user and unblock for the blocked one', () => {
    const host = fixture.nativeElement as HTMLElement;
    const blocked: ManagedUser[] = [];
    const unblocked: ManagedUser[] = [];
    component.block.subscribe((u) => blocked.push(u));
    component.unblock.subscribe((u) => unblocked.push(u));

    buttonByText(host, 'Bloquear').dispatchEvent(new Event('click'));
    buttonByText(host, 'Desbloquear').dispatchEvent(new Event('click'));

    expect(blocked).toEqual([activeUser]);
    expect(unblocked).toEqual([blockedUser]);
  });

  it('emits edit with the first user when its "Editar" button is clicked', () => {
    const host = fixture.nativeElement as HTMLElement;
    const edited: ManagedUser[] = [];
    component.edit.subscribe((u) => edited.push(u));

    buttonByText(host, 'Editar').dispatchEvent(new Event('click'));

    expect(edited).toEqual([activeUser]);
  });
});
