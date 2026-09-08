import { TestBed } from '@angular/core/testing';
import { Theme } from './theme';

function mockPrefersDark(matches: boolean): void {
  // jsdom no implementa matchMedia por defecto (queda undefined) — hay que definirla
  // entera, no alcanza con vi.spyOn sobre una propiedad que no existe.
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockReturnValue({ matches }),
  });
}

describe('Theme', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('starts in light mode when nothing is stored and the system prefers light', () => {
    mockPrefersDark(false);
    const service = TestBed.inject(Theme);

    expect(service.isDark()).toBe(false);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('starts in dark mode when nothing is stored and the system prefers dark', () => {
    mockPrefersDark(true);
    const service = TestBed.inject(Theme);

    expect(service.isDark()).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('respects a stored preference over the system one', () => {
    localStorage.setItem('biblioteca.theme', 'dark');
    mockPrefersDark(false);

    const service = TestBed.inject(Theme);

    expect(service.isDark()).toBe(true);
  });

  it('toggle() flips the mode, the html class and persists it', () => {
    mockPrefersDark(false);
    const service = TestBed.inject(Theme);

    service.toggle();

    expect(service.isDark()).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('biblioteca.theme')).toBe('dark');

    service.toggle();

    expect(service.isDark()).toBe(false);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('biblioteca.theme')).toBe('light');
  });
});
