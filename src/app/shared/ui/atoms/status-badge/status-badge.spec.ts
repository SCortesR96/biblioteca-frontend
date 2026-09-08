import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusBadge } from './status-badge';

describe('StatusBadge', () => {
  let fixture: ComponentFixture<StatusBadge>;

  async function render(status: 'DISPONIBLE' | 'PRESTADO' | 'RESERVADO') {
    fixture = TestBed.createComponent(StatusBadge);
    fixture.componentRef.setInput('status', status);
    fixture.detectChanges();
    await fixture.whenStable();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [StatusBadge] }).compileComponents();
  });

  it('shows "Disponible" for DISPONIBLE', async () => {
    await render('DISPONIBLE');
    expect(fixture.nativeElement.textContent).toContain('Disponible');
  });

  it('shows "Prestado" for PRESTADO', async () => {
    await render('PRESTADO');
    expect(fixture.nativeElement.textContent).toContain('Prestado');
  });

  it('shows "Reservado" for RESERVADO', async () => {
    await render('RESERVADO');
    expect(fixture.nativeElement.textContent).toContain('Reservado');
  });
});
