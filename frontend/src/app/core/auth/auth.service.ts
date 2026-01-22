import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TokenService } from './token.service';
import {
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  AuthData,
  RefreshTokenRequest,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  UserRole
} from '../../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly tokenService = inject(TokenService);
  private readonly baseUrl = `${environment.apiUrl}/auth`;
  private readonly userKey = environment.userKey;

  // Signals for reactive state
  private readonly _currentUser = signal<User | null>(this.loadUserFromStorage());
  private readonly _isLoading = signal(false);

  // Public computed signals
  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => !!this._currentUser() && !this.tokenService.isTokenExpired());
  readonly isLoading = this._isLoading.asReadonly();
  readonly userRoles = computed(() => this._currentUser()?.roles ?? []);
  readonly isAdmin = computed(() => this.hasRole('Administrator'));
  readonly isFaculty = computed(() => this.hasRole('Faculty'));
  readonly isStudent = computed(() => this.hasRole('Student'));
  readonly isRegistrar = computed(() => this.hasRole('Registrar'));
  readonly isBillingStaff = computed(() => this.hasRole('BillingStaff'));

  login(credentials: LoginRequest): Observable<AuthResponse> {
    this._isLoading.set(true);
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, credentials).pipe(
      tap(response => this.handleAuthSuccess(response)),
      catchError(error => {
        this._isLoading.set(false);
        return throwError(() => error);
      })
    );
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    this._isLoading.set(true);
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, request).pipe(
      tap(response => this.handleAuthSuccess(response)),
      catchError(error => {
        this._isLoading.set(false);
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    this.tokenService.clearTokens();
    localStorage.removeItem(this.userKey);
    this._currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  refreshToken(): Observable<AuthResponse> {
    const token = this.tokenService.getToken();
    const refreshToken = this.tokenService.getRefreshToken();

    if (!token || !refreshToken) {
      return throwError(() => new Error('No tokens available'));
    }

    const request: RefreshTokenRequest = { token, refreshToken };

    return this.http.post<AuthResponse>(`${this.baseUrl}/refresh-token`, request).pipe(
      tap(response => this.handleAuthSuccess(response)),
      catchError(error => {
        this.logout();
        return throwError(() => error);
      })
    );
  }

  changePassword(request: ChangePasswordRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/change-password`, request);
  }

  forgotPassword(request: ForgotPasswordRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/forgot-password`, request);
  }

  resetPassword(request: ResetPasswordRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/reset-password`, request);
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/me`).pipe(
      tap(user => {
        this._currentUser.set(user);
        this.saveUserToStorage(user);
      })
    );
  }

  hasRole(role: UserRole): boolean {
    return this._currentUser()?.roles.includes(role) ?? false;
  }

  hasAnyRole(roles: UserRole[]): boolean {
    const userRoles = this._currentUser()?.roles ?? [];
    return roles.some(role => userRoles.includes(role));
  }

  hasPermission(permission: string): boolean {
    return this._currentUser()?.permissions.includes(permission) ?? false;
  }

  private handleAuthSuccess(response: AuthResponse): void {
    if (!response.success || !response.data) {
      throw new Error(response.errors?.join(', ') || 'Authentication failed');
    }

    const authData = response.data;
    this.tokenService.setToken(authData.accessToken);
    this.tokenService.setRefreshToken(authData.refreshToken);

    // Extract name from userName (email)
    // e.g., admin@universyslite.edu -> Admin
    // e.g., john.doe@universyslite.edu -> John Doe
    const emailPrefix = authData.userName.split('@')[0];
    const nameParts = emailPrefix.split('.').map(part =>
      part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
    );
    const firstName = nameParts[0] || 'User';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

    // Map AuthData to User
    const user: User = {
      id: authData.userId,
      email: authData.email,
      firstName,
      lastName,
      fullName: nameParts.join(' ') || authData.userName,
      roles: authData.roles as UserRole[],
      permissions: authData.permissions,
      isActive: true
    };

    this._currentUser.set(user);
    this.saveUserToStorage(user);
    this._isLoading.set(false);
  }

  private saveUserToStorage(user: User): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  private loadUserFromStorage(): User | null {
    const userJson = localStorage.getItem(environment.userKey);
    if (!userJson) return null;

    try {
      return JSON.parse(userJson) as User;
    } catch {
      return null;
    }
  }
}
