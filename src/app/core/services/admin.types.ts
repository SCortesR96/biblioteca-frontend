import type { UserRole } from './auth.types';

export type AdminStats = {
  prestamosActivos: number;
  prestamosVencidos: number;
  reservasActivas: number;
  cuentasBloqueadas: number;
};

/**
 * Cuenta tal como la ve el panel de gestión de usuarios. `blockedUntil` es el dato crudo
 * (para mostrar "bloqueada hasta ...") y `blocked` ya viene resuelto por el backend contra
 * "ahora" — el front no reimplementa la regla "un bloqueo con fecha pasada ya no cuenta".
 */
export type ManagedUser = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  blockedUntil: string | null;
  blocked: boolean;
  createdAt: string;
};

export type CreateUserPayload = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
};

export type UpdateUserPayload = {
  name: string;
  role: UserRole;
};

export type ActivityAction =
  | 'LOGIN'
  | 'LOAN_CREATED'
  | 'LOAN_RETURNED'
  | 'RESERVATION_CREATED'
  | 'RESERVATION_CANCELLED'
  | 'BOOK_CREATED'
  | 'BOOK_DELETED'
  | 'USER_CREATED'
  | 'USER_UPDATED'
  | 'USER_DELETED'
  | 'USER_BLOCKED'
  | 'USER_UNBLOCKED';

/**
 * Una acción exitosa registrada en la bitácora de actividad. `actorEmail` es `null` cuando
 * la originó el sistema (p. ej. una tarea programada).
 */
export type ActivityLogEntry = {
  id: number;
  actorEmail: string | null;
  action: ActivityAction;
  description: string;
  createdAt: string;
};

export type ActivityLogPage = {
  content: ActivityLogEntry[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

export type LogLevel = 'INFO' | 'WARN' | 'ERROR';

export type ErrorLogEntry = {
  id: number;
  level: LogLevel;
  message: string;
  exceptionType: string | null;
  path: string | null;
  httpMethod: string | null;
  createdAt: string;
};

export type ErrorLogPage = {
  content: ErrorLogEntry[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};
