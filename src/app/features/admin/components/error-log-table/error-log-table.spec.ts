import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { ErrorLogEntry } from '../../../../core/services/admin.types';
import { ErrorLogTable } from './error-log-table';

const logs: ErrorLogEntry[] = [
  {
    id: 1, level: 'ERROR', message: 'Fallo al enviar correo', exceptionType: 'jakarta.mail.MessagingException',
    path: '/api/loans', httpMethod: 'POST', createdAt: '2026-06-15T08:00:00Z',
  },
];

describe('ErrorLogTable', () => {
  let fixture: ComponentFixture<ErrorLogTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ErrorLogTable] }).compileComponents();
    fixture = TestBed.createComponent(ErrorLogTable);
    fixture.componentRef.setInput('logs', logs);
    fixture.detectChanges();
  });

  it('renders one row per log entry', () => {
    expect(fixture.nativeElement.textContent).toContain('Fallo al enviar correo');
    expect(fixture.nativeElement.textContent).toContain('jakarta.mail.MessagingException');
  });

  it('shows an empty message when there are no logs', async () => {
    fixture.componentRef.setInput('logs', []);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('No hay errores registrados');
  });
});
