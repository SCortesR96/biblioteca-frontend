import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { Auth } from '../../../../core/services/auth';
import { Book } from '../../../../core/services/book';
import type { BookItem } from '../../../../core/services/book.types';
import { CatalogPage } from './catalog-page';

const book: BookItem = {
  id: 1, title: 'Matilda', author: 'Roald Dahl', isbn: '9780140328721', publicationYear: 1988,
  status: 'DISPONIBLE', coverUrl: null, subjects: null, createdAt: '2026-01-01T00:00:00Z',
};

describe('CatalogPage', () => {
  let fixture: ComponentFixture<CatalogPage>;
  let component: CatalogPage;
  let bookStub: {
    books: ReturnType<typeof signal>; loading: ReturnType<typeof signal>; error: ReturnType<typeof signal>;
    search: ReturnType<typeof vi.fn>; delete: ReturnType<typeof vi.fn>;
  };
  let authStub: { isAdmin: ReturnType<typeof signal>; currentUser: ReturnType<typeof signal> };

  beforeEach(async () => {
    bookStub = {
      books: signal<BookItem[]>([]), loading: signal(false), error: signal<string | null>(null),
      search: vi.fn(), delete: vi.fn(),
    };
    authStub = { isAdmin: signal(true), currentUser: signal({ name: 'Ana', email: 'a@a.com', role: 'ADMIN' }) };

    await TestBed.configureTestingModule({
      imports: [CatalogPage],
      providers: [provideRouter([]), { provide: Book, useValue: bookStub }, { provide: Auth, useValue: authStub }],
    }).compileComponents();

    fixture = TestBed.createComponent(CatalogPage);
    component = fixture.componentInstance;
  });

  it('searches the full catalog on init', () => {
    fixture.detectChanges();
    expect(bookStub.search).toHaveBeenCalledWith();
  });

  it('onSearch() re-fetches with the given params', () => {
    fixture.detectChanges();
    component['onSearch']({ title: 'Matilda' });
    expect(bookStub.search).toHaveBeenLastCalledWith({ title: 'Matilda' });
  });

  it('onDelete() does nothing when the user cancels the confirm dialog', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    fixture.detectChanges();

    component['onDelete'](book);

    expect(bookStub.delete).not.toHaveBeenCalled();
  });

  it('onDelete() deletes and refreshes the catalog when confirmed', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    bookStub.delete.mockReturnValue(of(undefined));
    fixture.detectChanges();

    component['onDelete'](book);

    expect(bookStub.delete).toHaveBeenCalledWith(1);
    expect(bookStub.search).toHaveBeenCalledTimes(2); // init + post-delete refresh
  });

  it('shows the "Registrar libro" action only for admins', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Registrar libro');
  });

  it('hides the "Registrar libro" action for non-admins', () => {
    authStub.isAdmin.set(false);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain('Registrar libro');
  });
});
