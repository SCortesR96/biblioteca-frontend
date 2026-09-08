import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { signal } from '@angular/core';
import { Auth } from '../../../../core/services/auth';
import { Theme } from '../../../../core/services/theme';
import { AppHeader } from './app-header';

describe('AppHeader', () => {
  let fixture: ComponentFixture<AppHeader>;
  let authStub: { currentUser: ReturnType<typeof signal>; logout: ReturnType<typeof vi.fn> };
  let themeStub: { isDark: ReturnType<typeof signal>; toggle: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    authStub = {
      currentUser: signal({ name: 'Ana Torres', email: 'ana@biblioteca.com', role: 'BIBLIOTECARIO' }),
      logout: vi.fn(),
    };
    themeStub = { isDark: signal(false), toggle: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [AppHeader],
      providers: [
        provideRouter([]),
        { provide: Auth, useValue: authStub },
        { provide: Theme, useValue: themeStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppHeader);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('shows the avatar with the user initials when there is a session', () => {
    expect(fixture.nativeElement.querySelector('p-avatar')).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('AT');
  });

  it('logs out and navigates to /login when the menu item is activated', () => {
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigateByUrl');

    fixture.componentInstance['logout']();

    expect(authStub.logout).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith('/login');
  });

  it('the user menu model includes the name/role header and a logout item', () => {
    const items = fixture.componentInstance['userMenuItems']();
    expect(items[0].label).toBe('Ana Torres · BIBLIOTECARIO');
    expect(items[0].disabled).toBe(true);
    expect(items.at(-1)!.label).toBe('Cerrar sesión');
  });

  it('hides the avatar when there is no session', async () => {
    authStub.currentUser.set(null);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('p-avatar')).toBeNull();
  });

  it('shows navigation links to the catalog and "Mis préstamos" when there is a session', () => {
    const links = fixture.nativeElement.querySelectorAll('nav a');
    const hrefs = Array.from(links).map((a) => (a as HTMLAnchorElement).getAttribute('href'));
    expect(hrefs).toContain('/');
    expect(hrefs).toContain('/my-loans');
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

  it('toggles the theme when the theme icon button is clicked', () => {
    const toggleButton = fixture.nativeElement.querySelector('button[aria-label*="tema"]') as HTMLButtonElement;
    toggleButton.dispatchEvent(new Event('click'));

    expect(themeStub.toggle).toHaveBeenCalled();
  });

  it('shows a moon icon in light mode and a sun icon in dark mode', async () => {
    expect(fixture.nativeElement.querySelector('.pi-moon')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.pi-sun')).toBeNull();

    themeStub.isDark.set(true);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.pi-sun')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.pi-moon')).toBeNull();
  });
});
