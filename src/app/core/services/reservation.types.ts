// "ReservationItem" (no "Reservation"): el servicio generado para este archivo ya se
// llama `Reservation` (ver reservation.ts) — mismo motivo que "BookItem" en book.types.ts.
export type ReservationStatus = 'PENDIENTE' | 'NOTIFICADO' | 'CANCELADO' | 'CUMPLIDO';

export type ReservationItem = {
  id: number;
  bookId: number;
  bookTitle: string;
  bookIsbn: string;
  requesterEmail: string;
  requestDate: string;
  status: ReservationStatus;
};
