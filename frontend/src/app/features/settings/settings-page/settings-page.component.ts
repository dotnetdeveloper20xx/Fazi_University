import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../../core/auth/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTooltipModule
  ],
  template: `
    <div class="settings-layout">
      <!-- Sidebar Navigation -->
      <aside class="settings-sidebar" [class.collapsed]="sidebarCollapsed()">
        <div class="sidebar-header">
          <h2 class="sidebar-title" *ngIf="!sidebarCollapsed()">
            <mat-icon>settings</mat-icon>
            Settings
          </h2>
          <button mat-icon-button (click)="toggleSidebar()" class="collapse-btn">
            <mat-icon>{{ sidebarCollapsed() ? 'chevron_right' : 'chevron_left' }}</mat-icon>
          </button>
        </div>

        <nav class="settings-nav" *ngIf="!sidebarCollapsed()">
          <button class="nav-item" [class.active]="activeSection() === 'profile'"
                  (click)="setSection('profile')">
            <mat-icon>person</mat-icon>
            <span>Profile</span>
          </button>
          <button class="nav-item" [class.active]="activeSection() === 'account'"
                  (click)="setSection('account')">
            <mat-icon>manage_accounts</mat-icon>
            <span>Account</span>
          </button>
          <button class="nav-item" [class.active]="activeSection() === 'security'"
                  (click)="setSection('security')">
            <mat-icon>security</mat-icon>
            <span>Security</span>
          </button>
          <button class="nav-item" [class.active]="activeSection() === 'appearance'"
                  (click)="setSection('appearance')">
            <mat-icon>palette</mat-icon>
            <span>Appearance</span>
          </button>
          <button class="nav-item" [class.active]="activeSection() === 'notifications'"
                  (click)="setSection('notifications')">
            <mat-icon>notifications</mat-icon>
            <span>Notifications</span>
          </button>
        </nav>
      </aside>

      <!-- Main Content -->
      <main class="settings-content">
        <!-- Profile Section -->
        @if (activeSection() === 'profile') {
          <div class="section-header">
            <h1 class="section-title">Profile</h1>
            <p class="section-subtitle">Manage your personal information</p>
          </div>

          <div class="settings-card">
            <div class="profile-header">
              <div class="avatar-section">
                <div class="avatar">
                  @if (user()?.avatarUrl) {
                    <img [src]="user()?.avatarUrl" alt="Profile">
                  } @else {
                    <span class="avatar-initials">{{ getInitials() }}</span>
                  }
                </div>
                <input type="file" #fileInput accept="image/*" style="display: none"
                       (change)="onPhotoSelected($event)">
                <button mat-stroked-button class="change-avatar-btn" (click)="fileInput.click()">
                  <mat-icon>photo_camera</mat-icon>
                  Change Photo
                </button>
              </div>
              <div class="profile-info">
                <h2 class="profile-name">{{ user()?.fullName }}</h2>
                <p class="profile-email">{{ user()?.email }}</p>
                <div class="profile-roles">
                  @for (role of user()?.roles; track role) {
                    <span class="role-badge">{{ role }}</span>
                  }
                </div>
              </div>
            </div>
          </div>

          <div class="settings-card">
            <h3 class="card-title">Personal Information</h3>
            <div class="form-grid">
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>First Name</mat-label>
                <input matInput [value]="user()?.firstName ?? ''" placeholder="Not set" readonly>
                <mat-icon matSuffix>lock</mat-icon>
              </mat-form-field>
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Last Name</mat-label>
                <input matInput [value]="user()?.lastName ?? ''" placeholder="Not set" readonly>
                <mat-icon matSuffix>lock</mat-icon>
              </mat-form-field>
              <mat-form-field appearance="outline" class="form-field span-2">
                <mat-label>Email Address</mat-label>
                <input matInput [value]="user()?.email ?? ''" placeholder="Not set" readonly>
                <mat-icon matSuffix>lock</mat-icon>
              </mat-form-field>
            </div>
            <p class="help-text">
              <mat-icon>info</mat-icon>
              Contact your administrator to update your personal information.
            </p>
          </div>
        }

        <!-- Account Section -->
        @if (activeSection() === 'account') {
          <div class="section-header">
            <h1 class="section-title">Account</h1>
            <p class="section-subtitle">Manage your account settings</p>
          </div>

          <div class="settings-card">
            <h3 class="card-title">Account Information</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">User ID</span>
                <span class="info-value mono">{{ user()?.id || 'N/A' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Account Status</span>
                <span class="info-value">
                  @if (user()?.isActive !== false) {
                    <span class="status-badge active">
                      <span class="status-dot"></span>
                      Active
                    </span>
                  } @else {
                    <span class="status-badge inactive">
                      <span class="status-dot"></span>
                      Inactive
                    </span>
                  }
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">Last Login</span>
                <span class="info-value">
                  @if (user()?.lastLoginAt) {
                    {{ user()?.lastLoginAt | date:'medium' }}
                  } @else {
                    {{ currentLoginTime | date:'medium' }}
                  }
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">Roles</span>
                <span class="info-value">
                  <div class="roles-list">
                    @if (user()?.roles && user()!.roles.length > 0) {
                      @for (role of user()?.roles; track role) {
                        <span class="role-chip">{{ role }}</span>
                      }
                    } @else {
                      <span class="text-gray-400">No roles assigned</span>
                    }
                  </div>
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">Email</span>
                <span class="info-value">{{ user()?.email || 'N/A' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Full Name</span>
                <span class="info-value">{{ user()?.fullName || 'N/A' }}</span>
              </div>
            </div>
          </div>

          <div class="settings-card danger-zone">
            <h3 class="card-title danger">
              <mat-icon>warning</mat-icon>
              Danger Zone
            </h3>
            <p class="danger-text">Once you delete your account, there is no going back. Please be certain.</p>
            <button mat-stroked-button color="warn" disabled>
              <mat-icon>delete_forever</mat-icon>
              Delete Account
            </button>
          </div>
        }

        <!-- Security Section -->
        @if (activeSection() === 'security') {
          <div class="section-header">
            <h1 class="section-title">Security</h1>
            <p class="section-subtitle">Manage your password and security settings</p>
          </div>

          <div class="settings-card">
            <h3 class="card-title">Change Password</h3>
            <form [formGroup]="passwordForm" (ngSubmit)="onChangePassword()" class="password-form">
              <div class="password-field">
                <label class="field-label">Current Password</label>
                <div class="password-input-wrapper"
                     [class.focused]="currentPasswordFocused()"
                     [class.error]="passwordForm.get('currentPassword')?.invalid && passwordForm.get('currentPassword')?.touched">
                  <mat-icon class="field-icon">lock</mat-icon>
                  <input
                    [type]="hideCurrentPassword() ? 'password' : 'text'"
                    formControlName="currentPassword"
                    placeholder="Enter current password"
                    (focus)="currentPasswordFocused.set(true)"
                    (blur)="currentPasswordFocused.set(false)"
                  >
                  <button type="button" class="toggle-visibility" (click)="hideCurrentPassword.set(!hideCurrentPassword())">
                    <mat-icon>{{ hideCurrentPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
                  </button>
                </div>
                @if (passwordForm.get('currentPassword')?.hasError('required') && passwordForm.get('currentPassword')?.touched) {
                  <span class="error-text">Current password is required</span>
                }
              </div>

              <div class="password-field">
                <label class="field-label">New Password</label>
                <div class="password-input-wrapper"
                     [class.focused]="newPasswordFocused()"
                     [class.error]="passwordForm.get('newPassword')?.invalid && passwordForm.get('newPassword')?.touched">
                  <mat-icon class="field-icon">lock_reset</mat-icon>
                  <input
                    [type]="hideNewPassword() ? 'password' : 'text'"
                    formControlName="newPassword"
                    placeholder="Enter new password"
                    (focus)="newPasswordFocused.set(true)"
                    (blur)="newPasswordFocused.set(false)"
                  >
                  <button type="button" class="toggle-visibility" (click)="hideNewPassword.set(!hideNewPassword())">
                    <mat-icon>{{ hideNewPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
                  </button>
                </div>
                @if (passwordForm.get('newPassword')?.hasError('required') && passwordForm.get('newPassword')?.touched) {
                  <span class="error-text">New password is required</span>
                }
                @if (passwordForm.get('newPassword')?.hasError('minlength') && passwordForm.get('newPassword')?.touched) {
                  <span class="error-text">Password must be at least 8 characters</span>
                }
              </div>

              <div class="password-field">
                <label class="field-label">Confirm New Password</label>
                <div class="password-input-wrapper"
                     [class.focused]="confirmPasswordFocused()"
                     [class.error]="(passwordForm.get('confirmNewPassword')?.invalid || passwordForm.hasError('passwordMismatch')) && passwordForm.get('confirmNewPassword')?.touched">
                  <mat-icon class="field-icon">check_circle</mat-icon>
                  <input
                    [type]="hideConfirmPassword() ? 'password' : 'text'"
                    formControlName="confirmNewPassword"
                    placeholder="Confirm new password"
                    (focus)="confirmPasswordFocused.set(true)"
                    (blur)="confirmPasswordFocused.set(false)"
                  >
                  <button type="button" class="toggle-visibility" (click)="hideConfirmPassword.set(!hideConfirmPassword())">
                    <mat-icon>{{ hideConfirmPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
                  </button>
                </div>
                @if (passwordForm.get('confirmNewPassword')?.hasError('required') && passwordForm.get('confirmNewPassword')?.touched) {
                  <span class="error-text">Please confirm your new password</span>
                }
                @if (passwordForm.hasError('passwordMismatch') && passwordForm.get('confirmNewPassword')?.touched) {
                  <span class="error-text">Passwords do not match</span>
                }
              </div>

              <button mat-flat-button color="primary" type="submit"
                      [disabled]="isChangingPassword() || passwordForm.invalid" class="submit-password-btn">
                @if (isChangingPassword()) {
                  <mat-spinner diameter="18" class="btn-spinner"></mat-spinner>
                }
                <mat-icon>lock</mat-icon>
                Update Password
              </button>
            </form>
          </div>

          <div class="settings-card">
            <h3 class="card-title">Two-Factor Authentication</h3>
            <div class="two-factor-section">
              <div class="two-factor-info">
                <mat-icon class="two-factor-icon">shield</mat-icon>
                <div>
                  <p class="two-factor-title">Protect your account with 2FA</p>
                  <p class="two-factor-desc">Add an extra layer of security to your account</p>
                </div>
              </div>
              <button mat-stroked-button disabled>
                <mat-icon>phonelink_lock</mat-icon>
                Enable 2FA
              </button>
            </div>
          </div>
        }

        <!-- Appearance Section -->
        @if (activeSection() === 'appearance') {
          <div class="section-header">
            <h1 class="section-title">Appearance</h1>
            <p class="section-subtitle">Customize how the application looks</p>
          </div>

          <div class="settings-card">
            <h3 class="card-title">Theme</h3>
            <div class="theme-options">
              <button class="theme-option" [class.active]="selectedTheme() === 'light'"
                      (click)="setTheme('light')">
                <div class="theme-preview light">
                  <mat-icon>light_mode</mat-icon>
                </div>
                <span class="theme-label">Light</span>
              </button>
              <button class="theme-option" [class.active]="selectedTheme() === 'dark'"
                      (click)="setTheme('dark')">
                <div class="theme-preview dark">
                  <mat-icon>dark_mode</mat-icon>
                </div>
                <span class="theme-label">Dark</span>
              </button>
              <button class="theme-option" [class.active]="selectedTheme() === 'system'"
                      (click)="setTheme('system')">
                <div class="theme-preview system">
                  <mat-icon>settings_brightness</mat-icon>
                </div>
                <span class="theme-label">System</span>
              </button>
            </div>
          </div>

          <div class="settings-card">
            <h3 class="card-title">Display Settings</h3>
            <div class="toggle-list">
              <div class="toggle-item">
                <div class="toggle-info">
                  <span class="toggle-label">Compact Mode</span>
                  <span class="toggle-desc">Reduce spacing and font sizes</span>
                </div>
                <mat-slide-toggle [(ngModel)]="compactMode" color="primary"></mat-slide-toggle>
              </div>
              <div class="toggle-item">
                <div class="toggle-info">
                  <span class="toggle-label">Show Animations</span>
                  <span class="toggle-desc">Enable smooth transitions</span>
                </div>
                <mat-slide-toggle [(ngModel)]="showAnimations" color="primary"></mat-slide-toggle>
              </div>
            </div>
          </div>
        }

        <!-- Notifications Section -->
        @if (activeSection() === 'notifications') {
          <div class="section-header">
            <h1 class="section-title">Notifications</h1>
            <p class="section-subtitle">Manage how you receive notifications</p>
          </div>

          <div class="settings-card">
            <h3 class="card-title">Email Notifications</h3>
            <div class="toggle-list">
              <div class="toggle-item">
                <div class="toggle-info">
                  <span class="toggle-label">Academic Updates</span>
                  <span class="toggle-desc">Grade postings, course changes, etc.</span>
                </div>
                <mat-slide-toggle [(ngModel)]="emailAcademic" color="primary"></mat-slide-toggle>
              </div>
              <div class="toggle-item">
                <div class="toggle-info">
                  <span class="toggle-label">Financial Alerts</span>
                  <span class="toggle-desc">Payment due dates, billing updates</span>
                </div>
                <mat-slide-toggle [(ngModel)]="emailFinancial" color="primary"></mat-slide-toggle>
              </div>
              <div class="toggle-item">
                <div class="toggle-info">
                  <span class="toggle-label">System Announcements</span>
                  <span class="toggle-desc">Maintenance, new features</span>
                </div>
                <mat-slide-toggle [(ngModel)]="emailSystem" color="primary"></mat-slide-toggle>
              </div>
            </div>
          </div>

          <div class="settings-card">
            <h3 class="card-title">In-App Notifications</h3>
            <div class="toggle-list">
              <div class="toggle-item">
                <div class="toggle-info">
                  <span class="toggle-label">Desktop Notifications</span>
                  <span class="toggle-desc">Show browser notifications</span>
                </div>
                <mat-slide-toggle [(ngModel)]="desktopNotifications" color="primary"></mat-slide-toggle>
              </div>
              <div class="toggle-item">
                <div class="toggle-info">
                  <span class="toggle-label">Sound Alerts</span>
                  <span class="toggle-desc">Play sound for notifications</span>
                </div>
                <mat-slide-toggle [(ngModel)]="soundAlerts" color="primary"></mat-slide-toggle>
              </div>
            </div>
          </div>
        }
      </main>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .settings-layout {
      display: flex;
      gap: 24px;
      min-height: calc(100vh - 200px);
    }

    /* Sidebar */
    .settings-sidebar {
      width: 280px;
      flex-shrink: 0;
      background: white;
      border-radius: 16px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.05);
      overflow: hidden;
      transition: width 0.3s ease;
    }

    .settings-sidebar.collapsed {
      width: 56px;
    }

    .sidebar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      border-bottom: 1px solid #e5e7eb;
      background: #f8fafc;
    }

    .sidebar-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      font-weight: 600;
      color: #374151;
      margin: 0;
    }

    .sidebar-title mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: #6b7280;
    }

    .settings-nav {
      padding: 8px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border: none;
      background: transparent;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      color: #4b5563;
      transition: all 0.2s ease;
      text-align: left;
      width: 100%;
    }

    .nav-item:hover {
      background: #f3f4f6;
    }

    .nav-item.active {
      background: #dbeafe;
      color: #1d4ed8;
    }

    .nav-item mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    /* Main Content */
    .settings-content {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .section-header {
      margin-bottom: 4px;
    }

    .section-title {
      font-size: 24px;
      font-weight: 700;
      color: #111827;
      margin: 0;
    }

    .section-subtitle {
      font-size: 14px;
      color: #6b7280;
      margin: 4px 0 0 0;
    }

    /* Settings Cards */
    .settings-card {
      background: white;
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.05);
    }

    .card-title {
      font-size: 16px;
      font-weight: 600;
      color: #111827;
      margin: 0 0 20px 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .card-title.danger {
      color: #dc2626;
    }

    /* Profile Section */
    .profile-header {
      display: flex;
      gap: 24px;
      align-items: flex-start;
    }

    .avatar-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }

    .avatar {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .avatar-initials {
      font-size: 32px;
      font-weight: 600;
      color: white;
    }

    .change-avatar-btn {
      font-size: 12px;
    }

    .profile-info {
      flex: 1;
    }

    .profile-name {
      font-size: 24px;
      font-weight: 600;
      color: #111827;
      margin: 0;
    }

    .profile-email {
      font-size: 14px;
      color: #6b7280;
      margin: 4px 0 0 0;
    }

    .profile-roles {
      display: flex;
      gap: 8px;
      margin-top: 12px;
    }

    .role-badge {
      display: inline-block;
      padding: 4px 12px;
      background: #dbeafe;
      color: #1d4ed8;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
    }

    /* Form Grid */
    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }

    .form-field {
      width: 100%;
    }

    .span-2 {
      grid-column: span 2;
    }

    .help-text {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: #6b7280;
      margin-top: 16px;
    }

    .help-text mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    /* Info Grid */
    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .info-label {
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #6b7280;
    }

    .info-value {
      font-size: 14px;
      color: #111827;
    }

    .info-value.mono {
      font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
      font-size: 12px;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
    }

    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
    }

    .status-badge.active {
      background: #d1fae5;
      color: #059669;
    }

    .status-badge.active .status-dot {
      background: #10b981;
    }

    .status-badge.inactive {
      background: #fee2e2;
      color: #dc2626;
    }

    .status-badge.inactive .status-dot {
      background: #ef4444;
    }

    .roles-list {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }

    .role-chip {
      padding: 2px 8px;
      background: #e5e7eb;
      color: #374151;
      border-radius: 4px;
      font-size: 12px;
    }

    /* Danger Zone */
    .danger-zone {
      border: 1px solid #fee2e2;
    }

    .danger-text {
      font-size: 14px;
      color: #6b7280;
      margin: 0 0 16px 0;
    }

    /* Password Form */
    .password-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
      max-width: 400px;
    }

    .password-field {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .field-label {
      font-size: 14px;
      font-weight: 500;
      color: #374151;
    }

    .password-input-wrapper {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 0 16px;
      height: 48px;
      background: #f9fafb;
      border: 1px solid #d1d5db;
      border-radius: 10px;
      transition: all 0.2s ease;
    }

    .password-input-wrapper:hover {
      border-color: #9ca3af;
    }

    .password-input-wrapper.focused {
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
      background: white;
    }

    .password-input-wrapper.error {
      border-color: #ef4444;
    }

    .password-input-wrapper.error.focused {
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }

    .field-icon {
      color: #9ca3af;
      font-size: 20px;
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    }

    .password-input-wrapper.focused .field-icon {
      color: #6366f1;
    }

    .password-input-wrapper input {
      flex: 1;
      border: none;
      background: transparent;
      font-size: 15px;
      color: #111827;
      outline: none;
      padding: 0;
      height: 100%;
    }

    .password-input-wrapper input::placeholder {
      color: #9ca3af;
    }

    .toggle-visibility {
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

    .toggle-visibility:hover {
      color: #6b7280;
    }

    .toggle-visibility mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .error-text {
      font-size: 12px;
      color: #ef4444;
      margin-top: 2px;
    }

    .submit-password-btn {
      margin-top: 8px;
    }

    .btn-spinner {
      display: inline-block;
      margin-right: 8px;
    }

    /* Two Factor */
    .two-factor-section {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }

    .two-factor-info {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .two-factor-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      color: #6366f1;
    }

    .two-factor-title {
      font-size: 14px;
      font-weight: 500;
      color: #111827;
      margin: 0;
    }

    .two-factor-desc {
      font-size: 13px;
      color: #6b7280;
      margin: 4px 0 0 0;
    }

    /* Theme Options */
    .theme-options {
      display: flex;
      gap: 16px;
    }

    .theme-option {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 16px 24px;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      background: transparent;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .theme-option:hover {
      border-color: #d1d5db;
    }

    .theme-option.active {
      border-color: #3b82f6;
      background: #eff6ff;
    }

    .theme-preview {
      width: 60px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .theme-preview.light {
      background: #f8fafc;
      border: 1px solid #e5e7eb;
    }

    .theme-preview.light mat-icon {
      color: #f59e0b;
    }

    .theme-preview.dark {
      background: #1f2937;
    }

    .theme-preview.dark mat-icon {
      color: #fbbf24;
    }

    .theme-preview.system {
      background: linear-gradient(135deg, #f8fafc 50%, #1f2937 50%);
    }

    .theme-preview.system mat-icon {
      color: #6366f1;
    }

    .theme-label {
      font-size: 13px;
      font-weight: 500;
      color: #374151;
    }

    /* Toggle List */
    .toggle-list {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .toggle-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #f3f4f6;
    }

    .toggle-item:last-child {
      border-bottom: none;
    }

    .toggle-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .toggle-label {
      font-size: 14px;
      font-weight: 500;
      color: #111827;
    }

    .toggle-desc {
      font-size: 13px;
      color: #6b7280;
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .settings-sidebar {
        position: fixed;
        left: 0;
        top: 64px;
        bottom: 0;
        z-index: 100;
        border-radius: 0;
      }

      .settings-sidebar.collapsed {
        width: 0;
        padding: 0;
      }

      .settings-content {
        width: 100%;
      }
    }

    @media (max-width: 768px) {
      .form-grid, .info-grid {
        grid-template-columns: 1fr;
      }

      .span-2 {
        grid-column: span 1;
      }

      .profile-header {
        flex-direction: column;
        align-items: center;
        text-align: center;
      }

      .profile-roles {
        justify-content: center;
      }

      .theme-options {
        flex-direction: column;
      }

      .two-factor-section {
        flex-direction: column;
        align-items: flex-start;
      }
    }

    /* Dark Mode */
    @media (prefers-color-scheme: dark) {
      .settings-sidebar, .settings-card {
        background: #1f2937;
      }

      .sidebar-header {
        background: #111827;
        border-color: #374151;
      }

      .sidebar-title, .nav-item {
        color: #d1d5db;
      }

      .nav-item:hover {
        background: #374151;
      }

      .nav-item.active {
        background: #1e3a5f;
        color: #60a5fa;
      }

      .section-title, .card-title, .profile-name, .info-value,
      .toggle-label, .theme-label, .two-factor-title {
        color: #f3f4f6;
      }

      .toggle-item {
        border-color: #374151;
      }

      .theme-option {
        border-color: #4b5563;
      }

      .theme-option:hover {
        border-color: #6b7280;
      }

      .theme-option.active {
        border-color: #3b82f6;
        background: #1e3a5f;
      }

      .field-label {
        color: #d1d5db;
      }

      .password-input-wrapper {
        background: #374151;
        border-color: #4b5563;
      }

      .password-input-wrapper.focused {
        background: #1f2937;
      }

      .password-input-wrapper input {
        color: #f3f4f6;
      }
    }
  `]
})
export class SettingsPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);

  // State
  sidebarCollapsed = signal(false);
  activeSection = signal<'profile' | 'account' | 'security' | 'appearance' | 'notifications'>('profile');

  // User
  user = this.authService.currentUser;
  currentLoginTime = new Date(); // Track current session start time

  // Password form
  passwordForm: FormGroup = this.fb.group({
    currentPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmNewPassword: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  isChangingPassword = signal(false);
  hideCurrentPassword = signal(true);
  hideNewPassword = signal(true);
  hideConfirmPassword = signal(true);
  currentPasswordFocused = signal(false);
  newPasswordFocused = signal(false);
  confirmPasswordFocused = signal(false);

  // Appearance
  selectedTheme = signal<'light' | 'dark' | 'system'>(this.loadThemeFromStorage());
  compactMode = false;
  showAnimations = true;

  // Notifications
  emailAcademic = true;
  emailFinancial = true;
  emailSystem = true;
  desktopNotifications = false;
  soundAlerts = false;

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe();
    // Apply saved theme on load
    this.applyTheme(this.selectedTheme());
  }

  toggleSidebar(): void {
    this.sidebarCollapsed.update(v => !v);
  }

  setSection(section: 'profile' | 'account' | 'security' | 'appearance' | 'notifications'): void {
    this.activeSection.set(section);
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.notificationService.showError('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.notificationService.showError('Image size must be less than 5MB');
        return;
      }

      // For now, show a message that this feature is coming soon
      // In a real app, you would upload the file to a server
      this.notificationService.showInfo('Profile photo upload coming soon! File selected: ' + file.name);

      // Reset the input
      input.value = '';
    }
  }

  getInitials(): string {
    const user = this.user();
    if (!user) return '?';
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
  }

  setTheme(theme: 'light' | 'dark' | 'system'): void {
    this.selectedTheme.set(theme);
    this.applyTheme(theme);
    localStorage.setItem('theme', theme);
    this.notificationService.showSuccess(`Theme changed to ${theme}`);
  }

  private loadThemeFromStorage(): 'light' | 'dark' | 'system' {
    const saved = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
    if (saved && ['light', 'dark', 'system'].includes(saved)) {
      // Apply theme on load
      setTimeout(() => this.applyTheme(saved), 0);
      return saved;
    }
    return 'system';
  }

  private applyTheme(theme: 'light' | 'dark' | 'system'): void {
    const root = document.documentElement;
    const body = document.body;

    // Remove existing theme classes
    root.classList.remove('light', 'dark');
    body.classList.remove('light-theme', 'dark-theme');

    if (theme === 'system') {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
        body.classList.add('dark-theme');
      } else {
        root.classList.add('light');
        body.classList.add('light-theme');
      }
    } else if (theme === 'dark') {
      root.classList.add('dark');
      body.classList.add('dark-theme');
    } else {
      root.classList.add('light');
      body.classList.add('light-theme');
    }
  }

  onChangePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.isChangingPassword.set(true);

    this.authService.changePassword(this.passwordForm.value).subscribe({
      next: () => {
        this.isChangingPassword.set(false);
        this.notificationService.showSuccess('Password updated successfully');
        this.passwordForm.reset();
      },
      error: () => {
        this.isChangingPassword.set(false);
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
