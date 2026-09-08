export type UserRole = 'ADMIN' | 'BIBLIOTECARIO';

export type AuthResponse = {
  token: string;
  name: string;
  email: string;
  role: UserRole;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

export type CurrentUser = {
  name: string;
  email: string;
  role: UserRole;
};
