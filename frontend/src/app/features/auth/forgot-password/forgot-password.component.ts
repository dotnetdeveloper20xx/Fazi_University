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
    <div class="forgot-card">
      <div class="card-header">
        <div class="header-icon">
          <mat-icon>lock_reset</mat-icon>
        </div>
        <h1 class="card-title">Forgot Password</h1>
        <p class="card-subtitle">Enter your email and we'll send you a reset link</p>
      </div>

      @if (emailSent()) {
        <div class="success-message">
          <mat-icon>check_circle</mat-icon>
          <p>If an account exists with this email, you'll receive a password reset link shortly.</p>
        </div>
      }

      <form [formGroup]="forgotPasswordForm" (ngSubmit)="onSubmit()" class="forgot-form">
        <mat-form-field appearance="outline">
          <mat-label>Email</mat-label>
          <mat-icon matPrefix>email</mat-icon>
          <input matInput type="email" formControlName="email">
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
          class="submit-btn"
          [disabled]="isLoading()"
        >
          @if (isLoading()) {
            <mat-spinner diameter="24"></mat-spinner>
          } @else {
            Send Reset Link
          }
        </button>
      </form>

      <a routerLink="/auth/login" class="back-link">
        <mat-icon>arrow_back</mat-icon>
        Back to Login
      </a>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .forgot-card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
      padding: 40px;
      width: 100%;
      max-width: 420px;
    }

    .card-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .header-icon {
      width: 64px;
      height: 64px;
      border-radius: 16px;
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
    }

    .header-icon mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: white;
    }

    .card-title {
      font-size: 28px;
      font-weight: 700;
      color: #111827;
      margin: 0 0 8px 0;
    }

    .card-subtitle {
      font-size: 15px;
      color: #6b7280;
      margin: 0;
    }

    .success-message {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 24px;
    }

    .success-message mat-icon {
      color: #10b981;
      flex-shrink: 0;
    }

    .success-message p {
      font-size: 14px;
      color: #065f46;
      margin: 0;
      line-height: 1.5;
    }

    .forgot-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .forgot-form mat-form-field {
      width: 100%;
    }

    .submit-btn {
      width: 100%;
      height: 48px;
      font-size: 16px;
      font-weight: 600;
      border-radius: 8px !important;
      margin-top: 8px;
    }

    .back-link {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-top: 24px;
      font-size: 14px;
      font-weight: 500;
      color: #6366f1;
      text-decoration: none;
    }

    .back-link:hover {
      color: #4f46e5;
    }

    .back-link mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    /* Dark Mode */
    @media (prefers-color-scheme: dark) {
      .forgot-card {
        background: #1f2937;
        border: 1px solid #374151;
      }

      .card-title {
        color: #f3f4f6;
      }

      .card-subtitle {
        color: #9ca3af;
      }

      .success-message {
        background: #064e3b;
        border-color: #065f46;
      }

      .success-message p {
        color: #a7f3d0;
      }
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
