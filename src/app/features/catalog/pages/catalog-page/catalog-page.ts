import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Auth } from '../../../../core/services/auth';
import { Book } from '../../../../core/services/book';
import type { BookItem, BookSearchParams } from '../../../../core/services/book.types';
import { Loan } from '../../../../core/services/loan';
import { Reservation } from '../../../../core/services/reservation';
import { UiFeedback } from '../../../../core/services/ui-feedback';
import { BookForm } from '../../components/book-form/book-form';
import { CatalogSearch } from '../../components/catalog-search/catalog-search';
import { CatalogTable } from '../../components/catalog-table/catalog-table';
import { Button } from '../../../../shared/ui/atoms/button/button';

@Component({
  selector: 'app-catalog-page',
  imports: [CatalogSearch, CatalogTable, BookForm, Button],
  templateUrl: './catalog-page.html',
  styleUrl: './catalog-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogPage {
  private readonly bookService = inject(Book);
  private readonly loanService = inject(Loan);
  private readonly reservationService = inject(Reservation);
  private readonly auth = inject(Auth);
  private readonly ui = inject(UiFeedback);

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

  protected async onDelete(book: BookItem): Promise<void> {
    const confirmed = await this.ui.confirm({
      message: `¿Eliminar "${book.title}"? Esta acción no se puede deshacer.`,
      header: 'Eliminar libro',
      acceptLabel: 'Sí, eliminar',
      severity: 'danger',
    });
    if (!confirmed) {
      return;
    }
    this.bookService.delete(book.id).subscribe({
      next: () => {
        this.ui.success(`"${book.title}" fue eliminado del catálogo.`);
        this.bookService.search(this.currentParams);
      },
      error: () => this.ui.error('No se pudo eliminar el libro. Verifica que esté disponible.'),
    });
  }

  protected async onBorrow(book: BookItem): Promise<void> {
    const confirmed = await this.ui.confirm({
      message: `¿Pedir prestado "${book.title}"?`,
      header: 'Confirmar préstamo',
      acceptLabel: 'Sí, pedir prestado',
      severity: 'warn',
    });
    if (!confirmed) {
      return;
    }
    this.loanService.create(book.id).subscribe({
      next: () => {
        this.ui.success(`"${book.title}" quedó registrado en tus préstamos.`);
        this.bookService.search(this.currentParams);
      },
      error: (error: HttpErrorResponse) => {
        this.ui.error(
          error.status === 409
            ? 'No se pudo completar el préstamo: el libro ya no está disponible o tu cuenta está bloqueada.'
            : 'No se pudo pedir el préstamo. Intenta de nuevo.',
        );
      },
    });
  }

  protected async onReserve(book: BookItem): Promise<void> {
    const confirmed = await this.ui.confirm({
      message: `¿Reservar "${book.title}"? Quedarás en la fila de espera y te avisaremos cuando esté disponible.`,
      header: 'Confirmar reserva',
      acceptLabel: 'Sí, reservar',
      severity: 'warn',
    });
    if (!confirmed) {
      return;
    }
    this.reservationService.create(book.id).subscribe({
      next: () => this.ui.success(`Quedaste en la fila de espera de "${book.title}". Te avisaremos cuando esté disponible.`),
      error: (error: HttpErrorResponse) => {
        this.ui.error(
          error.status === 409
            ? 'No se pudo reservar: el libro está disponible o ya tienes una reserva pendiente para él.'
            : 'No se pudo reservar el libro. Intenta de nuevo.',
        );
      },
    });
  }
}
