export type AdminStats = {
  prestamosActivos: number;
  prestamosVencidos: number;
  reservasActivas: number;
  cuentasBloqueadas: number;
};

export type BlockedUser = {
  id: number;
  name: string;
  email: string;
  blockedUntil: string;
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
