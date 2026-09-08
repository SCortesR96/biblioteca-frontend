import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { ActivityLogEntry } from '../../../../core/services/admin.types';
import { ActivityLogTable } from './activity-log-table';

const entries: ActivityLogEntry[] = [
  {
    id: 1,
    actorEmail: 'ana@biblioteca.com',
    action: 'LOAN_CREATED',
    description: '«Matilda» — ana@biblioteca.com',
    createdAt: '2026-06-15T10:00:00Z',
  },
  {
    id: 2,
    actorEmail: null,
    action: 'LOGIN',
    description: 'Sistema',
    createdAt: '2026-06-15T09:00:00Z',
  },
];

describe('ActivityLogTable', () => {
  let fixture: ComponentFixture<ActivityLogTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ActivityLogTable] }).compileComponents();
    fixture = TestBed.createComponent(ActivityLogTable);
    fixture.componentRef.setInput('entries', entries);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('renders one row per entry with a human-readable action label', () => {
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('«Matilda» — ana@biblioteca.com');
    expect(text).toContain('Préstamo pedido');
    expect(text).toContain('Inicio de sesión');
  });

  it('shows "sistema" when there is no actor', () => {
    expect(fixture.nativeElement.textContent).toContain('sistema');
  });

  it('shows an empty message when there is no activity', async () => {
    fixture.componentRef.setInput('entries', []);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('Todavía no hay actividad');
  });
});
