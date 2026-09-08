import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { BlockedUser } from '../../../../core/services/admin.types';
import { BlockedUsersTable } from './blocked-users-table';

const users: BlockedUser[] = [
  { id: 1, name: 'Ana', email: 'ana@biblioteca.com', blockedUntil: '2026-06-22T00:00:00Z' },
];

describe('BlockedUsersTable', () => {
  let fixture: ComponentFixture<BlockedUsersTable>;
  let component: BlockedUsersTable;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [BlockedUsersTable] }).compileComponents();
    fixture = TestBed.createComponent(BlockedUsersTable);
    fixture.componentRef.setInput('users', users);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('renders one row per blocked user', () => {
    expect(fixture.nativeElement.textContent).toContain('ana@biblioteca.com');
  });

  it('shows an empty message when there are no blocked users', async () => {
    fixture.componentRef.setInput('users', []);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('No hay cuentas bloqueadas');
  });

  it('emits unblock with the right user when clicked', () => {
    const emitted: BlockedUser[] = [];
    component.unblock.subscribe((user) => emitted.push(user));

    fixture.nativeElement.querySelector('app-button').dispatchEvent(new Event('click'));

    expect(emitted).toEqual([users[0]]);
  });
});
