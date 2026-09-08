import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import type { MenuItem } from 'primeng/api';
import { Avatar } from 'primeng/avatar';
import { Menu } from 'primeng/menu';
import { Auth } from '../../../../core/services/auth';
import { Theme } from '../../../../core/services/theme';

// Barra superior única de la app (vive en app.html). Logo en public/img/logo.png; si no
// carga, se oculta solo. El toggle de tema es un <button> nativo con solo el ícono, sin
// el estilo "pastilla" del atom Button.
@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, Avatar, Menu],
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
