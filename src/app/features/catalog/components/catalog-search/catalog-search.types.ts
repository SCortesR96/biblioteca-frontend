import type { BookStatus } from '../../../../core/services/book.types';

export type StatusOption = { label: string; value: BookStatus | null };

export const STATUS_OPTIONS: StatusOption[] = [
  { label: 'Todos los estados', value: null },
  { label: 'Disponible', value: 'DISPONIBLE' },
  { label: 'Prestado', value: 'PRESTADO' },
  { label: 'Reservado', value: 'RESERVADO' },
];
