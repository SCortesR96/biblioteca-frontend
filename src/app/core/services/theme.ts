import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'biblioteca.theme';
type ThemeMode = 'light' | 'dark';

// Toggle de tema: unifica Tailwind (custom variant en styles.css) y PrimeNG
// (darkModeSelector) bajo la misma clase .dark en <html>. Se recuerda en localStorage;
// si no hay nada guardado, arranca según la preferencia del sistema.
@Injectable({
  providedIn: 'root',
})
export class Theme {
  readonly isDark = signal(this.readInitial());

  constructor() {
    this.apply(this.isDark());
  }

  toggle(): void {
    this.set(!this.isDark());
  }

  set(dark: boolean): void {
    this.isDark.set(dark);
    this.apply(dark);
    try {
      localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light');
    } catch {
      // localStorage puede no estar disponible (modo privado, storage bloqueado): el
      // tema simplemente no se recuerda entre visitas, la app sigue funcionando.
    }
  }

  private apply(dark: boolean): void {
    document.documentElement.classList.toggle('dark', dark);
  }

  private readInitial(): boolean {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
      if (stored === 'dark') return true;
      if (stored === 'light') return false;
    } catch {
      // idem apply()
    }
    return typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  }
}
