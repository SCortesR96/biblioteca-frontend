import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { LoanItem } from '../../../../core/services/loan.types';
import { LoansTable } from './loans-table';

const loans: LoanItem[] = [
  {
    id: 1, bookId: 1, bookTitle: 'Matilda', bookIsbn: '9780140328721', borrowerName: 'Ana',
    borrowerEmail: 'ana@biblioteca.com', loanDate: '2026-01-01', dueDate: '2026-01-15',
    returnDate: null, overdue: false,
  },
  {
    id: 2, bookId: 2, bookTitle: 'El Hobbit', bookIsbn: '9780261102217', borrowerName: 'Ana',
    borrowerEmail: 'ana@biblioteca.com', loanDate: '2025-12-01', dueDate: '2025-12-15',
    returnDate: '2025-12-20', overdue: false,
  },
];

describe('LoansTable', () => {
  let fixture: ComponentFixture<LoansTable>;
  let component: LoansTable;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [LoansTable] }).compileComponents();
    fixture = TestBed.createComponent(LoansTable);
    fixture.componentRef.setInput('loans', loans);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('renders one row per loan', () => {
    expect(fixture.nativeElement.textContent).toContain('Matilda');
    expect(fixture.nativeElement.textContent).toContain('El Hobbit');
  });

  it('shows a "Devolver" button only for loans without returnDate', () => {
    expect(fixture.nativeElement.querySelectorAll('app-button').length).toBe(1);
  });

  it('emits returnLoan with the right loan when clicked', () => {
    const emitted: LoanItem[] = [];
    component.returnLoan.subscribe((loan) => emitted.push(loan));

    fixture.nativeElement.querySelector('app-button').dispatchEvent(new Event('click'));

    expect(emitted).toEqual([loans[0]]);
  });
});
