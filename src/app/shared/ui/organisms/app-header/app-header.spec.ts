import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { signal } from '@angular/core';
import { Auth } from '../../../../core/services/auth';
import { AppHeader } from './app-header';

describe('AppHeader', () => {
  let fixture: ComponentFixture<AppHeader>;
  let authStub: { currentUser: ReturnType<typeof signal>; logout: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    authStub = {
      currentUser: signal({ name: 'Ana', email: 'ana@biblioteca.com', role: 'BIBLIOTECARIO' }),
      logout: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [AppHeader],
      providers: [provideRouter([]), { provide: Auth, useValue: authStub }],
    }).compileComponents();

    fixture = TestBed.createComponent(AppHeader);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('shows the current user name and role', () => {
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Ana');
    expect(text).toContain('BIBLIOTECARIO');
  });

  it('logs out and navigates to /login on click', () => {
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigateByUrl');

    fixture.nativeElement.querySelector('app-button').dispatchEvent(new Event('click'));

    expect(authStub.logout).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith('/login');
  });

  it('hides the user block when there is no session', async () => {
    authStub.currentUser.set(null);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('app-button')).toBeNull();
  });

  it('shows navigation links to the catalog and "Mis préstamos" when there is a session', () => {
    const links = fixture.nativeElement.querySelectorAll('nav a');
    const hrefs = Array.from(links).map((a) => (a as HTMLAnchorElement).getAttribute('href'));
    expect(hrefs).toContain('/');
    expect(hrefs).toContain('/mis-prestamos');
  });

  it('hides navigation when there is no session', async () => {
    authStub.currentUser.set(null);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('nav')).toBeNull();
  });

  it('shows the "Administración" link only for ADMIN users', async () => {
    expect(fixture.nativeElement.textContent).not.toContain('Administración');

    authStub.currentUser.set({ name: 'Root', email: 'admin@biblioteca.com', role: 'ADMIN' });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('Administración');
  });
});
