import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/auth/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { fadeIn, scaleIn } from '../../../shared/animations';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressSpinnerModule
  ],
  animations: [fadeIn, scaleIn],
  template: `
    <div @scaleIn class="login-card">
      <div class="login-header">
        <div class="logo-icon">
          <mat-icon>school</mat-icon>
        </div>
        <h1 class="login-title">Welcome back</h1>
        <p class="login-subtitle">Sign in to your account to continue</p>
      </div>

      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
        <!-- Email Field -->
        <div class="form-group">
          <label for="email" class="form-label">Email</label>
          <div class="input-wrapper" [class.focused]="emailFocused()" [class.error]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched">
            <mat-icon class="input-icon">email</mat-icon>
            <input
              id="email"
              type="email"
              formControlName="email"
              placeholder="Enter your email"
              (focus)="emailFocused.set(true)"
              (blur)="emailFocused.set(false)"
            >
          </div>
          @if (loginForm.get('email')?.hasError('required') && loginForm.get('email')?.touched) {
            <span class="error-text">Email is required</span>
          }
          @if (loginForm.get('email')?.hasError('email') && loginForm.get('email')?.touched) {
            <span class="error-text">Please enter a valid email</span>
          }
        </div>

        <!-- Password Field -->
        <div class="form-group">
          <label for="password" class="form-label">Password</label>
          <div class="input-wrapper" [class.focused]="passwordFocused()" [class.error]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">
            <mat-icon class="input-icon">lock</mat-icon>
            <input
              id="password"
              [type]="hidePassword() ? 'password' : 'text'"
              formControlName="password"
              placeholder="Enter your password"
              (focus)="passwordFocused.set(true)"
              (blur)="passwordFocused.set(false)"
            >
            <button type="button" class="toggle-password" (click)="hidePassword.set(!hidePassword())">
              <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
          </div>
          @if (loginForm.get('password')?.hasError('required') && loginForm.get('password')?.touched) {
            <span class="error-text">Password is required</span>
          }
        </div>

        <div class="form-options">
          <mat-checkbox formControlName="rememberMe" color="primary">
            Remember me
          </mat-checkbox>
          <a routerLink="/auth/forgot-password" class="forgot-link">
            Forgot password?
          </a>
        </div>

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
            Sign In
          }
        </button>
      </form>

      <div class="register-section">
        <p class="register-text">Don't have an account?</p>
        <a href="mailto:admin@universyslite.edu?subject=Account%20Registration%20Request" class="register-link">
          <mat-icon>email</mat-icon>
          Request Account Access
        </a>
        <p class="register-hint">
          University accounts are managed by administrators. Contact your department or IT support for assistance.
        </p>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .login-card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
      padding: 40px;
      width: 100%;
      max-width: 420px;
    }

    .login-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .logo-icon {
      width: 64px;
      height: 64px;
      border-radius: 16px;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
    }

    .logo-icon mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: white;
    }

    .login-title {
      font-size: 28px;
      font-weight: 700;
      color: #111827;
      margin: 0 0 8px 0;
    }

    .login-subtitle {
      font-size: 15px;
      color: #6b7280;
      margin: 0;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    /* Custom Form Fields */
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .form-label {
      font-size: 14px;
      font-weight: 500;
      color: #374151;
    }

    .input-wrapper {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 0 16px;
      height: 52px;
      background: #f9fafb;
      border: 1px solid #d1d5db;
      border-radius: 10px;
      transition: all 0.2s ease;
    }

    .input-wrapper:hover {
      border-color: #9ca3af;
    }

    .input-wrapper.focused {
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
      background: white;
    }

    .input-wrapper.error {
      border-color: #ef4444;
    }

    .input-wrapper.error.focused {
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }

    .input-icon {
      color: #9ca3af;
      font-size: 20px;
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    }

    .input-wrapper.focused .input-icon {
      color: #6366f1;
    }

    .input-wrapper input {
      flex: 1;
      border: none;
      background: transparent;
      font-size: 15px;
      color: #111827;
      outline: none;
      padding: 0;
      height: 100%;
    }

    .input-wrapper input::placeholder {
      color: #9ca3af;
    }

    .toggle-password {
      background: none;
      border: none;
      padding: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #9ca3af;
      transition: color 0.2s;
    }

    .toggle-password:hover {
      color: #6b7280;
    }

    .toggle-password mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .error-text {
      font-size: 12px;
      color: #ef4444;
      margin-top: 2px;
    }

    .form-options {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .forgot-link {
      font-size: 14px;
      color: #6366f1;
      text-decoration: none;
      font-weight: 500;
    }

    .forgot-link:hover {
      color: #4f46e5;
      text-decoration: underline;
    }

    .submit-btn {
      width: 100%;
      height: 48px;
      font-size: 16px;
      font-weight: 600;
      border-radius: 10px !important;
      margin-top: 8px;
    }

    .register-section {
      text-align: center;
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid #e5e7eb;
    }

    .register-text {
      font-size: 14px;
      color: #6b7280;
      margin: 0 0 12px 0;
    }

    .register-link {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 10px 20px;
      background: #f3f4f6;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      color: #374151;
      text-decoration: none;
      font-weight: 500;
      font-size: 14px;
      transition: all 0.2s;
    }

    .register-link:hover {
      background: #e5e7eb;
      border-color: #9ca3af;
      color: #111827;
    }

    .register-link mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .register-hint {
      font-size: 12px;
      color: #9ca3af;
      margin: 12px 0 0 0;
      line-height: 1.5;
    }

    /* Dark Mode */
    @media (prefers-color-scheme: dark) {
      .login-card {
        background: #1f2937;
        border: 1px solid #374151;
      }

      .login-title {
        color: #f3f4f6;
      }

      .login-subtitle {
        color: #9ca3af;
      }

      .form-label {
        color: #d1d5db;
      }

      .input-wrapper {
        background: #374151;
        border-color: #4b5563;
      }

      .input-wrapper.focused {
        background: #1f2937;
      }

      .input-wrapper input {
        color: #f3f4f6;
      }

      .register-link {
        color: #9ca3af;
      }
    }
  `]
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly notificationService = inject(NotificationService);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    rememberMe: [false]
  });

  hidePassword = signal(true);
  isLoading = signal(false);
  emailFocused = signal(false);
  passwordFocused = signal(false);

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
        this.router.navigateByUrl(returnUrl);
        this.notificationService.showSuccess('Welcome back!');
      },
      error: (error) => {
        this.isLoading.set(false);
        // Error is handled by the error interceptor
      }
    });
  }
}
