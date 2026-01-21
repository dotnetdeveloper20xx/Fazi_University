// Notification DTO matching backend NotificationDto
export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
  icon?: string;
  isRead: boolean;
  readAt?: string;
  priority: string;
  createdAt: string;
  expiresAt?: string;
  entityType?: string;
  entityId?: string;
}

// Notification List DTO matching backend NotificationListDto
export interface NotificationListItem {
  id: string;
  type: string;
  title: string;
  message: string;
  actionUrl?: string;
  icon?: string;
  isRead: boolean;
  priority: string;
  createdAt: string;
}

// Notification Summary DTO matching backend NotificationSummaryDto
export interface NotificationSummary {
  totalCount: number;
  unreadCount: number;
  recentNotifications: NotificationListItem[];
}

// Notification Preference DTO matching backend NotificationPreferenceDto
export interface NotificationPreference {
  id: string;
  notificationType: string;
  emailEnabled: boolean;
  pushEnabled: boolean;
  inAppEnabled: boolean;
}

// Send Notification Request matching backend SendNotificationCommand
export interface SendNotificationRequest {
  userId: string;
  type?: string;
  title: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
  icon?: string;
  priority?: string;
  expiresAt?: string;
  entityType?: string;
  entityId?: string;
  sendEmail?: boolean;
}

// Update Notification Preference Request
export interface UpdateNotificationPreferenceRequest {
  notificationType: string;
  emailEnabled: boolean;
  pushEnabled: boolean;
  inAppEnabled: boolean;
}

// Notification filter for querying
export interface NotificationFilter {
  type?: string;
  isRead?: boolean;
  priority?: string;
}

// Notification types
export const NOTIFICATION_TYPES = [
  'General',
  'Academic',
  'Financial',
  'Enrollment',
  'Grade',
  'Schedule',
  'Document',
  'System',
  'Reminder'
];

// Notification priorities
export const NOTIFICATION_PRIORITIES = [
  'Low',
  'Normal',
  'High',
  'Urgent'
];
