import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { RouterModule } from '@angular/router';
import { NotificationsDataService } from '../services/notifications-data.service';
import { NotificationService } from '../../../core/services/notification.service';
import {
  NotificationListItem,
  NotificationSummary,
  NotificationPreference,
  NOTIFICATION_TYPES,
  NOTIFICATION_PRIORITIES
} from '../../../models';

@Component({
  selector: 'app-notification-center',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatBadgeModule,
    MatTooltipModule,
    MatTabsModule,
    MatSlideToggleModule,
    MatDividerModule,
    MatPaginatorModule
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Notification Center</h1>
          <p class="text-gray-500 dark:text-gray-400">Manage your notifications and preferences</p>
        </div>
        @if (summary() && summary()!.unreadCount > 0) {
          <button mat-flat-button color="primary" (click)="markAllAsRead()" [disabled]="isMarkingAll()">
            @if (isMarkingAll()) {
              <mat-spinner diameter="20" class="inline-block mr-2"></mat-spinner>
            }
            <mat-icon>done_all</mat-icon>
            Mark All as Read ({{ summary()!.unreadCount }})
          </button>
        }
      </div>

      <!-- Summary Cards -->
      @if (summary()) {
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
          <mat-card class="p-4">
            <div class="text-sm text-gray-500">Total Notifications</div>
            <div class="text-2xl font-bold text-gray-900">{{ summary()!.totalCount }}</div>
          </mat-card>
          <mat-card class="p-4">
            <div class="text-sm text-gray-500">Unread</div>
            <div class="text-2xl font-bold text-blue-600">{{ summary()!.unreadCount }}</div>
          </mat-card>
          <mat-card class="p-4 md:col-span-1 col-span-2">
            <div class="text-sm text-gray-500">Read</div>
            <div class="text-2xl font-bold text-green-600">{{ summary()!.totalCount - summary()!.unreadCount }}</div>
          </mat-card>
        </div>
      }

      <mat-tab-group>
        <!-- Notifications Tab -->
        <mat-tab label="Notifications">
          <div class="py-4 space-y-4">
            <!-- Filters -->
            <mat-card class="p-4">
              <div class="flex flex-wrap gap-4 items-end">
                <mat-form-field appearance="outline" class="min-w-[130px]">
                  <mat-label>Type</mat-label>
                  <mat-select [(ngModel)]="filterType" (selectionChange)="loadNotifications()">
                    <mat-option value="">All Types</mat-option>
                    @for (type of notificationTypes; track type) {
                      <mat-option [value]="type">{{ type }}</mat-option>
                    }
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline" class="min-w-[110px]">
                  <mat-label>Status</mat-label>
                  <mat-select [(ngModel)]="filterRead" (selectionChange)="loadNotifications()">
                    <mat-option [value]="null">All Status</mat-option>
                    <mat-option [value]="false">Unread</mat-option>
                    <mat-option [value]="true">Read</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline" class="min-w-[120px]">
                  <mat-label>Priority</mat-label>
                  <mat-select [(ngModel)]="filterPriority" (selectionChange)="loadNotifications()">
                    <mat-option value="">All Priorities</mat-option>
                    @for (priority of notificationPriorities; track priority) {
                      <mat-option [value]="priority">{{ priority }}</mat-option>
                    }
                  </mat-select>
                </mat-form-field>

                <button mat-icon-button (click)="loadNotifications()" matTooltip="Refresh">
                  <mat-icon>refresh</mat-icon>
                </button>
              </div>
            </mat-card>

            <!-- Notifications List -->
            @if (isLoading()) {
              <div class="flex items-center justify-center p-12">
                <mat-spinner diameter="40"></mat-spinner>
              </div>
            } @else if (notifications().length === 0) {
              <mat-card class="p-12">
                <div class="text-center">
                  <mat-icon class="text-5xl text-gray-400 mb-4">notifications_off</mat-icon>
                  <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Notifications</h3>
                  <p class="text-gray-500">You're all caught up! No notifications match your filters.</p>
                </div>
              </mat-card>
            } @else {
              <div class="space-y-2">
                @for (notification of notifications(); track notification.id) {
                  <mat-card class="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            [class.border-l-4]="!notification.isRead"
                            [class.border-l-blue-500]="!notification.isRead"
                            (click)="handleNotificationClick(notification)">
                    <div class="flex items-start gap-4">
                      <!-- Icon -->
                      <div class="flex-shrink-0">
                        <div class="w-10 h-10 rounded-full flex items-center justify-center"
                             [class]="getNotificationIconClass(notification)">
                          <mat-icon>{{ getNotificationIcon(notification) }}</mat-icon>
                        </div>
                      </div>

                      <!-- Content -->
                      <div class="flex-grow min-w-0">
                        <div class="flex items-center gap-2 mb-1">
                          <span class="font-semibold text-gray-900 dark:text-gray-100">
                            {{ notification.title }}
                          </span>
                          @if (!notification.isRead) {
                            <span class="w-2 h-2 rounded-full bg-blue-500"></span>
                          }
                          <span class="px-2 py-0.5 rounded-full text-xs font-medium"
                                [class]="getPriorityClass(notification.priority)">
                            {{ notification.priority }}
                          </span>
                        </div>
                        <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {{ notification.message }}
                        </p>
                        <div class="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>{{ notification.type }}</span>
                          <span>{{ getRelativeTime(notification.createdAt) }}</span>
                        </div>
                      </div>

                      <!-- Actions -->
                      <div class="flex-shrink-0 flex gap-1">
                        @if (!notification.isRead) {
                          <button mat-icon-button color="primary"
                                  (click)="markAsRead(notification, $event)"
                                  matTooltip="Mark as Read">
                            <mat-icon>check</mat-icon>
                          </button>
                        }
                        <button mat-icon-button color="warn"
                                (click)="deleteNotification(notification, $event)"
                                matTooltip="Delete">
                          <mat-icon>delete</mat-icon>
                        </button>
                      </div>
                    </div>
                  </mat-card>
                }
              </div>

              <mat-paginator
                [length]="totalCount()"
                [pageSize]="pageSize"
                [pageIndex]="pageIndex"
                [pageSizeOptions]="[10, 25, 50]"
                (page)="onPageChange($event)"
                showFirstLastButtons>
              </mat-paginator>
            }
          </div>
        </mat-tab>

        <!-- Preferences Tab -->
        <mat-tab label="Preferences">
          <div class="py-4">
            @if (isLoadingPreferences()) {
              <div class="flex items-center justify-center p-12">
                <mat-spinner diameter="40"></mat-spinner>
              </div>
            } @else if (preferences().length === 0) {
              <mat-card class="p-12">
                <div class="text-center">
                  <mat-icon class="text-5xl text-gray-400 mb-4">settings</mat-icon>
                  <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Preferences</h3>
                  <p class="text-gray-500">Notification preferences will appear here once available.</p>
                </div>
              </mat-card>
            } @else {
              <mat-card>
                <div class="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Notification Preferences
                  </h3>
                  <p class="text-sm text-gray-500">Choose how you want to receive notifications</p>
                </div>

                <div class="divide-y divide-gray-200 dark:divide-gray-700">
                  @for (pref of preferences(); track pref.id) {
                    <div class="p-4">
                      <div class="flex items-center justify-between">
                        <div>
                          <div class="font-medium text-gray-900 dark:text-gray-100">
                            {{ formatPreferenceType(pref.notificationType) }}
                          </div>
                          <div class="text-sm text-gray-500">
                            Configure notification delivery for {{ pref.notificationType.toLowerCase() }} events
                          </div>
                        </div>
                      </div>

                      <div class="flex flex-wrap gap-6 mt-4">
                        <mat-slide-toggle
                          [checked]="pref.inAppEnabled"
                          (change)="updatePreference(pref, 'inAppEnabled', $event.checked)"
                          color="primary">
                          In-App
                        </mat-slide-toggle>

                        <mat-slide-toggle
                          [checked]="pref.emailEnabled"
                          (change)="updatePreference(pref, 'emailEnabled', $event.checked)"
                          color="primary">
                          Email
                        </mat-slide-toggle>

                        <mat-slide-toggle
                          [checked]="pref.pushEnabled"
                          (change)="updatePreference(pref, 'pushEnabled', $event.checked)"
                          color="primary">
                          Push
                        </mat-slide-toggle>
                      </div>
                    </div>
                  }
                </div>
              </mat-card>
            }
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class NotificationCenterComponent implements OnInit {
  private readonly notificationsDataService = inject(NotificationsDataService);
  private readonly notification = inject(NotificationService);

  // Data
  notifications = signal<NotificationListItem[]>([]);
  summary = signal<NotificationSummary | null>(null);
  preferences = signal<NotificationPreference[]>([]);

  // State
  isLoading = signal(false);
  isLoadingPreferences = signal(false);
  isMarkingAll = signal(false);
  totalCount = signal(0);

  // Filters
  filterType = '';
  filterRead: boolean | null = null;
  filterPriority = '';

  // Pagination
  pageIndex = 0;
  pageSize = 10;

  // Constants
  notificationTypes = NOTIFICATION_TYPES;
  notificationPriorities = NOTIFICATION_PRIORITIES;

  ngOnInit(): void {
    this.loadSummary();
    this.loadNotifications();
    this.loadPreferences();
  }

  loadSummary(): void {
    this.notificationsDataService.getSummary().subscribe({
      next: (summary) => {
        this.summary.set(summary);
      },
      error: () => {
        // Silent fail for summary
      }
    });
  }

  loadNotifications(): void {
    this.isLoading.set(true);
    this.notificationsDataService.getNotifications(
      { pageNumber: this.pageIndex + 1, pageSize: this.pageSize },
      {
        type: this.filterType || undefined,
        isRead: this.filterRead ?? undefined,
        priority: this.filterPriority || undefined
      }
    ).subscribe({
      next: (response) => {
        this.notifications.set(response.data.items);
        this.totalCount.set(response.data.totalCount);
        this.isLoading.set(false);
      },
      error: () => {
        this.notification.showError('Failed to load notifications');
        this.isLoading.set(false);
      }
    });
  }

  loadPreferences(): void {
    this.isLoadingPreferences.set(true);
    this.notificationsDataService.getPreferences().subscribe({
      next: (prefs) => {
        this.preferences.set(prefs);
        this.isLoadingPreferences.set(false);
      },
      error: () => {
        this.notification.showError('Failed to load preferences');
        this.isLoadingPreferences.set(false);
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadNotifications();
  }

  handleNotificationClick(notif: NotificationListItem): void {
    if (!notif.isRead) {
      this.markAsRead(notif);
    }
    if (notif.actionUrl) {
      window.location.href = notif.actionUrl;
    }
  }

  markAsRead(notif: NotificationListItem, event?: Event): void {
    event?.stopPropagation();
    this.notificationsDataService.markAsRead(notif.id).subscribe({
      next: () => {
        // Update local state
        const updated = this.notifications().map(n =>
          n.id === notif.id ? { ...n, isRead: true } : n
        );
        this.notifications.set(updated);
        this.loadSummary();
      },
      error: () => {
        this.notification.showError('Failed to mark as read');
      }
    });
  }

  markAllAsRead(): void {
    this.isMarkingAll.set(true);
    this.notificationsDataService.markAllAsRead().subscribe({
      next: (count) => {
        this.notification.showSuccess(`${count} notifications marked as read`);
        this.loadNotifications();
        this.loadSummary();
        this.isMarkingAll.set(false);
      },
      error: () => {
        this.notification.showError('Failed to mark all as read');
        this.isMarkingAll.set(false);
      }
    });
  }

  deleteNotification(notif: NotificationListItem, event: Event): void {
    event.stopPropagation();
    this.notificationsDataService.deleteNotification(notif.id).subscribe({
      next: () => {
        this.notification.showSuccess('Notification deleted');
        this.loadNotifications();
        this.loadSummary();
      },
      error: () => {
        this.notification.showError('Failed to delete notification');
      }
    });
  }

  updatePreference(pref: NotificationPreference, field: string, value: boolean): void {
    const request = {
      notificationType: pref.notificationType,
      emailEnabled: field === 'emailEnabled' ? value : pref.emailEnabled,
      pushEnabled: field === 'pushEnabled' ? value : pref.pushEnabled,
      inAppEnabled: field === 'inAppEnabled' ? value : pref.inAppEnabled
    };

    this.notificationsDataService.updatePreference(request).subscribe({
      next: () => {
        // Update local state
        const updated = this.preferences().map(p =>
          p.id === pref.id ? { ...p, [field]: value } : p
        );
        this.preferences.set(updated);
        this.notification.showSuccess('Preference updated');
      },
      error: () => {
        this.notification.showError('Failed to update preference');
        this.loadPreferences(); // Reload to reset state
      }
    });
  }

  formatPreferenceType(type: string): string {
    return type.replace(/([A-Z])/g, ' $1').trim();
  }

  getNotificationIcon(notif: NotificationListItem): string {
    const icons: Record<string, string> = {
      'Academic': 'school',
      'Financial': 'payments',
      'Enrollment': 'assignment',
      'Grade': 'grade',
      'Schedule': 'event',
      'Document': 'description',
      'System': 'settings',
      'Reminder': 'alarm',
      'General': 'info'
    };
    return notif.icon || icons[notif.type] || 'notifications';
  }

  getNotificationIconClass(notif: NotificationListItem): string {
    const classes: Record<string, string> = {
      'Academic': 'bg-blue-100 text-blue-600',
      'Financial': 'bg-green-100 text-green-600',
      'Enrollment': 'bg-purple-100 text-purple-600',
      'Grade': 'bg-yellow-100 text-yellow-600',
      'Schedule': 'bg-orange-100 text-orange-600',
      'Document': 'bg-cyan-100 text-cyan-600',
      'System': 'bg-gray-100 text-gray-600',
      'Reminder': 'bg-red-100 text-red-600',
      'General': 'bg-indigo-100 text-indigo-600'
    };
    return classes[notif.type] || 'bg-gray-100 text-gray-600';
  }

  getPriorityClass(priority: string): string {
    const classes: Record<string, string> = {
      'Low': 'bg-gray-100 text-gray-800',
      'Normal': 'bg-blue-100 text-blue-800',
      'High': 'bg-orange-100 text-orange-800',
      'Urgent': 'bg-red-100 text-red-800'
    };
    return classes[priority] || 'bg-gray-100 text-gray-800';
  }

  getRelativeTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  }
}
