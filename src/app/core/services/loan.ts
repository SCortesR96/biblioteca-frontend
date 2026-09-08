import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { LoanItem } from './loan.types';

@Injectable({
  providedIn: 'root',
})
export class Loan {
  private readonly http = inject(HttpClient);

  readonly myLoans = signal<LoanItem[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  loadMine(): void {
    this.loading.set(true);
    this.error.set(null);

    this.http.get<LoanItem[]>(`${environment.apiUrl}/loans/mine`).subscribe({
      next: (loans) => {
        this.myLoans.set(loans);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar tus préstamos. Intenta de nuevo.');
        this.loading.set(false);
      },
    });
  }

  create(bookId: number): Observable<LoanItem> {
    return this.http.post<LoanItem>(`${environment.apiUrl}/loans`, { bookId });
  }

  returnLoan(id: number): Observable<LoanItem> {
    return this.http
      .put<LoanItem>(`${environment.apiUrl}/loans/${id}/return`, {})
      .pipe(tap(() => this.loadMine()));
  }
}
