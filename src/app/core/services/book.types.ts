// "BookItem" (no "Book"): el servicio generado por Angular CLI para este archivo ya se
// llama `Book` (ver book.ts) — nombrar el tipo igual chocaría con esa clase en cualquier
// archivo que importe ambos.
export type BookStatus = 'DISPONIBLE' | 'PRESTADO' | 'RESERVADO';

export type BookItem = {
  id: number;
  title: string;
  author: string;
  isbn: string;
  publicationYear: number | null;
  status: BookStatus;
  coverUrl: string | null;
  subjects: string | null;
  createdAt: string;
};

export type BookLookup = {
  title: string | null;
  author: string | null;
  publicationYear: number | null;
  coverUrl: string | null;
  subjects: string | null;
};

export type BookRequest = {
  title: string;
  author: string;
  isbn: string;
  publicationYear: number | null;
  coverUrl: string | null;
  subjects: string | null;
};

export type BookSearchParams = {
  title?: string;
  author?: string;
  status?: BookStatus | null;
  page?: number;
  size?: number;
};

export type BookPage = {
  content: BookItem[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};
