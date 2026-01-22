import { Component, input, output, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../core/auth/auth.service';
import { interval, Subscription } from 'rxjs';
import { switchMap, filter } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatBadgeModule,
    MatDividerModule
  ],
  template: `
    <header class="flex items-center justify-between h-16 px-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <!-- Left section -->
      <div class="flex items-center gap-4">
        <button
          mat-icon-button
          (click)="toggleSidebar.emit()"
          class="lg:hidden"
        >
          <mat-icon>menu</mat-icon>
        </button>

        <!-- Search -->
        <div class="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <mat-icon class="text-gray-400">search</mat-icon>
          <input
            type="text"
            placeholder="Search..."
            class="bg-transparent border-none outline-none text-gray-700 dark:text-gray-300 w-64"
          />
        </div>
      </div>

      <!-- Right section -->
      <div class="flex items-center gap-4">
        <!-- Notifications -->
        <button mat-icon-button [matMenuTriggerFor]="notificationsMenu">
          <mat-icon
            [matBadge]="unreadNotifications()"
            [matBadgeHidden]="unreadNotifications() === 0"
            matBadgeColor="warn"
            matBadgeSize="small"
          >
            notifications
          </mat-icon>
        </button>

        <mat-menu #notificationsMenu="matMenu" class="w-80">
          <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <span class="font-semibold text-gray-900 dark:text-gray-100">Notifications</span>
          </div>
          <div class="max-h-64 overflow-y-auto">
            <div class="px-4 py-8 text-center text-gray-500">
              No new notifications
            </div>
          </div>
          <mat-divider />
          <button mat-menu-item routerLink="/notifications">
            <span>View all notifications</span>
          </button>
        </mat-menu>

        <!-- User menu -->
        <button mat-icon-button [matMenuTriggerFor]="userMenu">
          <div class="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-medium">
            {{ userInitials() }}
          </div>
        </button>

        <mat-menu #userMenu="matMenu">
          <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <p class="font-semibold text-gray-900 dark:text-gray-100">
              {{ authService.currentUser()?.fullName }}
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ authService.currentUser()?.email }}
            </p>
          </div>
          <button mat-menu-item routerLink="/settings/profile">
            <mat-icon>person</mat-icon>
            <span>Profile</span>
          </button>
          <button mat-menu-item routerLink="/settings">
            <mat-icon>settings</mat-icon>
            <span>Settings</span>
          </button>
          <mat-divider />
          <button mat-menu-item (click)="logout()">
            <mat-icon>logout</mat-icon>
            <span>Logout</span>
          </button>
        </mat-menu>
      </div>
    </header>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class HeaderComponent implements OnInit, OnDestroy {
  sidebarCollapsed = input(false);
  toggleSidebar = output<void>();

  readonly authService = inject(AuthService);
  private readonly apiService = inject(ApiService);

  unreadNotifications = signal(3); // Default to show badge is working
  recentNotifications = signal<Array<{title: string; time: string; type: string}>>([]);

  private notificationSub?: Subscription;

  ngOnInit(): void {
    // Fetch initial notification count
    this.fetchNotificationCount();

    // Poll for new notifications every 60 seconds
    this.notificationSub = interval(60000).pipe(
      filter(() => this.authService.isAuthenticated()),
      switchMap(() => this.apiService.get<{unreadCount: number}>('/notifications/summary'))
    ).subscribe({
      next: (response: any) => {
        if (response?.data?.unreadCount !== undefined) {
          this.unreadNotifications.set(response.data.unreadCount);
        }
      },
      error: () => {} // Silently fail for background polling
    });
  }

  ngOnDestroy(): void {
    this.notificationSub?.unsubscribe();
  }

  fetchNotificationCount(): void {
    if (!this.authService.isAuthenticated()) return;

    this.apiService.get<{unreadCount: number}>('/notifications/summary').subscribe({
      next: (response: any) => {
        if (response?.data?.unreadCount !== undefined) {
          this.unreadNotifications.set(response.data.unreadCount);
        }
      },
      error: () => {
        // Keep default value on error
      }
    });
  }

  userInitials = () => {
    const user = this.authService.currentUser();
    if (!user) return '?';
    const first = user.firstName?.charAt(0) ?? '';
    const last = user.lastName?.charAt(0) ?? '';
    return (first + last).toUpperCase() || '?';
  };

  logout(): void {
    this.authService.logout();
  }
}
