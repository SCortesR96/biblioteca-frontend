import type { BookStatus } from '../../../../core/services/book.types';

export const STATUS_LABELS: Record<BookStatus, string> = {
  DISPONIBLE: 'Disponible',
  PRESTADO: 'Prestado',
  RESERVADO: 'Reservado',
};

export const STATUS_SEVERITIES: Record<BookStatus, 'success' | 'warn' | 'info'> = {
  DISPONIBLE: 'success',
  PRESTADO: 'warn',
  RESERVADO: 'info',
};
