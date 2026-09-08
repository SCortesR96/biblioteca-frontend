import { HttpErrorResponse } from '@angular/common/http';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Auth } from '../../../../core/services/auth';
import { Book } from '../../../../core/services/book';
import type { BookItem } from '../../../../core/services/book.types';
import { Loan } from '../../../../core/services/loan';
import { Reservation } from '../../../../core/services/reservation';
import { UiFeedback } from '../../../../core/services/ui-feedback';
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
  let loanStub: { create: ReturnType<typeof vi.fn> };
  let reservationStub: { create: ReturnType<typeof vi.fn> };
  let uiStub: { confirm: ReturnType<typeof vi.fn>; success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    bookStub = {
      books: signal<BookItem[]>([]), loading: signal(false), error: signal<string | null>(null),
      search: vi.fn(), delete: vi.fn(),
    };
    authStub = { isAdmin: signal(true), currentUser: signal({ name: 'Ana', email: 'a@a.com', role: 'ADMIN' }) };
    loanStub = { create: vi.fn() };
    reservationStub = { create: vi.fn() };
    uiStub = { confirm: vi.fn().mockResolvedValue(true), success: vi.fn(), error: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [CatalogPage],
      providers: [
        provideRouter([]),
        { provide: Book, useValue: bookStub },
        { provide: Auth, useValue: authStub },
        { provide: Loan, useValue: loanStub },
        { provide: Reservation, useValue: reservationStub },
        { provide: UiFeedback, useValue: uiStub },
      ],
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

  it('onDelete() does nothing when the user cancels the confirmation dialog', async () => {
    uiStub.confirm.mockResolvedValue(false);
    fixture.detectChanges();

    await component['onDelete'](book);

    expect(bookStub.delete).not.toHaveBeenCalled();
  });

  it('onDelete() asks for confirmation, deletes and refreshes the catalog when confirmed', async () => {
    bookStub.delete.mockReturnValue(of(undefined));
    fixture.detectChanges();

    await component['onDelete'](book);

    expect(uiStub.confirm).toHaveBeenCalledWith(expect.objectContaining({ severity: 'danger' }));
    expect(bookStub.delete).toHaveBeenCalledWith(1);
    expect(uiStub.success).toHaveBeenCalled();
    expect(bookStub.search).toHaveBeenCalledTimes(2); // init + post-delete refresh
  });

  it('onDelete() shows an error toast when the deletion fails', async () => {
    bookStub.delete.mockReturnValue(throwError(() => new Error('fail')));
    fixture.detectChanges();

    await component['onDelete'](book);

    expect(uiStub.error).toHaveBeenCalled();
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

  it('onBorrow() creates the loan, notifies the user and refreshes the catalog', () => {
    loanStub.create.mockReturnValue(of({ id: 1 }));
    fixture.detectChanges();

    component['onBorrow'](book);

    expect(loanStub.create).toHaveBeenCalledWith(1);
    expect(uiStub.success).toHaveBeenCalled();
    expect(bookStub.search).toHaveBeenCalledTimes(2); // init + post-borrow refresh
  });

  it('onBorrow() shows a specific message on 409 (no disponible / cuenta bloqueada)', () => {
    loanStub.create.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 409 })));
    fixture.detectChanges();

    component['onBorrow'](book);

    expect(uiStub.error).toHaveBeenCalledWith(expect.stringContaining('no está disponible'));
  });

  it('onReserve() creates the reservation and notifies the user', () => {
    reservationStub.create.mockReturnValue(of({ id: 1 }));
    fixture.detectChanges();

    component['onReserve'](book);

    expect(reservationStub.create).toHaveBeenCalledWith(1);
    expect(uiStub.success).toHaveBeenCalledWith(expect.stringContaining('fila de espera'));
  });

  it('onReserve() shows a specific message on 409', () => {
    reservationStub.create.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 409 })));
    fixture.detectChanges();

    component['onReserve'](book);

    expect(uiStub.error).toHaveBeenCalledWith(expect.stringContaining('ya tienes una reserva pendiente'));
  });
});
