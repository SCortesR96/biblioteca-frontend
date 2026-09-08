import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OverdueBadge } from './overdue-badge';

describe('OverdueBadge', () => {
  let fixture: ComponentFixture<OverdueBadge>;

  async function render(returned: boolean, overdue: boolean) {
    fixture = TestBed.createComponent(OverdueBadge);
    fixture.componentRef.setInput('returned', returned);
    fixture.componentRef.setInput('overdue', overdue);
    fixture.detectChanges();
    await fixture.whenStable();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [OverdueBadge] }).compileComponents();
  });

  it('shows "Devuelto" when returned, regardless of overdue', async () => {
    await render(true, true);
    expect(fixture.nativeElement.textContent).toContain('Devuelto');
  });

  it('shows "Vencido" when overdue and not returned', async () => {
    await render(false, true);
    expect(fixture.nativeElement.textContent).toContain('Vencido');
  });

  it('shows "Al día" when neither returned nor overdue', async () => {
    await render(false, false);
    expect(fixture.nativeElement.textContent).toContain('Al día');
  });
});
