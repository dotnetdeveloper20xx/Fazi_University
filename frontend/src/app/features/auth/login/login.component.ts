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
  template: `
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        Welcome back
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        Sign in to your account to continue
      </p>
    </div>

    <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6">
      <mat-form-field appearance="outline" class="w-full">
        <mat-label>Email</mat-label>
        <input matInput type="email" formControlName="email" placeholder="Enter your email">
        <mat-icon matPrefix>email</mat-icon>
        @if (loginForm.get('email')?.hasError('required') && loginForm.get('email')?.touched) {
          <mat-error>Email is required</mat-error>
        }
        @if (loginForm.get('email')?.hasError('email') && loginForm.get('email')?.touched) {
          <mat-error>Please enter a valid email</mat-error>
        }
      </mat-form-field>

      <mat-form-field appearance="outline" class="w-full">
        <mat-label>Password</mat-label>
        <input
          matInput
          [type]="hidePassword() ? 'password' : 'text'"
          formControlName="password"
          placeholder="Enter your password"
        >
        <mat-icon matPrefix>lock</mat-icon>
        <button
          mat-icon-button
          matSuffix
          type="button"
          (click)="hidePassword.set(!hidePassword())"
        >
          <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
        </button>
        @if (loginForm.get('password')?.hasError('required') && loginForm.get('password')?.touched) {
          <mat-error>Password is required</mat-error>
        }
      </mat-form-field>

      <div class="flex items-center justify-between">
        <mat-checkbox formControlName="rememberMe" color="primary">
          Remember me
        </mat-checkbox>
        <a
          routerLink="/auth/forgot-password"
          class="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
        >
          Forgot password?
        </a>
      </div>

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
          Sign In
        }
      </button>
    </form>

    <p class="mt-8 text-center text-gray-600 dark:text-gray-400">
      Don't have an account?
      <a
        routerLink="/auth/register"
        class="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
      >
        Contact administrator
      </a>
    </p>
  `,
  styles: [`
    :host {
      display: block;
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
