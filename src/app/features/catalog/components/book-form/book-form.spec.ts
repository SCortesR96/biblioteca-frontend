import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { Book } from '../../../../core/services/book';
import type { BookItem, BookLookup } from '../../../../core/services/book.types';
import { BookForm } from './book-form';

describe('BookForm', () => {
  let fixture: ComponentFixture<BookForm>;
  let component: BookForm;
  let bookStub: { lookupByIsbn: ReturnType<typeof vi.fn>; create: ReturnType<typeof vi.fn> };

  const lookupResult: BookLookup = {
    title: 'Matilda', author: 'Roald Dahl', publicationYear: 1988, coverUrl: 'https://cover', subjects: 'Fiction',
  };
  const createdBook: BookItem = {
    id: 1, title: 'Matilda', author: 'Roald Dahl', isbn: '9780140328721', publicationYear: 1988,
    status: 'DISPONIBLE', coverUrl: null, subjects: null, createdAt: '2026-01-01T00:00:00Z',
  };

  beforeEach(async () => {
    bookStub = { lookupByIsbn: vi.fn(), create: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [BookForm],
      providers: [{ provide: Book, useValue: bookStub }],
    }).compileComponents();

    fixture = TestBed.createComponent(BookForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('autocomplete() fills title/author/year/cover/subjects from the lookup', async () => {
    bookStub.lookupByIsbn.mockReturnValue(of(lookupResult));
    component['form'].controls.isbn.setValue('9780140328721');

    component['autocomplete']();
    await fixture.whenStable();

    expect(bookStub.lookupByIsbn).toHaveBeenCalledWith('9780140328721');
    expect(component['form'].controls.title.value).toBe('Matilda');
    expect(component['form'].controls.author.value).toBe('Roald Dahl');
    expect(component['form'].controls.publicationYear.value).toBe('1988');
    expect(component['form'].controls.coverUrl.value).toBe('https://cover');
  });

  it('autocomplete() shows a friendly message and does not touch the form on 502', async () => {
    bookStub.lookupByIsbn.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 502 })));
    component['form'].controls.isbn.setValue('0000000000');

    component['autocomplete']();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component['form'].controls.title.value).toBe('');
    expect(fixture.nativeElement.textContent).toContain('No se encontró información');
  });

  it('submit() sends publicationYear as a number, not a string', () => {
    bookStub.create.mockReturnValue(of(createdBook));
    component['form'].setValue({
      isbn: '9780140328721', title: 'Matilda', author: 'Roald Dahl',
      publicationYear: '1988', coverUrl: null, subjects: null,
    });

    component['submit']();

    const payload = bookStub.create.mock.calls[0][0];
    expect(payload.publicationYear).toBe(1988);
    expect(typeof payload.publicationYear).toBe('number');
  });

  it('submit() emits created and resets the form on success', () => {
    bookStub.create.mockReturnValue(of(createdBook));
    const createdSpy = vi.fn();
    component.created.subscribe(createdSpy);
    component['form'].setValue({
      isbn: '9780140328721', title: 'Matilda', author: 'Roald Dahl',
      publicationYear: '', coverUrl: null, subjects: null,
    });

    component['submit']();

    expect(createdSpy).toHaveBeenCalled();
    expect(component['form'].controls.isbn.value).toBe('');
  });

  it('submit() shows a specific message on duplicate ISBN (409)', () => {
    bookStub.create.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 409 })));
    component['form'].setValue({
      isbn: '9780140328721', title: 'Matilda', author: 'Roald Dahl',
      publicationYear: '', coverUrl: null, subjects: null,
    });

    component['submit']();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Ya existe un libro con ese ISBN');
  });

  it('submit() does nothing when required fields are missing', () => {
    component['submit']();
    expect(bookStub.create).not.toHaveBeenCalled();
  });
});
