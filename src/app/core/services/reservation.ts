import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { ReservationItem } from './reservation.types';

@Injectable({
  providedIn: 'root',
})
export class Reservation {
  private readonly http = inject(HttpClient);

  readonly myReservations = signal<ReservationItem[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  loadMine(): void {
    this.loading.set(true);
    this.error.set(null);

    this.http.get<ReservationItem[]>(`${environment.apiUrl}/reservations/mine`).subscribe({
      next: (reservations) => {
        this.myReservations.set(reservations);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar tus reservas. Intenta de nuevo.');
        this.loading.set(false);
      },
    });
  }

  create(bookId: number): Observable<ReservationItem> {
    return this.http.post<ReservationItem>(`${environment.apiUrl}/reservations`, { bookId });
  }

  cancel(id: number): Observable<void> {
    return this.http
      .delete<void>(`${environment.apiUrl}/reservations/${id}`)
      .pipe(tap(() => this.loadMine()));
  }
}
