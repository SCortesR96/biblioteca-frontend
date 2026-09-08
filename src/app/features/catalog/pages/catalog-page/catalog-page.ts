import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Auth } from '../../../../core/services/auth';
import { Book } from '../../../../core/services/book';
import type { BookItem, BookSearchParams } from '../../../../core/services/book.types';
import { Loan } from '../../../../core/services/loan';
import { Reservation } from '../../../../core/services/reservation';
import { AppHeader } from '../../../../shared/ui/organisms/app-header/app-header';
import { BookForm } from '../../components/book-form/book-form';
import { CatalogSearch } from '../../components/catalog-search/catalog-search';
import { CatalogTable } from '../../components/catalog-table/catalog-table';
import { Button } from '../../../../shared/ui/atoms/button/button';

@Component({
  selector: 'app-catalog-page',
  imports: [AppHeader, CatalogSearch, CatalogTable, BookForm, Button],
  templateUrl: './catalog-page.html',
  styleUrl: './catalog-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogPage {
  private readonly bookService = inject(Book);
  private readonly loanService = inject(Loan);
  private readonly reservationService = inject(Reservation);
  private readonly auth = inject(Auth);

  protected readonly books = this.bookService.books;
  protected readonly loading = this.bookService.loading;
  protected readonly error = this.bookService.error;
  protected readonly isAdmin = this.auth.isAdmin;

  protected readonly showForm = signal(false);
  private currentParams: BookSearchParams = {};

  constructor() {
    this.bookService.search();
  }

  protected onSearch(params: BookSearchParams): void {
    this.currentParams = params;
    this.bookService.search(params);
  }

  protected onBookCreated(): void {
    this.showForm.set(false);
    this.bookService.search(this.currentParams);
  }

  protected onDelete(book: BookItem): void {
    // window.confirm/alert: pragmático para esta fase — un ConfirmDialog/Toast de PrimeNG
    // queda como mejora de UI, no cambia la lógica de negocio ni el contrato con la API.
    if (!window.confirm(`¿Eliminar "${book.title}"? Esta acción no se puede deshacer.`)) {
      return;
    }
    this.bookService.delete(book.id).subscribe({
      next: () => this.bookService.search(this.currentParams),
      error: () => window.alert('No se pudo eliminar el libro. Verifica que esté disponible.'),
    });
  }

  protected onBorrow(book: BookItem): void {
    this.loanService.create(book.id).subscribe({
      next: () => {
        window.alert(`"${book.title}" quedó registrado en tus préstamos.`);
        this.bookService.search(this.currentParams);
      },
      error: (error: HttpErrorResponse) => {
        window.alert(
          error.status === 409
            ? 'No se pudo completar el préstamo: el libro ya no está disponible o tu cuenta está bloqueada.'
            : 'No se pudo pedir el préstamo. Intenta de nuevo.',
        );
      },
    });
  }

  protected onReserve(book: BookItem): void {
    this.reservationService.create(book.id).subscribe({
      next: () => window.alert(`Quedaste en la fila de espera de "${book.title}". Te avisaremos cuando esté disponible.`),
      error: (error: HttpErrorResponse) => {
        window.alert(
          error.status === 409
            ? 'No se pudo reservar: el libro está disponible o ya tienes una reserva pendiente para él.'
            : 'No se pudo reservar el libro. Intenta de nuevo.',
        );
      },
    });
  }
}
