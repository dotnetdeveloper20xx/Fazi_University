import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/auth/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        Forgot Password
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        Enter your email and we'll send you a reset link
      </p>
    </div>

    @if (emailSent()) {
      <div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
        <div class="flex items-center gap-3">
          <mat-icon class="text-green-600 dark:text-green-400">check_circle</mat-icon>
          <p class="text-green-800 dark:text-green-200">
            If an account exists with this email, you'll receive a password reset link shortly.
          </p>
        </div>
      </div>
    }

    <form [formGroup]="forgotPasswordForm" (ngSubmit)="onSubmit()" class="space-y-6">
      <mat-form-field appearance="outline" class="w-full">
        <mat-label>Email</mat-label>
        <input matInput type="email" formControlName="email" placeholder="Enter your email">
        <mat-icon matPrefix>email</mat-icon>
        @if (forgotPasswordForm.get('email')?.hasError('required') && forgotPasswordForm.get('email')?.touched) {
          <mat-error>Email is required</mat-error>
        }
        @if (forgotPasswordForm.get('email')?.hasError('email') && forgotPasswordForm.get('email')?.touched) {
          <mat-error>Please enter a valid email</mat-error>
        }
      </mat-form-field>

      <button
        mat-flat-button
        color="primary"
        type="submit"
        class="w-full h-12"
        [disabled]="isLoading()"
      >
        @if (isLoading()) {
          <mat-spinner diameter="24" class="inline-block"></mat-spinner>
        } @else {
          Send Reset Link
        }
      </button>
    </form>

    <p class="mt-8 text-center">
      <a
        routerLink="/auth/login"
        class="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium flex items-center justify-center gap-2"
      >
        <mat-icon>arrow_back</mat-icon>
        Back to Login
      </a>
    </p>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);

  forgotPasswordForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  isLoading = signal(false);
  emailSent = signal(false);

  onSubmit(): void {
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    this.authService.forgotPassword(this.forgotPasswordForm.value).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.emailSent.set(true);
      },
      error: () => {
        this.isLoading.set(false);
        // Still show success to prevent email enumeration
        this.emailSent.set(true);
      }
    });
  }
}
