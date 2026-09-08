import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { AdminStats, BlockedUser, ErrorLogPage } from './admin.types';

/**
 * Todo lo del panel de administración: stats, cuentas bloqueadas y bitácora de errores.
 * Mismo patrón que {@code Book}/{@code Loan}: el estado que varias vistas comparten vive
 * en signals del servicio; las acciones puntuales (desbloquear) devuelven un Observable y
 * dejan que quien llama decida cuándo refrescar.
 */
@Injectable({
  providedIn: 'root',
})
export class Admin {
  private readonly http = inject(HttpClient);

  readonly stats = signal<AdminStats | null>(null);
  readonly blockedUsers = signal<BlockedUser[]>([]);
  readonly errorLogs = signal<ErrorLogPage | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  loadStats(): void {
    this.loading.set(true);
    this.error.set(null);
    this.http.get<AdminStats>(`${environment.apiUrl}/admin/stats`).subscribe({
      next: (stats) => {
        this.stats.set(stats);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las estadísticas.');
        this.loading.set(false);
      },
    });
  }

  loadBlockedUsers(): void {
    this.http.get<BlockedUser[]>(`${environment.apiUrl}/admin/users/blocked`).subscribe({
      next: (users) => this.blockedUsers.set(users),
      error: () => this.error.set('No se pudieron cargar las cuentas bloqueadas.'),
    });
  }

  unblockUser(id: number): Observable<void> {
    return this.http
      .put<void>(`${environment.apiUrl}/admin/users/${id}/unblock`, {})
      .pipe(tap(() => this.loadBlockedUsers()));
  }

  loadErrorLogs(page = 0, size = 20): void {
    const params = new HttpParams().set('page', String(page)).set('size', String(size));
    this.http.get<ErrorLogPage>(`${environment.apiUrl}/admin/logs`, { params }).subscribe({
      next: (result) => this.errorLogs.set(result),
      error: () => this.error.set('No se pudo cargar la bitácora de errores.'),
    });
  }
}
