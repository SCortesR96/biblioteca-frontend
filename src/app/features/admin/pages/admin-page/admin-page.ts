import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Admin } from '../../../../core/services/admin';
import type { BlockedUser } from '../../../../core/services/admin.types';
import { UiFeedback } from '../../../../core/services/ui-feedback';
import { StatCard } from '../../../../shared/ui/atoms/stat-card/stat-card';
import { BlockedUsersTable } from '../../components/blocked-users-table/blocked-users-table';
import { ErrorLogTable } from '../../components/error-log-table/error-log-table';

/**
 * Une los tres bloques del panel: stats, cuentas bloqueadas y bitácora de errores. Cada
 * bloque es su propio sub-componente "tonto" (recibe datos por input, emite eventos) — la
 * página es la única que conoce el servicio {@link Admin}, mismo patrón que
 * {@code CatalogPage}/{@code MyLoansPage}.
 */
@Component({
  selector: 'app-admin-page',
  imports: [StatCard, BlockedUsersTable, ErrorLogTable],
  templateUrl: './admin-page.html',
  styleUrl: './admin-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminPage implements OnInit {
  private readonly admin = inject(Admin);
  private readonly ui = inject(UiFeedback);

  protected readonly stats = this.admin.stats;
  protected readonly blockedUsers = this.admin.blockedUsers;
  protected readonly errorLogs = this.admin.errorLogs;

  ngOnInit(): void {
    this.admin.loadStats();
    this.admin.loadBlockedUsers();
    this.admin.loadErrorLogs();
  }

  protected async onUnblock(user: BlockedUser): Promise<void> {
    const confirmed = await this.ui.confirm({
      message: `¿Desbloquear la cuenta de ${user.name}? Podrá volver a pedir préstamos de inmediato.`,
      header: 'Desbloquear cuenta',
      acceptLabel: 'Sí, desbloquear',
      severity: 'warn',
    });
    if (!confirmed) {
      return;
    }
    this.admin.unblockUser(user.id).subscribe({
      next: () => {
        this.ui.success(`La cuenta de ${user.name} fue desbloqueada.`);
        this.admin.loadStats();
      },
      error: () => this.ui.error('No se pudo desbloquear la cuenta. Intenta de nuevo.'),
    });
  }
}
