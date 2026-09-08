import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Auth } from '../../../../core/services/auth';
import { Book } from '../../../../core/services/book';
import type { BookItem, BookSearchParams } from '../../../../core/services/book.types';
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
}
