import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { SchedulingService } from '../services/scheduling.service';
import { NotificationService } from '../../../core/services/notification.service';
import {
  RoomBooking,
  RoomListItem,
  BuildingListItem,
  BOOKING_TYPES
} from '../../../models';

@Component({
  selector: 'app-scheduling-calendar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatChipsModule
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Room Scheduling</h1>
          <p class="text-gray-500 dark:text-gray-400">View and manage room bookings</p>
        </div>
        <div class="flex gap-2">
          <button mat-stroked-button routerLink="/scheduling/rooms">
            <mat-icon>meeting_room</mat-icon>
            Manage Rooms
          </button>
          <button mat-flat-button color="primary" (click)="showBookingForm = true">
            <mat-icon>add</mat-icon>
            New Booking
          </button>
        </div>
      </div>

      <!-- Filters -->
      <mat-card class="p-4">
        <div class="filter-row">
          <div class="filter-group">
            <label class="filter-label">Date</label>
            <div class="input-wrapper" [class.focused]="dateFocused()">
              <mat-icon class="input-icon">calendar_today</mat-icon>
              <input
                [matDatepicker]="picker"
                [(ngModel)]="selectedDate"
                (dateChange)="onDateChange()"
                (focus)="dateFocused.set(true)"
                (blur)="dateFocused.set(false)"
                placeholder="Select date"
              >
              <mat-datepicker-toggle [for]="picker" class="datepicker-toggle"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
            </div>
          </div>

          <div class="filter-group">
            <label class="filter-label">Building</label>
            <div class="select-wrapper" [class.focused]="buildingFocused()">
              <mat-icon class="input-icon">apartment</mat-icon>
              <mat-select
                [(ngModel)]="selectedBuildingId"
                (selectionChange)="loadBookings()"
                (openedChange)="buildingFocused.set($event)"
                placeholder="All Buildings"
              >
                <mat-option value="">All Buildings</mat-option>
                @for (building of buildings(); track building.id) {
                  <mat-option [value]="building.id">{{ building.name }}</mat-option>
                }
              </mat-select>
            </div>
          </div>

          <div class="filter-group">
            <label class="filter-label">Booking Type</label>
            <div class="select-wrapper" [class.focused]="typeFocused()">
              <mat-icon class="input-icon">event</mat-icon>
              <mat-select
                [(ngModel)]="selectedBookingType"
                (selectionChange)="loadBookings()"
                (openedChange)="typeFocused.set($event)"
                placeholder="All Types"
              >
                <mat-option value="">All Types</mat-option>
                @for (type of bookingTypes; track type) {
                  <mat-option [value]="type">{{ type }}</mat-option>
                }
              </mat-select>
            </div>
          </div>

          <button mat-icon-button (click)="loadBookings()" matTooltip="Refresh" class="refresh-btn">
            <mat-icon>refresh</mat-icon>
          </button>
        </div>
      </mat-card>

      <!-- New Booking Form -->
      @if (showBookingForm) {
        <mat-card class="p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Create New Booking</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <mat-form-field appearance="outline">
              <mat-label>Room</mat-label>
              <mat-select [(ngModel)]="newBooking.roomId" required>
                @for (room of rooms(); track room.id) {
                  <mat-option [value]="room.id">
                    {{ room.buildingCode }} - {{ room.roomNumber }} ({{ room.name }})
                  </mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Title</mat-label>
              <input matInput [(ngModel)]="newBooking.title" required>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Booking Type</mat-label>
              <mat-select [(ngModel)]="newBooking.bookingType" required>
                @for (type of bookingTypes; track type) {
                  <mat-option [value]="type">{{ type }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Date</mat-label>
              <input matInput [matDatepicker]="bookingPicker" [(ngModel)]="newBooking.date" required>
              <mat-datepicker-toggle matIconSuffix [for]="bookingPicker"></mat-datepicker-toggle>
              <mat-datepicker #bookingPicker></mat-datepicker>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Start Time</mat-label>
              <input matInput type="time" [(ngModel)]="newBooking.startTime" required>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>End Time</mat-label>
              <input matInput type="time" [(ngModel)]="newBooking.endTime" required>
            </mat-form-field>

            <mat-form-field appearance="outline" class="md:col-span-3">
              <mat-label>Description (Optional)</mat-label>
              <textarea matInput [(ngModel)]="newBooking.description" rows="2"></textarea>
            </mat-form-field>
          </div>

          <div class="flex justify-end gap-2 mt-4">
            <button mat-stroked-button (click)="cancelBookingForm()">Cancel</button>
            <button mat-flat-button color="primary" (click)="submitBooking()" [disabled]="isSubmitting()">
              @if (isSubmitting()) {
                <mat-spinner diameter="20" class="inline-block mr-2"></mat-spinner>
              }
              <mat-icon>event_available</mat-icon>
              Book Room
            </button>
          </div>
        </mat-card>
      }

      <!-- Bookings List -->
      @if (isLoading()) {
        <div class="flex items-center justify-center p-12">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else if (bookings().length === 0) {
        <mat-card class="p-12">
          <div class="text-center">
            <mat-icon class="text-5xl text-gray-400 mb-4">event_busy</mat-icon>
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Bookings Found</h3>
            <p class="text-gray-500">No room bookings match your filters.</p>
          </div>
        </mat-card>
      } @else {
        <mat-card class="overflow-hidden">
          <div class="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Bookings ({{ bookings().length }})
            </h3>
          </div>

          <div class="overflow-x-auto">
            <table mat-table [dataSource]="bookings()" class="w-full">
              <ng-container matColumnDef="time">
                <th mat-header-cell *matHeaderCellDef class="font-semibold">Time</th>
                <td mat-cell *matCellDef="let row">
                  <div class="font-medium">{{ formatTime(row.startTime) }} - {{ formatTime(row.endTime) }}</div>
                  <div class="text-sm text-gray-500">{{ row.date }}</div>
                </td>
              </ng-container>

              <ng-container matColumnDef="room">
                <th mat-header-cell *matHeaderCellDef class="font-semibold">Room</th>
                <td mat-cell *matCellDef="let row">
                  <div class="font-medium">{{ row.roomName }}</div>
                  <div class="text-sm text-gray-500">{{ row.buildingName }}</div>
                </td>
              </ng-container>

              <ng-container matColumnDef="title">
                <th mat-header-cell *matHeaderCellDef class="font-semibold">Title</th>
                <td mat-cell *matCellDef="let row">
                  <div>{{ row.title }}</div>
                  @if (row.courseCode) {
                    <div class="text-sm text-gray-500 font-mono">{{ row.courseCode }}</div>
                  }
                </td>
              </ng-container>

              <ng-container matColumnDef="type">
                <th mat-header-cell *matHeaderCellDef class="font-semibold">Type</th>
                <td mat-cell *matCellDef="let row">
                  <span class="px-2 py-0.5 rounded-full text-xs font-medium"
                        [class]="getBookingTypeClass(row.bookingType)">
                    {{ row.bookingType }}
                  </span>
                </td>
              </ng-container>

              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef class="font-semibold">Status</th>
                <td mat-cell *matCellDef="let row">
                  <span class="px-2 py-0.5 rounded-full text-xs font-medium"
                        [class]="getStatusClass(row.status)">
                    {{ row.status }}
                  </span>
                  @if (row.isRecurring) {
                    <mat-icon class="text-sm text-gray-500 ml-1" matTooltip="Recurring booking">repeat</mat-icon>
                  }
                </td>
              </ng-container>

              <ng-container matColumnDef="bookedBy">
                <th mat-header-cell *matHeaderCellDef class="font-semibold">Booked By</th>
                <td mat-cell *matCellDef="let row">
                  {{ row.bookedByName || 'System' }}
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef class="font-semibold">Actions</th>
                <td mat-cell *matCellDef="let row">
                  @if (row.status !== 'Cancelled') {
                    <button mat-icon-button color="warn" (click)="confirmCancelBooking(row)"
                            matTooltip="Cancel booking">
                      <mat-icon>cancel</mat-icon>
                    </button>
                  }
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          </div>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    /* Filter Row Styles */
    .filter-row {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      align-items: flex-end;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
      min-width: 160px;
    }

    .filter-label {
      font-size: 13px;
      font-weight: 500;
      color: #374151;
    }

    .input-wrapper, .select-wrapper {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 0 12px;
      height: 44px;
      background: #f9fafb;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      transition: all 0.2s ease;
    }

    .input-wrapper:hover, .select-wrapper:hover {
      border-color: #9ca3af;
    }

    .input-wrapper.focused, .select-wrapper.focused {
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
      background: white;
    }

    .input-icon {
      color: #9ca3af;
      font-size: 20px;
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    }

    .input-wrapper.focused .input-icon,
    .select-wrapper.focused .input-icon {
      color: #6366f1;
    }

    .input-wrapper input {
      flex: 1;
      border: none;
      background: transparent;
      font-size: 14px;
      color: #111827;
      outline: none;
      padding: 0;
      height: 100%;
      min-width: 100px;
    }

    .input-wrapper input::placeholder {
      color: #9ca3af;
    }

    .select-wrapper mat-select {
      flex: 1;
      font-size: 14px;
    }

    .select-wrapper ::ng-deep .mat-mdc-select-trigger {
      height: 100%;
    }

    .select-wrapper ::ng-deep .mat-mdc-select-value {
      color: #111827;
    }

    .select-wrapper ::ng-deep .mat-mdc-select-placeholder {
      color: #9ca3af;
    }

    .select-wrapper ::ng-deep .mat-mdc-select-arrow-wrapper {
      display: flex;
      align-items: center;
    }

    .datepicker-toggle {
      margin-right: -8px;
    }

    .datepicker-toggle ::ng-deep button {
      width: 32px;
      height: 32px;
    }

    .refresh-btn {
      margin-bottom: 2px;
    }

    /* Dark Mode */
    @media (prefers-color-scheme: dark) {
      .filter-label {
        color: #d1d5db;
      }

      .input-wrapper, .select-wrapper {
        background: #374151;
        border-color: #4b5563;
      }

      .input-wrapper.focused, .select-wrapper.focused {
        background: #1f2937;
      }

      .input-wrapper input {
        color: #f3f4f6;
      }

      .select-wrapper ::ng-deep .mat-mdc-select-value {
        color: #f3f4f6;
      }
    }
  `]
})
export class SchedulingCalendarComponent implements OnInit {
  private readonly schedulingService = inject(SchedulingService);
  private readonly notificationService = inject(NotificationService);

  buildings = signal<BuildingListItem[]>([]);
  rooms = signal<RoomListItem[]>([]);
  bookings = signal<RoomBooking[]>([]);

  isLoading = signal(false);
  isSubmitting = signal(false);

  // Focus states for custom inputs
  dateFocused = signal(false);
  buildingFocused = signal(false);
  typeFocused = signal(false);

  selectedDate: Date = new Date();
  selectedBuildingId: string = '';
  selectedBookingType: string = '';

  showBookingForm = false;
  bookingTypes = BOOKING_TYPES;

  displayedColumns = ['time', 'room', 'title', 'type', 'status', 'bookedBy', 'actions'];

  newBooking = {
    roomId: '',
    title: '',
    description: '',
    bookingType: 'Class',
    date: new Date(),
    startTime: '09:00',
    endTime: '10:00'
  };

  ngOnInit(): void {
    this.loadBuildings();
    this.loadRooms();
    this.loadBookings();
  }

  loadBuildings(): void {
    this.schedulingService.getBuildings({ pageNumber: 1, pageSize: 100 }).subscribe({
      next: (response) => {
        this.buildings.set(response.data.items);
      },
      error: () => {
        this.notificationService.showError('Failed to load buildings');
      }
    });
  }

  loadRooms(): void {
    this.schedulingService.getRooms({ pageNumber: 1, pageSize: 500 }, { isActive: true }).subscribe({
      next: (response) => {
        this.rooms.set(response.data.items);
      },
      error: () => {
        this.notificationService.showError('Failed to load rooms');
      }
    });
  }

  loadBookings(): void {
    this.isLoading.set(true);

    const dateStr = this.formatDateForApi(this.selectedDate);

    this.schedulingService.getBookings(
      { pageNumber: 1, pageSize: 100, sortBy: 'StartTime' },
      {
        date: dateStr,
        buildingId: this.selectedBuildingId || undefined,
        bookingType: this.selectedBookingType || undefined
      }
    ).subscribe({
      next: (response) => {
        this.bookings.set(response.data.items);
        this.isLoading.set(false);
      },
      error: () => {
        this.notificationService.showError('Failed to load bookings');
        this.isLoading.set(false);
      }
    });
  }

  onDateChange(): void {
    this.loadBookings();
  }

  cancelBookingForm(): void {
    this.showBookingForm = false;
    this.resetBookingForm();
  }

  resetBookingForm(): void {
    this.newBooking = {
      roomId: '',
      title: '',
      description: '',
      bookingType: 'Class',
      date: new Date(),
      startTime: '09:00',
      endTime: '10:00'
    };
  }

  submitBooking(): void {
    if (!this.newBooking.roomId || !this.newBooking.title || !this.newBooking.date) {
      this.notificationService.showError('Please fill in all required fields');
      return;
    }

    this.isSubmitting.set(true);

    this.schedulingService.bookRoom({
      roomId: this.newBooking.roomId,
      title: this.newBooking.title,
      description: this.newBooking.description || undefined,
      bookingType: this.newBooking.bookingType,
      date: this.formatDateForApi(this.newBooking.date),
      startTime: this.newBooking.startTime,
      endTime: this.newBooking.endTime,
      isRecurring: false
    }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.showBookingForm = false;
        this.resetBookingForm();
        this.notificationService.showSuccess('Room booked successfully');
        this.loadBookings();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.notificationService.showError(err.error?.message || 'Failed to book room');
      }
    });
  }

  confirmCancelBooking(booking: RoomBooking): void {
    const reason = prompt(`Enter reason for cancelling "${booking.title}":`);
    if (reason !== null) {
      this.schedulingService.cancelBooking(booking.id, reason || undefined).subscribe({
        next: () => {
          this.notificationService.showSuccess('Booking cancelled successfully');
          this.loadBookings();
        },
        error: (err) => {
          this.notificationService.showError(err.error?.message || 'Failed to cancel booking');
        }
      });
    }
  }

  formatDateForApi(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  formatTime(time: string): string {
    // Convert HH:mm:ss to HH:mm AM/PM format
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  }

  getBookingTypeClass(type: string): string {
    switch (type) {
      case 'Class':
        return 'bg-blue-100 text-blue-800';
      case 'Exam':
        return 'bg-red-100 text-red-800';
      case 'Meeting':
        return 'bg-purple-100 text-purple-800';
      case 'Event':
        return 'bg-green-100 text-green-800';
      case 'Maintenance':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Confirmed':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
}
