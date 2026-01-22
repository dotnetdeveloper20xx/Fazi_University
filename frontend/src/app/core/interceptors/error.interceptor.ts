import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);
  // Check if this request should suppress error notifications
  const suppressErrors = req.headers.get('X-Suppress-Error-Notification') === 'true';

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unexpected error occurred';

      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = error.error.message;
      } else {
        // Server-side error
        switch (error.status) {
          case 0:
            errorMessage = 'Unable to connect to server. Please check your network connection.';
            break;
          case 400:
            errorMessage = extractErrorMessage(error) || 'Invalid request. Please check your input.';
            break;
          case 401:
            // Handled by auth interceptor
            return throwError(() => error);
          case 403:
            errorMessage = 'You do not have permission to perform this action.';
            break;
          case 404:
            errorMessage = 'The requested resource was not found.';
            break;
          case 409:
            errorMessage = extractErrorMessage(error) || 'A conflict occurred. The resource may already exist.';
            break;
          case 422:
            errorMessage = extractErrorMessage(error) || 'Validation failed. Please check your input.';
            break;
          case 429:
            errorMessage = 'Too many requests. Please try again later.';
            break;
          case 500:
            errorMessage = 'A server error occurred. Please try again later.';
            break;
          case 502:
          case 503:
          case 504:
            errorMessage = 'The service is temporarily unavailable. Please try again later.';
            break;
          default:
            errorMessage = extractErrorMessage(error) || `Error: ${error.status} - ${error.statusText}`;
        }
      }

      // Don't show notification for 401 errors (handled by auth) or if suppressed
      if (error.status !== 401 && !suppressErrors) {
        notificationService.showError(errorMessage);
      }

      return throwError(() => ({
        status: error.status,
        message: errorMessage,
        errors: extractValidationErrors(error),
        originalError: error
      }));
    })
  );
};

function extractErrorMessage(error: HttpErrorResponse): string | null {
  if (error.error) {
    if (typeof error.error === 'string') {
      return error.error;
    }
    if (error.error.message) {
      return error.error.message;
    }
    if (error.error.errors && Array.isArray(error.error.errors)) {
      return error.error.errors.join('. ');
    }
    if (error.error.title) {
      return error.error.title;
    }
  }
  return null;
}

function extractValidationErrors(error: HttpErrorResponse): Record<string, string[]> | null {
  if (error.error?.errors && typeof error.error.errors === 'object') {
    return error.error.errors;
  }
  return null;
}
