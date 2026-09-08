import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import type { MenuItem } from 'primeng/api';
import { Avatar } from 'primeng/avatar';
import { Menu } from 'primeng/menu';
import { Auth } from '../../../../core/services/auth';
import { Theme } from '../../../../core/services/theme';
import { Button } from '../../atoms/button/button';

/**
 * Barra superior única de la app (vive en `app.html`, ver esa nota). El logo apunta a
 * `public/img/logo.png` (queda servido en `/img/logo.png`) — para cambiarlo alcanza con
 * reemplazar ese archivo, no hace falta tocar este componente. Si no carga (se borró, ruta
 * rota), se oculta solo y el nombre de la app sigue siendo el ancla visual.
 */
@Component({
  selector: 'app-header',
  imports: [Button, RouterLink, RouterLinkActive, Avatar, Menu],
  templateUrl: './app-header.html',
  styleUrl: './app-header.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppHeader {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  protected readonly theme = inject(Theme);

  protected readonly currentUser = this.auth.currentUser;
  protected readonly logoBroken = signal(false);

  protected readonly initials = computed(() => {
    const name = this.currentUser()?.name ?? '';
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]!.toUpperCase())
      .join('');
  });

  protected readonly userMenuItems = computed<MenuItem[]>(() => {
    const user = this.currentUser();
    return [
      { label: user ? `${user.name} · ${user.role}` : '', disabled: true },
      { separator: true },
      { label: 'Cerrar sesión', icon: 'pi pi-sign-out', command: () => this.logout() },
    ];
  });

  protected logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
