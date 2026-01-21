import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  template: `
    <div class="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
      <mat-card class="max-w-md w-full p-8 text-center">
        <div class="mb-6">
          <div class="w-20 h-20 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <mat-icon class="text-5xl text-red-600 dark:text-red-400">lock</mat-icon>
          </div>
        </div>

        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Access Denied
        </h1>

        <p class="text-gray-600 dark:text-gray-400 mb-6">
          You don't have permission to access this page. Please contact your administrator if you believe this is an error.
        </p>

        <div class="space-y-3">
          <button
            mat-flat-button
            color="primary"
            class="w-full"
            (click)="goToDashboard()"
          >
            <mat-icon class="mr-2">home</mat-icon>
            Go to Dashboard
          </button>

          <button
            mat-stroked-button
            class="w-full"
            (click)="goBack()"
          >
            <mat-icon class="mr-2">arrow_back</mat-icon>
            Go Back
          </button>

          @if (isAuthenticated()) {
            <button
              mat-button
              color="warn"
              class="w-full"
              (click)="logout()"
            >
              <mat-icon class="mr-2">logout</mat-icon>
              Sign Out
            </button>
          }
        </div>

        <p class="mt-6 text-sm text-gray-500">
          Error Code: 403 Forbidden
        </p>
      </mat-card>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class UnauthorizedComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  isAuthenticated = this.authService.isAuthenticated;

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  goBack(): void {
    window.history.back();
  }

  logout(): void {
    this.authService.logout();
  }
}
