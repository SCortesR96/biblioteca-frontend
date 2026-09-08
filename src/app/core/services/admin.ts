import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { LoanItem } from './loan.types';
import type {
  ActivityLogPage,
  AdminStats,
  CreateUserPayload,
  ErrorLogPage,
  ManagedUser,
  UpdateUserPayload,
} from './admin.types';

/**
 * Todo lo del panel de administración: stats, gestión de usuarios y bitácora de errores.
 * Mismo patrón que {@code Book}/{@code Loan}: el estado que varias vistas comparten vive en
 * signals del servicio; las acciones puntuales (crear, editar, eliminar, bloquear...)
 * devuelven un Observable y se auto-refrescan la lista en el `tap`, dejando que quien llama
 * decida cómo mostrar su propio feedback de éxito/error.
 *
 * <p>La gestión de usuarios (y el bloqueo manual) es una extensión sobre lo que pide el
 * enunciado — ver decisión en el README.</p>
 */
@Injectable({
  providedIn: 'root',
})
export class Admin {
  private readonly http = inject(HttpClient);

  readonly stats = signal<AdminStats | null>(null);
  readonly users = signal<ManagedUser[]>([]);
  readonly loans = signal<LoanItem[]>([]);
  readonly loansIncludeReturned = signal(false);
  readonly activity = signal<ActivityLogPage | null>(null);
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

  loadUsers(): void {
    this.http.get<ManagedUser[]>(`${environment.apiUrl}/admin/users`).subscribe({
      next: (users) => this.users.set(users),
      error: () => this.error.set('No se pudo cargar la lista de usuarios.'),
    });
  }

  createUser(payload: CreateUserPayload): Observable<ManagedUser> {
    return this.http
      .post<ManagedUser>(`${environment.apiUrl}/admin/users`, payload)
      .pipe(tap(() => this.loadUsers()));
  }

  updateUser(id: number, payload: UpdateUserPayload): Observable<ManagedUser> {
    return this.http
      .put<ManagedUser>(`${environment.apiUrl}/admin/users/${id}`, payload)
      .pipe(tap(() => this.loadUsers()));
  }

  deleteUser(id: number): Observable<void> {
    return this.http
      .delete<void>(`${environment.apiUrl}/admin/users/${id}`)
      .pipe(tap(() => this.loadUsers()));
  }

  blockUser(id: number, days: number): Observable<ManagedUser> {
    return this.http
      .put<ManagedUser>(`${environment.apiUrl}/admin/users/${id}/block`, { days })
      .pipe(tap(() => this.loadUsers()));
  }

  unblockUser(id: number): Observable<void> {
    return this.http
      .put<void>(`${environment.apiUrl}/admin/users/${id}/unblock`, {})
      .pipe(tap(() => this.loadUsers()));
  }

  loadLoans(includeReturned = false): void {
    this.loansIncludeReturned.set(includeReturned);
    const params = new HttpParams().set('includeReturned', String(includeReturned));
    this.http.get<LoanItem[]>(`${environment.apiUrl}/admin/loans`, { params }).subscribe({
      next: (loans) => this.loans.set(loans),
      error: () => this.error.set('No se pudo cargar la lista de préstamos.'),
    });
  }

  /**
   * Devuelve un préstamo en nombre de quien lo pidió. Usa el mismo endpoint que la vista
   * "Mis préstamos" (`PUT /loans/{id}/return`), que ya acepta al dueño o a un ADMIN;
   * refresca la lista respetando el filtro "incluir devueltos" activo.
   */
  returnLoan(id: number): Observable<LoanItem> {
    return this.http
      .put<LoanItem>(`${environment.apiUrl}/loans/${id}/return`, {})
      .pipe(tap(() => this.loadLoans(this.loansIncludeReturned())));
  }

  loadActivity(page = 0, size = 30): void {
    const params = new HttpParams().set('page', String(page)).set('size', String(size));
    this.http.get<ActivityLogPage>(`${environment.apiUrl}/admin/activity`, { params }).subscribe({
      next: (result) => this.activity.set(result),
      error: () => this.error.set('No se pudo cargar la bitácora de actividad.'),
    });
  }

  loadErrorLogs(page = 0, size = 20): void {
    const params = new HttpParams().set('page', String(page)).set('size', String(size));
    this.http.get<ErrorLogPage>(`${environment.apiUrl}/admin/logs`, { params }).subscribe({
      next: (result) => this.errorLogs.set(result),
      error: () => this.error.set('No se pudo cargar la bitácora de errores.'),
    });
  }
}
