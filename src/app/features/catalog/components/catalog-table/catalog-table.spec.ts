import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { BookItem } from '../../../../core/services/book.types';
import { CatalogTable } from './catalog-table';

const books: BookItem[] = [
  {
    id: 1, title: 'Matilda', author: 'Roald Dahl', isbn: '9780140328721',
    publicationYear: 1988, status: 'DISPONIBLE', coverUrl: null, subjects: null, createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 2, title: 'El Hobbit', author: 'J.R.R. Tolkien', isbn: '9780261102217',
    publicationYear: 1937, status: 'PRESTADO', coverUrl: null, subjects: null, createdAt: '2026-01-01T00:00:00Z',
  },
];

describe('CatalogTable', () => {
  let fixture: ComponentFixture<CatalogTable>;
  let component: CatalogTable;

  async function render(canManage: boolean) {
    fixture = TestBed.createComponent(CatalogTable);
    fixture.componentRef.setInput('books', books);
    fixture.componentRef.setInput('canManage', canManage);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CatalogTable] }).compileComponents();
  });

  it('renders one row per book', async () => {
    await render(false);
    expect(fixture.nativeElement.textContent).toContain('Matilda');
    expect(fixture.nativeElement.textContent).toContain('El Hobbit');
  });

  it('does not show delete buttons when canManage is false', async () => {
    await render(false);
    expect(fixture.nativeElement.querySelectorAll('app-button').length).toBe(0);
  });

  it('shows a delete button only for the DISPONIBLE book when canManage is true', async () => {
    await render(true);
    expect(fixture.nativeElement.querySelectorAll('app-button').length).toBe(1);
  });

  it('emits deleteBook with the right book when clicked', async () => {
    await render(true);
    const emitted: BookItem[] = [];
    component.deleteBook.subscribe((book) => emitted.push(book));

    fixture.nativeElement.querySelector('app-button').dispatchEvent(new Event('click'));

    expect(emitted).toEqual([books[0]]);
  });
});
