import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../../../../core/services/auth';
import { Button } from '../../../../shared/ui/atoms/button/button';

/**
 * Landing autenticado temporal: confirma que el login/JWT/guard funcionan de punta a
 * punta. Se reemplaza por el catálogo real en la fase 2 (probablemente movido a otra
 * ruta si conviene mantener un dashboard aparte).
 */
@Component({
  selector: 'app-dashboard-page',
  imports: [Button],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  protected readonly currentUser = this.auth.currentUser;

  protected logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
