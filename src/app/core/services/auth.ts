import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { AuthResponse, CurrentUser, LoginPayload, RegisterPayload } from './auth.types';

const STORAGE_KEY = 'biblioteca.auth';

type Session = { token: string; user: CurrentUser };

/**
 * Sesión del usuario actual, en memoria (signals) y persistida en localStorage para
 * sobrevivir un refresh de página. El interceptor HTTP lee {@link Auth#token} en cada
 * request; los guards de ruta leen {@link Auth#isAuthenticated}.
 */
@Injectable({
  providedIn: 'root',
})
export class Auth {
  private readonly http = inject(HttpClient);

  private readonly session = signal<Session | null>(this.readSession());

  readonly currentUser = computed<CurrentUser | null>(() => this.session()?.user ?? null);
  readonly isAuthenticated = computed(() => this.session() !== null);
  readonly isAdmin = computed(() => this.session()?.user.role === 'ADMIN');

  get token(): string | null {
    return this.session()?.token ?? null;
  }

  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/login`, payload)
      .pipe(tap((response) => this.storeSession(response)));
  }

  register(payload: RegisterPayload): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/register`, payload)
      .pipe(tap((response) => this.storeSession(response)));
  }

  logout(): void {
    this.session.set(null);
    this.writeToStorage(null);
  }

  private storeSession(response: AuthResponse): void {
    const session: Session = {
      token: response.token,
      user: { name: response.name, email: response.email, role: response.role },
    };
    this.session.set(session);
    this.writeToStorage(session);
  }

  private readSession(): Session | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Session) : null;
    } catch {
      // localStorage puede no estar disponible (modo privado, storage bloqueado): la app
      // sigue funcionando, simplemente sin sesión recordada entre refrescos.
      return null;
    }
  }

  private writeToStorage(session: Session | null): void {
    try {
      if (session) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // idem readSession
    }
  }
}
