import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import {
  ApiResponse,
  PagedResponse,
  PaginationParams,
  NotificationListItem,
  NotificationSummary,
  NotificationPreference,
  SendNotificationRequest,
  UpdateNotificationPreferenceRequest,
  NotificationFilter
} from '../../../models';

@Injectable({
  providedIn: 'root'
})
export class NotificationsDataService {
  private readonly api = inject(ApiService);
  private readonly endpoint = 'notifications';

  /**
   * Get notifications for the current user with pagination and filtering
   */
  getNotifications(
    pagination: PaginationParams = {},
    filter: NotificationFilter = {}
  ): Observable<ApiResponse<PagedResponse<NotificationListItem>>> {
    const params: Record<string, any> = {
      pageNumber: pagination.pageNumber ?? 1,
      pageSize: pagination.pageSize ?? 10,
      sortBy: pagination.sortBy ?? 'CreatedAt',
      sortDescending: pagination.sortDirection === 'desc' ? true : true // Default descending for notifications
    };

    if (pagination.searchTerm) params['searchTerm'] = pagination.searchTerm;
    if (filter.type) params['type'] = filter.type;
    if (filter.isRead !== undefined) params['isRead'] = filter.isRead;
    if (filter.priority) params['priority'] = filter.priority;

    return this.api.get<ApiResponse<PagedResponse<NotificationListItem>>>(
      this.endpoint,
      params
    );
  }

  /**
   * Get notification summary (counts and recent notifications)
   */
  getSummary(recentCount: number = 5): Observable<NotificationSummary> {
    return this.api.get<ApiResponse<NotificationSummary>>(
      `${this.endpoint}/summary`,
      { recentCount }
    ).pipe(map(response => response.data));
  }

  /**
   * Send a notification (admin only)
   */
  sendNotification(request: SendNotificationRequest): Observable<string> {
    return this.api.post<ApiResponse<string>>(
      this.endpoint,
      request
    ).pipe(map(response => response.data));
  }

  /**
   * Mark a notification as read
   */
  markAsRead(notificationId: string): Observable<void> {
    return this.api.put<ApiResponse<string>>(
      `${this.endpoint}/${notificationId}/read`,
      {}
    ).pipe(map(() => void 0));
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): Observable<number> {
    return this.api.put<ApiResponse<number>>(
      `${this.endpoint}/read-all`,
      {}
    ).pipe(map(response => response.data));
  }

  /**
   * Delete a notification
   */
  deleteNotification(notificationId: string): Observable<void> {
    return this.api.delete<ApiResponse<string>>(
      `${this.endpoint}/${notificationId}`
    ).pipe(map(() => void 0));
  }

  /**
   * Get notification preferences
   */
  getPreferences(): Observable<NotificationPreference[]> {
    return this.api.get<ApiResponse<NotificationPreference[]>>(
      `${this.endpoint}/preferences`
    ).pipe(map(response => response.data));
  }

  /**
   * Update notification preferences
   */
  updatePreference(request: UpdateNotificationPreferenceRequest): Observable<void> {
    return this.api.put<ApiResponse<string>>(
      `${this.endpoint}/preferences`,
      request
    ).pipe(map(() => void 0));
  }
}
