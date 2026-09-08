import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { LoginPage } from './login-page';

describe('LoginPage', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders the login form', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('app-login-form')).toBeTruthy();
  });

  it('navigates to "/" when the login form emits loggedIn', () => {
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigateByUrl');

    (component as unknown as { onLoggedIn: () => void }).onLoggedIn();

    expect(navigateSpy).toHaveBeenCalledWith('/');
  });
});
