import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'biblioteca.theme';
type ThemeMode = 'light' | 'dark';

/**
 * Toggle manual de tema. Antes no existía ninguno: Tailwind aplicaba sus clases `dark:`
 * según `prefers-color-scheme` del sistema operativo (vía el custom variant en
 * `styles.css`), mientras que el tema de PrimeNG solo cambia con la clase `.dark`
 * (`darkModeSelector` en `app.config.ts`) — dos mecanismos independientes que este
 * servicio unifica: ambos ahora dependen exclusivamente de la clase `.dark` en `<html>`,
 * que es lo único que este servicio toca.
 *
 * La preferencia se recuerda en `localStorage`; si no hay ninguna guardada, se arranca
 * respetando la preferencia del sistema operativo (no forzando claro ni oscuro).
 */
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
