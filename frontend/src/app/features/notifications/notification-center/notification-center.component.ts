import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatCheckboxModule } from '@angular/material/checkbox';
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
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatBadgeModule,
    MatTooltipModule,
    MatSlideToggleModule,
    MatPaginatorModule,
    MatCheckboxModule
  ],
  template: `
    <div class="notifications-layout">
      <!-- Collapsible Filter Sidebar -->
      <aside class="filter-sidebar" [class.collapsed]="sidebarCollapsed()">
        <div class="sidebar-header">
          <h2 class="sidebar-title" *ngIf="!sidebarCollapsed()">
            <mat-icon>filter_list</mat-icon>
            Filters
          </h2>
          <button mat-icon-button (click)="toggleSidebar()" class="collapse-btn">
            <mat-icon>{{ sidebarCollapsed() ? 'chevron_right' : 'chevron_left' }}</mat-icon>
          </button>
        </div>

        <div class="sidebar-content" *ngIf="!sidebarCollapsed()">
          <!-- Summary Stats -->
          @if (summary()) {
            <div class="stats-section">
              <div class="stat-item">
                <div class="stat-icon total">
                  <mat-icon>notifications</mat-icon>
                </div>
                <div class="stat-info">
                  <span class="stat-value">{{ summary()!.totalCount }}</span>
                  <span class="stat-label">Total</span>
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-icon unread">
                  <mat-icon>mark_email_unread</mat-icon>
                </div>
                <div class="stat-info">
                  <span class="stat-value">{{ summary()!.unreadCount }}</span>
                  <span class="stat-label">Unread</span>
                </div>
              </div>
            </div>
          }

          <!-- Type Filter -->
          <div class="filter-section">
            <label class="filter-label">Notification Type</label>
            <mat-form-field appearance="outline" class="filter-field">
              <mat-select [(ngModel)]="filterType" (selectionChange)="loadNotifications()">
                <mat-option value="">All Types</mat-option>
                @for (type of notificationTypes; track type) {
                  <mat-option [value]="type">
                    <mat-icon class="type-icon">{{ getTypeIcon(type) }}</mat-icon>
                    {{ type }}
                  </mat-option>
                }
              </mat-select>
            </mat-form-field>
          </div>

          <!-- Status Filter -->
          <div class="filter-section">
            <label class="filter-label">Read Status</label>
            <mat-form-field appearance="outline" class="filter-field">
              <mat-select [(ngModel)]="filterRead" (selectionChange)="loadNotifications()">
                <mat-option [value]="null">All Status</mat-option>
                <mat-option [value]="false">
                  <span class="status-option unread"></span>
                  Unread
                </mat-option>
                <mat-option [value]="true">
                  <span class="status-option read"></span>
                  Read
                </mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <!-- Priority Filter -->
          <div class="filter-section">
            <label class="filter-label">Priority</label>
            <mat-form-field appearance="outline" class="filter-field">
              <mat-select [(ngModel)]="filterPriority" (selectionChange)="loadNotifications()">
                <mat-option value="">All Priorities</mat-option>
                @for (priority of notificationPriorities; track priority) {
                  <mat-option [value]="priority">
                    <span class="priority-dot" [class]="priority.toLowerCase()"></span>
                    {{ priority }}
                  </mat-option>
                }
              </mat-select>
            </mat-form-field>
          </div>

          <!-- Quick Actions -->
          <div class="filter-section">
            <label class="filter-label">Quick Actions</label>
            @if (summary() && summary()!.unreadCount > 0) {
              <button mat-stroked-button class="quick-action-btn" (click)="markAllAsRead()"
                      [disabled]="isMarkingAll()">
                @if (isMarkingAll()) {
                  <mat-spinner diameter="16"></mat-spinner>
                } @else {
                  <mat-icon>done_all</mat-icon>
                }
                Mark All Read
              </button>
            }
            <button mat-stroked-button class="quick-action-btn" (click)="loadNotifications()">
              <mat-icon>refresh</mat-icon>
              Refresh
            </button>
          </div>

          <!-- Clear Filters -->
          @if (hasActiveFilters()) {
            <button mat-stroked-button class="clear-filters-btn" (click)="clearFilters()">
              <mat-icon>clear_all</mat-icon>
              Clear Filters
            </button>
          }
        </div>
      </aside>

      <!-- Main Content Area -->
      <main class="main-content">
        <!-- Page Header -->
        <div class="page-header">
          <div class="header-info">
            <h1 class="page-title">Notification Center</h1>
            <p class="page-subtitle">Manage your notifications and preferences</p>
          </div>
          <div class="header-actions">
            <button mat-stroked-button (click)="showPreferences = !showPreferences">
              <mat-icon>settings</mat-icon>
              Preferences
            </button>
          </div>
        </div>

        <!-- Active Filters Display -->
        @if (hasActiveFilters()) {
          <div class="active-filters">
            <span class="active-filters-label">Active Filters:</span>
            @if (filterType) {
              <span class="filter-chip">
                Type: {{ filterType }}
                <button mat-icon-button (click)="filterType = ''; loadNotifications()">
                  <mat-icon>close</mat-icon>
                </button>
              </span>
            }
            @if (filterRead !== null) {
              <span class="filter-chip">
                {{ filterRead ? 'Read' : 'Unread' }}
                <button mat-icon-button (click)="filterRead = null; loadNotifications()">
                  <mat-icon>close</mat-icon>
                </button>
              </span>
            }
            @if (filterPriority) {
              <span class="filter-chip">
                Priority: {{ filterPriority }}
                <button mat-icon-button (click)="filterPriority = ''; loadNotifications()">
                  <mat-icon>close</mat-icon>
                </button>
              </span>
            }
          </div>
        }

        <!-- Preferences Panel -->
        @if (showPreferences) {
          <div class="preferences-panel">
            <div class="panel-header">
              <h3>
                <mat-icon>tune</mat-icon>
                Notification Preferences
              </h3>
              <button mat-icon-button (click)="showPreferences = false">
                <mat-icon>close</mat-icon>
              </button>
            </div>
            @if (isLoadingPreferences()) {
              <div class="loading-state small">
                <mat-spinner diameter="32"></mat-spinner>
              </div>
            } @else if (preferences().length === 0) {
              <div class="empty-prefs">
                <p>No preferences available</p>
              </div>
            } @else {
              <div class="preferences-grid">
                @for (pref of preferences(); track pref.id) {
                  <div class="pref-card">
                    <div class="pref-header">
                      <mat-icon>{{ getPreferenceIcon(pref.notificationType) }}</mat-icon>
                      <span class="pref-title">{{ formatPreferenceType(pref.notificationType) }}</span>
                    </div>
                    <div class="pref-toggles">
                      <div class="toggle-item">
                        <span>In-App</span>
                        <mat-slide-toggle
                          [checked]="pref.inAppEnabled"
                          (change)="updatePreference(pref, 'inAppEnabled', $event.checked)"
                          color="primary">
                        </mat-slide-toggle>
                      </div>
                      <div class="toggle-item">
                        <span>Email</span>
                        <mat-slide-toggle
                          [checked]="pref.emailEnabled"
                          (change)="updatePreference(pref, 'emailEnabled', $event.checked)"
                          color="primary">
                        </mat-slide-toggle>
                      </div>
                      <div class="toggle-item">
                        <span>Push</span>
                        <mat-slide-toggle
                          [checked]="pref.pushEnabled"
                          (change)="updatePreference(pref, 'pushEnabled', $event.checked)"
                          color="primary">
                        </mat-slide-toggle>
                      </div>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        }

        <!-- Notifications List -->
        @if (isLoading()) {
          <div class="loading-state">
            <mat-spinner diameter="48"></mat-spinner>
            <span>Loading notifications...</span>
          </div>
        } @else if (notifications().length === 0) {
          <div class="empty-state-card">
            <div class="empty-state-content">
              <div class="empty-icon">
                <mat-icon>notifications_off</mat-icon>
              </div>
              <h3>No Notifications</h3>
              <p>You're all caught up! No notifications match your filters.</p>
            </div>
          </div>
        } @else {
          <div class="notifications-card">
            <div class="notifications-header">
              <div class="notifications-title">
                <mat-icon>inbox</mat-icon>
                <span>Notifications</span>
                <span class="count-badge">{{ totalCount() }}</span>
              </div>
            </div>

            <div class="notifications-list">
              @for (notification of notifications(); track notification.id) {
                <div class="notification-item" [class.unread]="!notification.isRead"
                     (click)="handleNotificationClick(notification)">
                  <div class="notification-icon" [class]="getNotificationIconClass(notification)">
                    <mat-icon>{{ getNotificationIcon(notification) }}</mat-icon>
                  </div>
                  <div class="notification-content">
                    <div class="notification-header">
                      <span class="notification-title">{{ notification.title }}</span>
                      @if (!notification.isRead) {
                        <span class="unread-dot"></span>
                      }
                      <span class="priority-badge" [class]="notification.priority.toLowerCase()">
                        {{ notification.priority }}
                      </span>
                    </div>
                    <p class="notification-message">{{ notification.message }}</p>
                    <div class="notification-meta">
                      <span class="notification-type">
                        <mat-icon>{{ getNotificationIcon(notification) }}</mat-icon>
                        {{ notification.type }}
                      </span>
                      <span class="notification-time">{{ getRelativeTime(notification.createdAt) }}</span>
                    </div>
                  </div>
                  <div class="notification-actions">
                    @if (!notification.isRead) {
                      <button mat-icon-button (click)="markAsRead(notification, $event)"
                              matTooltip="Mark as Read" class="action-read">
                        <mat-icon>check</mat-icon>
                      </button>
                    }
                    <button mat-icon-button (click)="deleteNotification(notification, $event)"
                            matTooltip="Delete" class="action-delete">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                </div>
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
          </div>
        }
      </main>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .notifications-layout {
      display: flex;
      gap: 24px;
      min-height: calc(100vh - 200px);
    }

    /* ===== FILTER SIDEBAR ===== */
    .filter-sidebar {
      width: 280px;
      flex-shrink: 0;
      background: white;
      border-radius: 16px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.05);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transition: width 0.3s ease;
    }

    .filter-sidebar.collapsed {
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

    .sidebar-content {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    /* Stats Section */
    .stats-section {
      display: flex;
      gap: 12px;
    }

    .stat-item {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px;
      background: #f8fafc;
      border-radius: 10px;
    }

    .stat-icon {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-icon mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: white;
    }

    .stat-icon.total { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); }
    .stat-icon.unread { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); }

    .stat-info {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-size: 18px;
      font-weight: 700;
      color: #111827;
    }

    .stat-label {
      font-size: 11px;
      color: #6b7280;
    }

    .filter-section {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .filter-label {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #6b7280;
    }

    .filter-field {
      width: 100%;
    }

    .filter-field ::ng-deep .mat-mdc-form-field-subscript-wrapper {
      display: none;
    }

    .type-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      margin-right: 8px;
    }

    .status-option {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-right: 8px;
    }

    .status-option.unread { background: #3b82f6; }
    .status-option.read { background: #9ca3af; }

    .priority-dot {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-right: 8px;
    }

    .priority-dot.low { background: #9ca3af; }
    .priority-dot.normal { background: #3b82f6; }
    .priority-dot.high { background: #f59e0b; }
    .priority-dot.urgent { background: #ef4444; }

    .quick-action-btn {
      width: 100%;
      justify-content: flex-start;
      margin-bottom: 8px;
    }

    .clear-filters-btn {
      width: 100%;
    }

    /* ===== MAIN CONTENT ===== */
    .main-content {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
    }

    .page-title {
      font-size: 24px;
      font-weight: 700;
      color: #111827;
      margin: 0;
    }

    .page-subtitle {
      font-size: 14px;
      color: #6b7280;
      margin: 4px 0 0 0;
    }

    /* Active Filters */
    .active-filters {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .active-filters-label {
      font-size: 13px;
      color: #6b7280;
    }

    .filter-chip {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px 4px 12px;
      background: #dbeafe;
      color: #1d4ed8;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
    }

    .filter-chip button {
      width: 18px;
      height: 18px;
      line-height: 18px;
    }

    .filter-chip mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }

    /* Preferences Panel */
    .preferences-panel {
      background: white;
      border-radius: 16px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.05);
      overflow: hidden;
    }

    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      background: #f8fafc;
      border-bottom: 1px solid #e5e7eb;
    }

    .panel-header h3 {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
      font-weight: 600;
      color: #111827;
      margin: 0;
    }

    .preferences-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 16px;
      padding: 20px;
    }

    .pref-card {
      background: #f8fafc;
      border-radius: 12px;
      padding: 16px;
    }

    .pref-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 12px;
    }

    .pref-header mat-icon {
      color: #6366f1;
    }

    .pref-title {
      font-size: 14px;
      font-weight: 600;
      color: #111827;
    }

    .pref-toggles {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .toggle-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
      color: #6b7280;
    }

    .empty-prefs {
      padding: 32px;
      text-align: center;
      color: #9ca3af;
    }

    /* Loading/Empty States */
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
      padding: 64px;
      color: #6b7280;
    }

    .loading-state.small {
      padding: 32px;
    }

    .empty-state-card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
      padding: 64px 32px;
    }

    .empty-state-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .empty-icon {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: #f3f4f6;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 20px;
    }

    .empty-icon mat-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      color: #9ca3af;
    }

    .empty-state-content h3 {
      font-size: 18px;
      font-weight: 600;
      color: #111827;
      margin: 0 0 8px 0;
    }

    .empty-state-content p {
      font-size: 14px;
      color: #6b7280;
      margin: 0;
    }

    /* Notifications Card */
    .notifications-card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.05);
      overflow: hidden;
    }

    .notifications-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid #e5e7eb;
    }

    .notifications-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
      font-weight: 600;
      color: #111827;
    }

    .notifications-title mat-icon {
      color: #6b7280;
    }

    .count-badge {
      background: #e5e7eb;
      color: #374151;
      padding: 2px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }

    /* Notification Items */
    .notifications-list {
      display: flex;
      flex-direction: column;
    }

    .notification-item {
      display: flex;
      gap: 16px;
      padding: 16px 20px;
      border-bottom: 1px solid #f3f4f6;
      cursor: pointer;
      transition: background 0.2s ease;
    }

    .notification-item:hover {
      background: #f9fafb;
    }

    .notification-item:last-child {
      border-bottom: none;
    }

    .notification-item.unread {
      background: #eff6ff;
      border-left: 3px solid #3b82f6;
    }

    .notification-item.unread:hover {
      background: #dbeafe;
    }

    .notification-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .notification-icon mat-icon {
      font-size: 22px;
      width: 22px;
      height: 22px;
      color: white;
    }

    .notification-icon.academic { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); }
    .notification-icon.financial { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }
    .notification-icon.enrollment { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); }
    .notification-icon.grade { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }
    .notification-icon.schedule { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); }
    .notification-icon.document { background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); }
    .notification-icon.system { background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); }
    .notification-icon.reminder { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); }
    .notification-icon.general { background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); }

    .notification-content {
      flex: 1;
      min-width: 0;
    }

    .notification-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
    }

    .notification-title {
      font-size: 14px;
      font-weight: 600;
      color: #111827;
    }

    .unread-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #3b82f6;
    }

    .priority-badge {
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 500;
      margin-left: auto;
    }

    .priority-badge.low { background: #f3f4f6; color: #6b7280; }
    .priority-badge.normal { background: #dbeafe; color: #1d4ed8; }
    .priority-badge.high { background: #fef3c7; color: #d97706; }
    .priority-badge.urgent { background: #fee2e2; color: #dc2626; }

    .notification-message {
      font-size: 13px;
      color: #6b7280;
      margin: 0 0 8px 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .notification-meta {
      display: flex;
      align-items: center;
      gap: 16px;
      font-size: 12px;
      color: #9ca3af;
    }

    .notification-type {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .notification-type mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }

    .notification-actions {
      display: flex;
      gap: 4px;
      align-items: flex-start;
    }

    .action-read {
      color: #3b82f6;
    }

    .action-delete {
      color: #ef4444;
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .filter-sidebar {
        position: fixed;
        left: 0;
        top: 64px;
        bottom: 0;
        z-index: 100;
        border-radius: 0;
      }

      .filter-sidebar.collapsed {
        width: 0;
        padding: 0;
      }

      .main-content {
        width: 100%;
      }

      .preferences-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        align-items: stretch;
      }

      .notification-item {
        flex-wrap: wrap;
      }

      .notification-actions {
        width: 100%;
        justify-content: flex-end;
        margin-top: 8px;
      }
    }

    /* Dark Mode */
    @media (prefers-color-scheme: dark) {
      .filter-sidebar, .notifications-card, .preferences-panel, .empty-state-card {
        background: #1f2937;
      }

      .sidebar-header, .panel-header {
        background: #111827;
        border-color: #374151;
      }

      .sidebar-title, .filter-label, .page-title, .notifications-title,
      .notification-title, .pref-title, .stat-value {
        color: #f3f4f6;
      }

      .stat-item, .pref-card {
        background: #374151;
      }

      .notification-item {
        border-color: #374151;
      }

      .notification-item:hover {
        background: #374151;
      }

      .notification-item.unread {
        background: #1e3a5f;
      }

      .notification-item.unread:hover {
        background: #264a6e;
      }

      .notifications-header {
        border-color: #374151;
      }
    }
  `]
})
export class NotificationCenterComponent implements OnInit {
  private readonly notificationsDataService = inject(NotificationsDataService);
  private readonly notification = inject(NotificationService);

