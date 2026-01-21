import { Injectable, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly snackBar = inject(MatSnackBar);

  private readonly defaultConfig: MatSnackBarConfig = {
    duration: 5000,
    horizontalPosition: 'end',
    verticalPosition: 'top',
  };

  show(message: string, type: NotificationType = 'info', duration?: number): void {
    const config: MatSnackBarConfig = {
      ...this.defaultConfig,
      duration: duration ?? this.defaultConfig.duration,
      panelClass: this.getPanelClass(type),
    };

    this.snackBar.open(message, 'Close', config);
  }

  showSuccess(message: string, duration?: number): void {
    this.show(message, 'success', duration);
  }

  showError(message: string, duration?: number): void {
    this.show(message, 'error', duration ?? 8000);
  }

  showWarning(message: string, duration?: number): void {
    this.show(message, 'warning', duration);
  }

  showInfo(message: string, duration?: number): void {
    this.show(message, 'info', duration);
  }

  dismiss(): void {
    this.snackBar.dismiss();
  }

  private getPanelClass(type: NotificationType): string[] {
    const baseClass = 'snackbar-notification';
    switch (type) {
      case 'success':
        return [baseClass, 'snackbar-success'];
      case 'error':
        return [baseClass, 'snackbar-error'];
      case 'warning':
        return [baseClass, 'snackbar-warning'];
      case 'info':
      default:
        return [baseClass, 'snackbar-info'];
    }
  }
}
