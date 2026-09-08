import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextInput } from './text-input';

describe('TextInput', () => {
  let component: TextInput;
  let fixture: ComponentFixture<TextInput>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextInput],
    }).compileComponents();

    fixture = TestBed.createComponent(TextInput);
    fixture.componentRef.setInput('id', 'email');
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  function nativeInput(): HTMLInputElement {
    return fixture.nativeElement.querySelector('input') as HTMLInputElement;
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('writeValue() reflects the given value in the rendered input', async () => {
    component.writeValue('hola@biblioteca.com');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(nativeInput().value).toBe('hola@biblioteca.com');
  });

  it('typing calls the registered onChange callback with the new value', async () => {
    const onChange = vi.fn();
    component.registerOnChange(onChange);
    fixture.detectChanges();
    await fixture.whenStable();

    const input = nativeInput();
    input.value = 'ana@biblioteca.com';
    input.dispatchEvent(new Event('input'));

    expect(onChange).toHaveBeenCalledWith('ana@biblioteca.com');
  });

  it('blurring calls the registered onTouched callback', () => {
    const onTouched = vi.fn();
    component.registerOnTouched(onTouched);
    fixture.detectChanges();

    nativeInput().dispatchEvent(new Event('blur'));

    expect(onTouched).toHaveBeenCalled();
  });

  it('setDisabledState() disables the native input', async () => {
    component.setDisabledState(true);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(nativeInput().disabled).toBe(true);
  });
});
