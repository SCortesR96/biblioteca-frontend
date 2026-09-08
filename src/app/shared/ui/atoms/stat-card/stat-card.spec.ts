import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatCard } from './stat-card';

describe('StatCard', () => {
  let fixture: ComponentFixture<StatCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [StatCard] }).compileComponents();
    fixture = TestBed.createComponent(StatCard);
    fixture.componentRef.setInput('label', 'Préstamos activos');
    fixture.componentRef.setInput('value', 5);
    fixture.detectChanges();
  });

  it('shows the label and the value', () => {
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Préstamos activos');
    expect(text).toContain('5');
  });
});
