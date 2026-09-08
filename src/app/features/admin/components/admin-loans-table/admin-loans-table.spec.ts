import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { LoanItem } from '../../../../core/services/loan.types';
import { AdminLoansTable } from './admin-loans-table';

const activeLoan: LoanItem = {
  id: 1,
  bookId: 10,
  bookTitle: 'El Hobbit',
  bookIsbn: '111',
  borrowerName: 'Ana Pérez',
  borrowerEmail: 'ana@biblioteca.com',
  loanDate: '2026-06-01',
  dueDate: '2026-06-15',
  returnDate: null,
  overdue: true,
  reminderSent: false,
};
const returnedLoan: LoanItem = {
  ...activeLoan,
  id: 2,
  bookTitle: 'Matilda',
  bookIsbn: '222',
  borrowerName: 'Beto',
  borrowerEmail: 'beto@biblioteca.com',
  returnDate: '2026-06-10',
  overdue: false,
};

describe('AdminLoansTable', () => {
  let fixture: ComponentFixture<AdminLoansTable>;
  let component: AdminLoansTable;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AdminLoansTable] }).compileComponents();
    fixture = TestBed.createComponent(AdminLoansTable);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('loans', [activeLoan, returnedLoan]);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('shows the borrower name and email for each loan', () => {
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Ana Pérez');
    expect(text).toContain('ana@biblioteca.com');
    expect(text).toContain('beto@biblioteca.com');
  });

  function returnButtons(): HTMLElement[] {
    return (Array.from(fixture.nativeElement.querySelectorAll('app-button')) as HTMLElement[]).filter(
      (b) => (b.textContent ?? '').trim() === 'Devolver',
    );
  }

  it('offers "Devolver" only for loans that are still out', () => {
    expect(returnButtons()).toHaveLength(1);
  });

  it('emits returnLoan with the loan when its button is clicked', () => {
    const emitted: LoanItem[] = [];
    component.returnLoan.subscribe((l) => emitted.push(l));

    returnButtons()[0].dispatchEvent(new Event('click'));

    expect(emitted).toEqual([activeLoan]);
  });

  it('shows an empty message when there are no loans', async () => {
    fixture.componentRef.setInput('loans', []);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('No hay préstamos');
  });
});
