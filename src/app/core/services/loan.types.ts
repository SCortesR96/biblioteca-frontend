export type LoanItem = {
  id: number;
  bookId: number;
  bookTitle: string;
  bookIsbn: string;
  borrowerName: string;
  borrowerEmail: string;
  loanDate: string;
  dueDate: string;
  returnDate: string | null;
  overdue: boolean;
};