  // UI State
  sidebarCollapsed = signal(false);
  showPreferences = false;

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

  toggleSidebar(): void {
    this.sidebarCollapsed.update(v => !v);
  }

  loadSummary(): void {
    this.notificationsDataService.getSummary().subscribe({
      next: (summary) => {
        this.summary.set(summary);
      },
      error: () => {}
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
        this.isLoadingPreferences.set(false);
      }
    });
  }

  hasActiveFilters(): boolean {
    return !!this.filterType || this.filterRead !== null || !!this.filterPriority;
  }

  clearFilters(): void {
    this.filterType = '';
    this.filterRead = null;
    this.filterPriority = '';
    this.loadNotifications();
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
        const updated = this.preferences().map(p =>
          p.id === pref.id ? { ...p, [field]: value } : p
        );
        this.preferences.set(updated);
        this.notification.showSuccess('Preference updated');
      },
      error: () => {
        this.notification.showError('Failed to update preference');
        this.loadPreferences();
      }
    });
  }

  formatPreferenceType(type: string): string {
    return type.replace(/([A-Z])/g, ' $1').trim();
  }

  getPreferenceIcon(type: string): string {
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
    return icons[type] || 'notifications';
  }

  getTypeIcon(type: string): string {
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
    return icons[type] || 'notifications';
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
    return notif.type.toLowerCase();
  }

  getRelativeTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }
}
