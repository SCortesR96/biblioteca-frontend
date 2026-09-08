import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { BookItem, BookLookup, BookPage, BookRequest, BookSearchParams } from './book.types';

/**
 * El listado del catálogo vive como estado del servicio (signals): varios componentes
 * (tabla, buscador, formulario de alta) necesitan leer/reaccionar al mismo catálogo sin
 * pasarse props entre sí. Las acciones puntuales (crear, eliminar, autocompletar) devuelven
 * Observables en vez de mutar el estado ellas mismas — quien llama decide cuándo refrescar
 * la lista y cómo mostrar su propio error/éxito.
 */
@Injectable({
  providedIn: 'root',
})
export class Book {
  private readonly http = inject(HttpClient);

  readonly books = signal<BookItem[]>([]);
  readonly totalElements = signal(0);
  readonly totalPages = signal(0);
  readonly currentPage = signal(0);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  search(params: BookSearchParams = {}): void {
    this.loading.set(true);
    this.error.set(null);

    let httpParams = new HttpParams()
        .set('page', String(params.page ?? 0))
        .set('size', String(params.size ?? 20));
    if (params.title) httpParams = httpParams.set('title', params.title);
    if (params.author) httpParams = httpParams.set('author', params.author);
    if (params.status) httpParams = httpParams.set('status', params.status);

    this.http.get<BookPage>(`${environment.apiUrl}/books`, { params: httpParams }).subscribe({
      next: (page) => {
        this.books.set(page.content);
        this.totalElements.set(page.totalElements);
        this.totalPages.set(page.totalPages);
        this.currentPage.set(page.number);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el catálogo. Intenta de nuevo.');
        this.loading.set(false);
      },
    });
  }

  lookupByIsbn(isbn: string): Observable<BookLookup> {
    return this.http.get<BookLookup>(`${environment.apiUrl}/books/lookup/${isbn}`);
  }

  create(request: BookRequest): Observable<BookItem> {
    return this.http.post<BookItem>(`${environment.apiUrl}/books`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/books/${id}`);
  }
}
