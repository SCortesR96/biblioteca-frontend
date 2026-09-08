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
  {
    id: 3, title: 'Drácula', author: 'Bram Stoker', isbn: '9780141439846',
    publicationYear: 1897, status: 'RESERVADO', coverUrl: null, subjects: null, createdAt: '2026-01-01T00:00:00Z',
  },
];

function rowFor(fixture: ComponentFixture<CatalogTable>, title: string): HTMLElement {
  const rows = fixture.nativeElement.querySelectorAll('tbody tr');
  return Array.from(rows).find((row) => (row as HTMLElement).textContent?.includes(title)) as HTMLElement;
}

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
    expect(fixture.nativeElement.textContent).toContain('Drácula');
  });

  it('shows only "Pedir préstamo" for a DISPONIBLE book when canManage is false', async () => {
    await render(false);
    const buttons = rowFor(fixture, 'Matilda').querySelectorAll('app-button');
    expect(buttons.length).toBe(1);
    expect(buttons[0].textContent).toContain('Pedir préstamo');
  });

  it('shows both "Pedir préstamo" and "Eliminar" for a DISPONIBLE book when canManage is true', async () => {
    await render(true);
    expect(rowFor(fixture, 'Matilda').querySelectorAll('app-button').length).toBe(2);
  });

  it('shows "Reservar" (and nothing else) for a PRESTADO book, regardless of canManage', async () => {
    await render(true);
    const buttons = rowFor(fixture, 'El Hobbit').querySelectorAll('app-button');
    expect(buttons.length).toBe(1);
    expect(buttons[0].textContent).toContain('Reservar');
  });

  it('shows no actions for a RESERVADO book', async () => {
    await render(true);
    expect(rowFor(fixture, 'Drácula').querySelectorAll('app-button').length).toBe(0);
  });

  it('emits borrowBook with the right book when "Pedir préstamo" is clicked', async () => {
    await render(false);
    const emitted: BookItem[] = [];
    component.borrowBook.subscribe((book) => emitted.push(book));

    rowFor(fixture, 'Matilda').querySelector('app-button')!.dispatchEvent(new Event('click'));

    expect(emitted).toEqual([books[0]]);
  });

  it('emits reserveBook with the right book when "Reservar" is clicked', async () => {
    await render(false);
    const emitted: BookItem[] = [];
    component.reserveBook.subscribe((book) => emitted.push(book));

    rowFor(fixture, 'El Hobbit').querySelector('app-button')!.dispatchEvent(new Event('click'));

    expect(emitted).toEqual([books[1]]);
  });

  it('emits deleteBook with the right book when "Eliminar" is clicked', async () => {
    await render(true);
    const emitted: BookItem[] = [];
    component.deleteBook.subscribe((book) => emitted.push(book));

    const buttons = rowFor(fixture, 'Matilda').querySelectorAll('app-button');
    buttons[1].dispatchEvent(new Event('click')); // 0 = Pedir préstamo, 1 = Eliminar

    expect(emitted).toEqual([books[0]]);
  });
});
