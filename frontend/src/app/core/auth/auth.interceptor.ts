import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { TokenService } from './token.service';
import { AuthService } from './auth.service';

let isRefreshing = false;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const authService = inject(AuthService);

  // Skip auth header for auth endpoints
  if (req.url.includes('/auth/login') ||
      req.url.includes('/auth/register') ||
      req.url.includes('/auth/forgot-password') ||
      req.url.includes('/auth/reset-password')) {
    return next(req);
  }

  const token = tokenService.getToken();

  if (token) {
    req = addTokenHeader(req, token);
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/auth/refresh-token')) {
        return handleUnauthorized(req, next, authService, tokenService);
      }
      return throwError(() => error);
    })
  );
};

function addTokenHeader(request: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
}

function handleUnauthorized(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService,
  tokenService: TokenService
) {
  if (!isRefreshing) {
    isRefreshing = true;

    const refreshToken = tokenService.getRefreshToken();

    if (refreshToken) {
      return authService.refreshToken().pipe(
        switchMap(response => {
          isRefreshing = false;
          return next(addTokenHeader(request, response.data.accessToken));
        }),
        catchError(error => {
          isRefreshing = false;
          authService.logout();
          return throwError(() => error);
        })
      );
    } else {
      isRefreshing = false;
      authService.logout();
    }
  }

  return throwError(() => new Error('Session expired'));
}
