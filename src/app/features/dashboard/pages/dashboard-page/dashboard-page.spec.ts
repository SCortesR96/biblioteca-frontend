import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { signal } from '@angular/core';
import { Auth } from '../../../../core/services/auth';
import { DashboardPage } from './dashboard-page';

describe('DashboardPage', () => {
  let component: DashboardPage;
  let fixture: ComponentFixture<DashboardPage>;
  let authStub: { currentUser: ReturnType<typeof signal>; logout: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    authStub = {
      currentUser: signal({ name: 'Ana', email: 'ana@biblioteca.com', role: 'BIBLIOTECARIO' }),
      logout: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [DashboardPage],
      providers: [provideRouter([]), { provide: Auth, useValue: authStub }],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('greets the current user by name and shows their role', () => {
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Ana');
    expect(text).toContain('BIBLIOTECARIO');
  });

  it('logs out and navigates to /login when the logout button is clicked', () => {
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigateByUrl');

    fixture.nativeElement.querySelector('app-button').dispatchEvent(new Event('click'));

    expect(authStub.logout).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith('/login');
  });
});
