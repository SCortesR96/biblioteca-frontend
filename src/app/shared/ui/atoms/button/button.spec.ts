import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Button } from './button';

describe('Button', () => {
  let component: Button;
  let fixture: ComponentFixture<Button>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Button],
    }).compileComponents();

    fixture = TestBed.createComponent(Button);
    fixture.componentRef.setInput('label', 'Ingresar');
    component = fixture.componentInstance;
  });

  function nativeButton(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('button') as HTMLButtonElement;
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders the given label and defaults to type="button"', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    expect(nativeButton().type).toBe('button');
    expect(nativeButton().textContent).toContain('Ingresar');
  });

  it('renders type="submit" when requested', async () => {
    fixture.componentRef.setInput('type', 'submit');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(nativeButton().type).toBe('submit');
  });

  it('disables the button while loading, even if disabled input is false', async () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(nativeButton().disabled).toBe(true);
  });

  it('disables the button when disabled input is true', async () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(nativeButton().disabled).toBe(true);
  });
});
