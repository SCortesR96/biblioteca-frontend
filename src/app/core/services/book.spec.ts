import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { Book } from './book';
import type { BookItem, BookPage } from './book.types';

const sampleBook: BookItem = {
  id: 1,
  title: 'Matilda',
  author: 'Roald Dahl',
  isbn: '9780140328721',
  publicationYear: 1988,
  status: 'DISPONIBLE',
  coverUrl: null,
  subjects: null,
  createdAt: '2026-01-01T00:00:00Z',
};

const samplePage: BookPage = { content: [sampleBook], totalElements: 1, totalPages: 1, number: 0, size: 20 };

describe('Book (service)', () => {
  let service: Book;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(Book);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('search() populates books/pagination signals on success', () => {
    service.search({ title: 'Matilda', page: 0, size: 20 });

    const req = httpMock.expectOne(
        (r) => r.url === `${environment.apiUrl}/books` && r.params.get('title') === 'Matilda');
    expect(req.request.method).toBe('GET');
    req.flush(samplePage);

    expect(service.books()).toEqual([sampleBook]);
    expect(service.totalElements()).toBe(1);
    expect(service.loading()).toBe(false);
    expect(service.error()).toBeNull();
  });

  it('search() sets an error message and clears loading on failure', () => {
    service.search();

    httpMock.expectOne(`${environment.apiUrl}/books?page=0&size=20`).flush(
        'error', { status: 500, statusText: 'Server Error' });

    expect(service.error()).toContain('No se pudo cargar');
    expect(service.loading()).toBe(false);
  });

  it('lookupByIsbn() hits the preview endpoint', () => {
    service.lookupByIsbn('9780140328721').subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/books/lookup/9780140328721`);
    expect(req.request.method).toBe('GET');
    req.flush({ title: 'Matilda', author: 'Roald Dahl', publicationYear: 1988, coverUrl: null, subjects: null });
  });

  it('create() posts to /books', () => {
    service.create({
      title: 'Matilda', author: 'Roald Dahl', isbn: '9780140328721',
      publicationYear: 1988, coverUrl: null, subjects: null,
    }).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/books`);
    expect(req.request.method).toBe('POST');
    req.flush(sampleBook);
  });

  it('delete() sends DELETE to /books/{id}', () => {
    service.delete(1).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/books/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
