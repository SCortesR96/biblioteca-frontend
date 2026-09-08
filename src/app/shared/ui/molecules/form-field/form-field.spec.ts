import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormField } from './form-field';

@Component({
  imports: [FormField],
  template: `
    <app-form-field label="Correo" inputId="email" [errorMessage]="errorMessage">
      <input id="email" data-testid="projected-input" />
    </app-form-field>
  `,
})
class HostComponent {
  errorMessage: string | null = null;
}

describe('FormField', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
  });

  it('renders the label associated with the input id, and projects the content', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    const label = fixture.nativeElement.querySelector('label') as HTMLLabelElement;
    expect(label.textContent?.trim()).toBe('Correo');
    expect(label.getAttribute('for')).toBe('email');
    expect(fixture.nativeElement.querySelector('[data-testid="projected-input"]')).toBeTruthy();
  });

  it('does not render an error message when there is none', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
  });

  it('renders the error message when provided', async () => {
    fixture.componentInstance.errorMessage = 'El correo es obligatorio';
    fixture.detectChanges();
    await fixture.whenStable();

    const alert = fixture.nativeElement.querySelector('[role="alert"]');
    expect(alert?.textContent?.trim()).toBe('El correo es obligatorio');
  });
});
