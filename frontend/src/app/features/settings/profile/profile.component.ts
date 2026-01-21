import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/auth/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="space-y-6">
      <h1 class="text-2xl font-bold">My Profile</h1>

      <!-- User Info Card -->
      <mat-card class="p-6">
        <div class="flex items-start gap-6">
          <div class="w-24 h-24 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
            @if (user()?.avatarUrl) {
              <img [src]="user()?.avatarUrl" alt="Profile" class="w-24 h-24 rounded-full object-cover">
            } @else {
              <mat-icon class="text-5xl text-primary-600">person</mat-icon>
            }
          </div>
          <div class="flex-1">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {{ user()?.fullName }}
            </h2>
            <p class="text-gray-600 dark:text-gray-400">{{ user()?.email }}</p>
            <div class="flex flex-wrap gap-2 mt-3">
              @for (role of user()?.roles; track role) {
                <mat-chip-option [selectable]="false" color="primary">
                  {{ role }}
                </mat-chip-option>
              }
            </div>
            @if (user()?.lastLoginAt) {
              <p class="text-sm text-gray-500 mt-3">
                Last login: {{ user()?.lastLoginAt | date:'medium' }}
              </p>
            }
          </div>
        </div>
      </mat-card>

      <!-- Change Password Card -->
      <mat-card class="p-6">
        <h3 class="text-lg font-semibold mb-4">Change Password</h3>
        <form [formGroup]="passwordForm" (ngSubmit)="onChangePassword()" class="space-y-4 max-w-md">
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Current Password</mat-label>
            <input
              matInput
              [type]="hideCurrentPassword() ? 'password' : 'text'"
              formControlName="currentPassword"
            >
            <button
              mat-icon-button
              matSuffix
              type="button"
              (click)="hideCurrentPassword.set(!hideCurrentPassword())"
            >
              <mat-icon>{{ hideCurrentPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
            @if (passwordForm.get('currentPassword')?.hasError('required') && passwordForm.get('currentPassword')?.touched) {
              <mat-error>Current password is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>New Password</mat-label>
            <input
              matInput
              [type]="hideNewPassword() ? 'password' : 'text'"
              formControlName="newPassword"
            >
            <button
              mat-icon-button
              matSuffix
              type="button"
              (click)="hideNewPassword.set(!hideNewPassword())"
            >
              <mat-icon>{{ hideNewPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
            @if (passwordForm.get('newPassword')?.hasError('required') && passwordForm.get('newPassword')?.touched) {
              <mat-error>New password is required</mat-error>
            }
            @if (passwordForm.get('newPassword')?.hasError('minlength') && passwordForm.get('newPassword')?.touched) {
              <mat-error>Password must be at least 8 characters</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Confirm New Password</mat-label>
            <input
              matInput
              [type]="hideConfirmPassword() ? 'password' : 'text'"
              formControlName="confirmNewPassword"
            >
            <button
              mat-icon-button
              matSuffix
              type="button"
              (click)="hideConfirmPassword.set(!hideConfirmPassword())"
            >
              <mat-icon>{{ hideConfirmPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
            @if (passwordForm.get('confirmNewPassword')?.hasError('required') && passwordForm.get('confirmNewPassword')?.touched) {
              <mat-error>Please confirm your new password</mat-error>
            }
            @if (passwordForm.hasError('passwordMismatch') && passwordForm.get('confirmNewPassword')?.touched) {
              <mat-error>Passwords do not match</mat-error>
            }
          </mat-form-field>

          <button
            mat-flat-button
            color="primary"
            type="submit"
            [disabled]="isLoading() || passwordForm.invalid"
          >
            @if (isLoading()) {
              <mat-spinner diameter="20" class="inline-block mr-2"></mat-spinner>
            }
            Update Password
          </button>
        </form>
      </mat-card>

      <!-- Account Info Card -->
      <mat-card class="p-6">
        <h3 class="text-lg font-semibold mb-4">Account Information</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="text-sm text-gray-500">User ID</label>
            <p class="text-gray-900 dark:text-gray-100">{{ user()?.id }}</p>
          </div>
          <div>
            <label class="text-sm text-gray-500">Account Status</label>
            <p class="text-gray-900 dark:text-gray-100">
              @if (user()?.isActive) {
                <span class="inline-flex items-center text-green-600">
                  <mat-icon class="text-sm mr-1">check_circle</mat-icon>
                  Active
                </span>
              } @else {
                <span class="inline-flex items-center text-red-600">
                  <mat-icon class="text-sm mr-1">cancel</mat-icon>
                  Inactive
                </span>
              }
            </p>
          </div>
          <div>
            <label class="text-sm text-gray-500">First Name</label>
            <p class="text-gray-900 dark:text-gray-100">{{ user()?.firstName }}</p>
          </div>
          <div>
            <label class="text-sm text-gray-500">Last Name</label>
            <p class="text-gray-900 dark:text-gray-100">{{ user()?.lastName }}</p>
          </div>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class ProfileComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);

  user = this.authService.currentUser;
  isLoading = signal(false);
  hideCurrentPassword = signal(true);
  hideNewPassword = signal(true);
  hideConfirmPassword = signal(true);

  passwordForm: FormGroup = this.fb.group({
    currentPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmNewPassword: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  ngOnInit(): void {
    // Refresh user data from API
    this.authService.getCurrentUser().subscribe();
  }

  onChangePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    this.authService.changePassword(this.passwordForm.value).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.notificationService.showSuccess('Password updated successfully');
        this.passwordForm.reset();
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  private passwordMatchValidator(form: FormGroup): { passwordMismatch: boolean } | null {
    const newPassword = form.get('newPassword')?.value;
    const confirmNewPassword = form.get('confirmNewPassword')?.value;

    if (newPassword && confirmNewPassword && newPassword !== confirmNewPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }
}
