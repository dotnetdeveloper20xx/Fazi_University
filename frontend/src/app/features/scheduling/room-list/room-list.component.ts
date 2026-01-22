import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { SchedulingService } from '../services/scheduling.service';
import { NotificationService } from '../../../core/services/notification.service';
import {
  BuildingListItem,
  RoomListItem,
  CreateBuildingRequest,
  CreateRoomRequest,
  RoomAvailability,
  ROOM_TYPES
} from '../../../models';

@Component({
  selector: 'app-room-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatChipsModule,
    MatTabsModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  template: `
    <div class="room-list-container">
      <div class="main-layout">
        <!-- Left Sidebar: Filters -->
        <aside class="filter-sidebar" [class.collapsed]="sidebarCollapsed()">
          <div class="sidebar-header">
            <div class="sidebar-title" *ngIf="!sidebarCollapsed()">
              <mat-icon>filter_list</mat-icon>
              <span>Filters</span>
            </div>
            <button mat-icon-button (click)="toggleSidebar()" class="collapse-btn">
              <mat-icon>{{ sidebarCollapsed() ? 'chevron_right' : 'chevron_left' }}</mat-icon>
            </button>
          </div>

          <div class="sidebar-content" *ngIf="!sidebarCollapsed()">
            <!-- Search -->
            <div class="filter-section">
              <label class="filter-label">Search</label>
              <mat-form-field appearance="outline" class="w-full filter-field">
                <mat-icon matPrefix class="search-icon">search</mat-icon>
                <input
                  matInput
                  [value]="roomSearchTerm()"
                  (input)="onRoomSearch($event)"
                  placeholder="Room number..."
                >
              </mat-form-field>
            </div>

            <!-- Building Filter -->
            <div class="filter-section">
              <label class="filter-label">Building</label>
              <mat-form-field appearance="outline" class="w-full filter-field">
                <mat-select [value]="selectedBuildingId()" (selectionChange)="onBuildingFilter($event.value)">
                  <mat-option value="">All Buildings</mat-option>
                  @for (building of buildings(); track building.id) {
                    <mat-option [value]="building.id">{{ building.name }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
            </div>

            <!-- Room Type Filter -->
            <div class="filter-section">
              <label class="filter-label">Room Type</label>
              <mat-form-field appearance="outline" class="w-full filter-field">
                <mat-select [value]="selectedRoomType()" (selectionChange)="onTypeFilter($event.value)">
                  <mat-option value="">All Types</mat-option>
                  @for (type of roomTypes; track type) {
                    <mat-option [value]="type">{{ type }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
            </div>

            <!-- Min Capacity Filter -->
            <div class="filter-section">
              <label class="filter-label">Min Capacity</label>
              <mat-form-field appearance="outline" class="w-full filter-field">
                <input matInput type="number" min="0"
                       [value]="minCapacity()"
                       (input)="onCapacityFilter($event)"
                       placeholder="Any">
              </mat-form-field>
            </div>

            <!-- Feature Filters -->
            <div class="filter-section">
              <label class="filter-label">Features</label>
              <div class="feature-checkboxes">
                <mat-checkbox [(ngModel)]="filterHasProjector" (change)="loadRooms()">Projector</mat-checkbox>
                <mat-checkbox [(ngModel)]="filterHasComputers" (change)="loadRooms()">Computers</mat-checkbox>
                <mat-checkbox [(ngModel)]="filterIsAccessible" (change)="loadRooms()">Accessible</mat-checkbox>
              </div>
            </div>

            <!-- Clear Filters -->
            <div class="filter-actions">
              <button mat-stroked-button (click)="clearFilters()" class="clear-filters-btn">
                <mat-icon>refresh</mat-icon>
                Reset Filters
              </button>
            </div>
          </div>
        </aside>

        <!-- Main Content -->
        <main class="content-area">
          <!-- Header -->
          <header class="page-header">
            <div class="header-info">
              <h1 class="page-title">Room Management</h1>
              <p class="page-subtitle">{{ roomTotalCount() }} rooms across {{ buildings().length }} buildings</p>
            </div>
            <div class="header-actions">
              <button mat-stroked-button (click)="loadRooms(); loadBuildings()">
                <mat-icon>refresh</mat-icon>
              </button>
            </div>
          </header>

          <!-- Tabs -->
          <mat-tab-group class="content-tabs" [(selectedIndex)]="selectedTab">
            <!-- Rooms Tab -->
            <mat-tab>
              <ng-template mat-tab-label>
                <mat-icon>meeting_room</mat-icon>
                <span class="tab-label">Rooms</span>
              </ng-template>

              <div class="tab-content">
                <!-- Room Actions Bar -->
                <div class="action-bar">
                  <div class="active-filters" *ngIf="hasActiveFilters()">
                    <span class="filters-label">Active:</span>
                    @if (selectedBuildingId()) {
                      <span class="filter-chip building">
                        {{ getBuildingName(selectedBuildingId()) }}
                        <button mat-icon-button (click)="onBuildingFilter('')">
                          <mat-icon>close</mat-icon>
                        </button>
                      </span>
                    }
                    @if (selectedRoomType()) {
                      <span class="filter-chip type">
                        {{ selectedRoomType() }}
                        <button mat-icon-button (click)="onTypeFilter('')">
                          <mat-icon>close</mat-icon>
                        </button>
                      </span>
                    }
                    @if (minCapacity()) {
                      <span class="filter-chip capacity">
                        {{ minCapacity() }}+ seats
                        <button mat-icon-button (click)="minCapacity.set(null); loadRooms()">
                          <mat-icon>close</mat-icon>
                        </button>
                      </span>
                    }
                  </div>
                  <button mat-flat-button color="primary" (click)="showRoomForm = true">
                    <mat-icon>add</mat-icon>
                    Add Room
                  </button>
                </div>

                <!-- Add Room Form -->
                @if (showRoomForm) {
                  <div class="form-card">
                    <div class="form-header">
                      <h3>Add New Room</h3>
                      <button mat-icon-button (click)="cancelRoomForm()">
                        <mat-icon>close</mat-icon>
                      </button>
                    </div>
                    <div class="form-body">
                      <form [formGroup]="roomForm" (ngSubmit)="createRoom()">
                        <div class="form-grid">
                          <mat-form-field appearance="outline">
                            <mat-label>Building</mat-label>
                            <mat-select formControlName="buildingId" required>
                              @for (building of buildings(); track building.id) {
                                <mat-option [value]="building.id">{{ building.name }}</mat-option>
                              }
                            </mat-select>
                          </mat-form-field>

                          <mat-form-field appearance="outline">
                            <mat-label>Room Number</mat-label>
                            <input matInput formControlName="roomNumber" required>
                          </mat-form-field>

                          <mat-form-field appearance="outline">
                            <mat-label>Name</mat-label>
                            <input matInput formControlName="name" required>
                          </mat-form-field>

                          <mat-form-field appearance="outline">
                            <mat-label>Type</mat-label>
                            <mat-select formControlName="type" required>
                              @for (type of roomTypes; track type) {
                                <mat-option [value]="type">{{ type }}</mat-option>
                              }
                            </mat-select>
                          </mat-form-field>

                          <mat-form-field appearance="outline">
                            <mat-label>Capacity</mat-label>
                            <input matInput type="number" formControlName="capacity" required min="1">
                          </mat-form-field>

                          <mat-form-field appearance="outline">
                            <mat-label>Floor</mat-label>
                            <input matInput type="number" formControlName="floor" min="0">
                          </mat-form-field>
                        </div>

                        <div class="features-row">
                          <mat-checkbox formControlName="hasProjector">Projector</mat-checkbox>
                          <mat-checkbox formControlName="hasWhiteboard">Whiteboard</mat-checkbox>
                          <mat-checkbox formControlName="hasComputers">Computers</mat-checkbox>
                          <mat-checkbox formControlName="isAccessible">Accessible</mat-checkbox>
                        </div>

                        @if (roomForm.get('hasComputers')?.value) {
                          <mat-form-field appearance="outline" class="computer-count-field">
                            <mat-label>Computer Count</mat-label>
                            <input matInput type="number" formControlName="computerCount" min="1">
                          </mat-form-field>
                        }

                        <div class="form-actions">
                          <button mat-stroked-button type="button" (click)="cancelRoomForm()">Cancel</button>
                          <button mat-flat-button color="primary" type="submit"
                                  [disabled]="roomForm.invalid || creatingRoom()">
                            @if (creatingRoom()) {
                              <mat-spinner diameter="20"></mat-spinner>
                            }
                            Create Room
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                }

                <!-- Rooms Table -->
                <div class="table-card">
                  @if (loadingRooms()) {
                    <div class="loading-state">
                      <mat-spinner diameter="48"></mat-spinner>
                      <p>Loading rooms...</p>
                    </div>
                  } @else if (rooms().length === 0) {
                    <div class="empty-state">
                      <mat-icon>meeting_room</mat-icon>
                      <h3>No Rooms Found</h3>
                      <p>No rooms match your current filters.</p>
                      <button mat-stroked-button (click)="clearFilters()">Clear Filters</button>
                    </div>
                  } @else {
                    <div class="table-container">
                      <table mat-table [dataSource]="rooms()" matSort (matSortChange)="onRoomSort($event)">
                        <!-- Room Info Column -->
                        <ng-container matColumnDef="room">
                          <th mat-header-cell *matHeaderCellDef mat-sort-header="roomNumber">Room</th>
                          <td mat-cell *matCellDef="let room">
                            <div class="room-cell">
                              <div class="room-icon" [class]="getRoomIconClass(room.type)">
                                <mat-icon>{{ getRoomIcon(room.type) }}</mat-icon>
                              </div>
                              <div class="room-info">
                                <span class="room-number">{{ room.buildingCode }}-{{ room.roomNumber }}</span>
                                <span class="room-name">{{ room.name }}</span>
                              </div>
                            </div>
                          </td>
                        </ng-container>

                        <!-- Building Column -->
                        <ng-container matColumnDef="buildingName">
                          <th mat-header-cell *matHeaderCellDef mat-sort-header>Building</th>
                          <td mat-cell *matCellDef="let room">
                            <span class="building-name">{{ room.buildingName }}</span>
                          </td>
                        </ng-container>

                        <!-- Type Column -->
                        <ng-container matColumnDef="type">
                          <th mat-header-cell *matHeaderCellDef mat-sort-header>Type</th>
                          <td mat-cell *matCellDef="let room">
                            <span class="type-badge" [class]="getRoomTypeClass(room.type)">
                              {{ room.type }}
                            </span>
                          </td>
                        </ng-container>

                        <!-- Capacity Column -->
                        <ng-container matColumnDef="capacity">
                          <th mat-header-cell *matHeaderCellDef mat-sort-header>Capacity</th>
                          <td mat-cell *matCellDef="let room">
                            <div class="capacity-cell">
                              <mat-icon class="capacity-icon">people</mat-icon>
                              <span class="capacity-value">{{ room.capacity }}</span>
                            </div>
                          </td>
                        </ng-container>

                        <!-- Floor Column -->
                        <ng-container matColumnDef="floor">
                          <th mat-header-cell *matHeaderCellDef mat-sort-header>Floor</th>
                          <td mat-cell *matCellDef="let room">
                            <span class="floor-badge">{{ room.floor ?? 'G' }}</span>
                          </td>
                        </ng-container>

                        <!-- Features Column -->
                        <ng-container matColumnDef="features">
                          <th mat-header-cell *matHeaderCellDef>Features</th>
                          <td mat-cell *matCellDef="let room">
                            <div class="features-cell">
                              @if (room.features.includes('Projector')) {
                                <mat-icon class="feature-icon" matTooltip="Projector">videocam</mat-icon>
                              }
                              @if (room.features.includes('Whiteboard')) {
                                <mat-icon class="feature-icon" matTooltip="Whiteboard">edit</mat-icon>
                              }
                              @if (room.features.includes('Computer')) {
                                <mat-icon class="feature-icon" matTooltip="Computers">computer</mat-icon>
                              }
                              @if (room.features.includes('Accessible')) {
                                <mat-icon class="feature-icon accessible" matTooltip="Accessible">accessible</mat-icon>
                              }
                            </div>
                          </td>
                        </ng-container>

                        <!-- Status Column -->
                        <ng-container matColumnDef="isActive">
                          <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
                          <td mat-cell *matCellDef="let room">
                            <span class="status-badge" [class.active]="room.isActive" [class.inactive]="!room.isActive">
                              <span class="status-dot"></span>
                              {{ room.isActive ? 'Active' : 'Inactive' }}
                            </span>
                          </td>
                        </ng-container>

                        <!-- Actions Column -->
                        <ng-container matColumnDef="actions">
                          <th mat-header-cell *matHeaderCellDef></th>
                          <td mat-cell *matCellDef="let room">
                            <button mat-icon-button color="primary"
                                    matTooltip="Check Availability"
                                    (click)="checkAvailability(room)">
                              <mat-icon>event_available</mat-icon>
                            </button>
                          </td>
                        </ng-container>

                        <tr mat-header-row *matHeaderRowDef="roomColumns"></tr>
                        <tr mat-row *matRowDef="let row; columns: roomColumns;" class="room-row"></tr>
                      </table>
                    </div>

                    <mat-paginator
                      [length]="roomTotalCount()"
                      [pageSize]="roomPageSize()"
                      [pageIndex]="roomPageIndex()"
                      [pageSizeOptions]="[10, 25, 50]"
                      (page)="onRoomPageChange($event)"
                      showFirstLastButtons>
                    </mat-paginator>
                  }
                </div>

                <!-- Room Availability Panel -->
                @if (selectedRoomAvailability()) {
                  <div class="availability-card">
                    <div class="availability-header">
                      <div class="availability-title">
                        <mat-icon>event_available</mat-icon>
                        <div>
                          <h3>{{ selectedRoomAvailability()!.roomName }}</h3>
                          <p>{{ selectedRoomAvailability()!.buildingName }}</p>
                        </div>
                      </div>
                      <div class="availability-actions">
                        <mat-form-field appearance="outline" class="date-picker">
                          <mat-label>Date</mat-label>
                          <input matInput [matDatepicker]="availabilityPicker"
                                 [value]="availabilityDate()"
                                 (dateChange)="onAvailabilityDateChange($event)">
                          <mat-datepicker-toggle matIconSuffix [for]="availabilityPicker"></mat-datepicker-toggle>
                          <mat-datepicker #availabilityPicker></mat-datepicker>
                        </mat-form-field>
                        <button mat-icon-button (click)="selectedRoomAvailability.set(null)">
                          <mat-icon>close</mat-icon>
                        </button>
                      </div>
                    </div>
                    <div class="availability-body">
                      @if (loadingAvailability()) {
                        <div class="loading-availability">
                          <mat-spinner diameter="24"></mat-spinner>
                        </div>
                      } @else {
                        <div class="slots-grid">
                          <div class="slots-column available">
                            <h4><mat-icon>check_circle</mat-icon> Available</h4>
                            @for (slot of selectedRoomAvailability()!.availableSlots; track slot.startTime) {
                              <div class="slot-item">
                                {{ slot.startTime }} - {{ slot.endTime }}
                              </div>
                            } @empty {
                              <p class="no-slots">No available slots</p>
                            }
                          </div>
                          <div class="slots-column booked">
                            <h4><mat-icon>event_busy</mat-icon> Booked</h4>
                            @for (slot of selectedRoomAvailability()!.bookedSlots; track slot.startTime) {
                              <div class="slot-item">
                                <div class="slot-time">{{ slot.startTime }} - {{ slot.endTime }}</div>
                                @if (slot.bookingTitle) {
                                  <div class="slot-title">{{ slot.bookingTitle }}</div>
                                }
                              </div>
                            } @empty {
                              <p class="no-slots">No bookings</p>
                            }
                          </div>
                        </div>
                      }
                    </div>
                  </div>
                }
              </div>
            </mat-tab>

            <!-- Buildings Tab -->
            <mat-tab>
              <ng-template mat-tab-label>
                <mat-icon>domain</mat-icon>
                <span class="tab-label">Buildings</span>
              </ng-template>

              <div class="tab-content">
                <!-- Building Actions -->
                <div class="action-bar">
                  <div></div>
                  <button mat-flat-button color="primary" (click)="showBuildingForm = true">
                    <mat-icon>add</mat-icon>
                    Add Building
                  </button>
                </div>

                <!-- Add Building Form -->
                @if (showBuildingForm) {
                  <div class="form-card">
                    <div class="form-header">
                      <h3>Add New Building</h3>
                      <button mat-icon-button (click)="cancelBuildingForm()">
                        <mat-icon>close</mat-icon>
                      </button>
                    </div>
                    <div class="form-body">
                      <form [formGroup]="buildingForm" (ngSubmit)="createBuilding()">
                        <div class="form-grid">
                          <mat-form-field appearance="outline">
                            <mat-label>Building Code</mat-label>
                            <input matInput formControlName="code" required placeholder="e.g., SCI">
                          </mat-form-field>

                          <mat-form-field appearance="outline">
                            <mat-label>Building Name</mat-label>
                            <input matInput formControlName="name" required>
                          </mat-form-field>

                          <mat-form-field appearance="outline">
                            <mat-label>Address</mat-label>
                            <input matInput formControlName="address">
                          </mat-form-field>

                          <mat-form-field appearance="outline">
                            <mat-label>Total Floors</mat-label>
                            <input matInput type="number" formControlName="totalFloors" min="1">
                          </mat-form-field>
                        </div>

                        <mat-form-field appearance="outline" class="full-width">
                          <mat-label>Description</mat-label>
                          <textarea matInput formControlName="description" rows="2"></textarea>
                        </mat-form-field>

                        <div class="form-actions">
                          <button mat-stroked-button type="button" (click)="cancelBuildingForm()">Cancel</button>
                          <button mat-flat-button color="primary" type="submit"
                                  [disabled]="buildingForm.invalid || creatingBuilding()">
                            @if (creatingBuilding()) {
                              <mat-spinner diameter="20"></mat-spinner>
                            }
                            Create Building
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                }

                <!-- Buildings Grid -->
                <div class="buildings-grid">
                  @if (loadingBuildings()) {
                    <div class="loading-state">
                      <mat-spinner diameter="48"></mat-spinner>
                      <p>Loading buildings...</p>
                    </div>
                  } @else if (buildings().length === 0) {
                    <div class="empty-state">
                      <mat-icon>domain</mat-icon>
                      <h3>No Buildings Found</h3>
                      <p>Add your first building to get started.</p>
                      <button mat-flat-button color="primary" (click)="showBuildingForm = true">
                        <mat-icon>add</mat-icon>
                        Add Building
                      </button>
                    </div>
                  } @else {
                    @for (building of buildings(); track building.id) {
                      <div class="building-card" [class.inactive]="!building.isActive">
                        <div class="building-icon">
                          <mat-icon>domain</mat-icon>
                        </div>
                        <div class="building-content">
                          <div class="building-header">
                            <span class="building-code">{{ building.code }}</span>
                            <span class="building-status" [class.active]="building.isActive">
                              {{ building.isActive ? 'Active' : 'Inactive' }}
                            </span>
                          </div>
                          <h3 class="building-name">{{ building.name }}</h3>
                          @if (building.address) {
                            <p class="building-address">{{ building.address }}</p>
                          }
                          <div class="building-stats">
                            <div class="stat">
                              <mat-icon>meeting_room</mat-icon>
                              <span>{{ building.activeRoomCount }}/{{ building.roomCount }} rooms</span>
                            </div>
                            @if (building.totalFloors) {
                              <div class="stat">
                                <mat-icon>layers</mat-icon>
                                <span>{{ building.totalFloors }} floors</span>
                              </div>
                            }
                          </div>
                        </div>
                      </div>
                    }
                  }
                </div>
              </div>
            </mat-tab>
          </mat-tab-group>
        </main>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .room-list-container {
      height: calc(100vh - 140px);
      display: flex;
      flex-direction: column;
    }

    .main-layout {
      display: flex;
      gap: 24px;
      flex: 1;
      min-height: 0;
    }

    /* Filter Sidebar */
    .filter-sidebar {
      width: 280px;
      min-width: 280px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      display: flex;
      flex-direction: column;
      transition: all 0.3s ease;
      overflow: hidden;
    }

    .filter-sidebar.collapsed {
      width: 56px;
      min-width: 56px;
    }

    .sidebar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      border-bottom: 1px solid #e5e7eb;
    }

    .sidebar-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      color: #374151;
    }

    .sidebar-title mat-icon {
      color: #6366f1;
    }

    .collapse-btn {
      color: #6b7280;
    }

    .sidebar-content {
      padding: 16px;
      flex: 1;
      overflow-y: auto;
    }

    .filter-section {
      margin-bottom: 20px;
    }

    .filter-label {
      display: block;
      font-size: 12px;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }

    .filter-field {
      width: 100%;
    }

    .filter-field .mat-mdc-form-field-subscript-wrapper {
      display: none;
    }

    .search-icon {
      color: #9ca3af;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .feature-checkboxes {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .filter-actions {
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #e5e7eb;
    }

    .clear-filters-btn {
      width: 100%;
    }

    /* Content Area */
    .content-area {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
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

    .header-actions {
      display: flex;
      gap: 12px;
    }

    /* Tabs */
    .content-tabs {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    ::ng-deep .content-tabs .mat-mdc-tab-body-wrapper {
      flex: 1;
    }

    ::ng-deep .content-tabs .mat-mdc-tab-body-content {
      height: 100%;
      overflow: hidden;
    }

    .tab-label {
      margin-left: 8px;
    }

    .tab-content {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 16px 0;
      height: 100%;
      overflow-y: auto;
    }

    /* Action Bar */
    .action-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .active-filters {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .filters-label {
      font-size: 13px;
      color: #6b7280;
    }

    .filter-chip {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px 4px 12px;
      background: #f3f4f6;
      border-radius: 16px;
      font-size: 13px;
      color: #374151;
    }

    .filter-chip button {
      width: 20px;
      height: 20px;
      line-height: 20px;
    }

    .filter-chip button mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }

    .filter-chip.building { background: #dbeafe; color: #1e40af; }
    .filter-chip.type { background: #ede9fe; color: #6d28d9; }
    .filter-chip.capacity { background: #fef3c7; color: #92400e; }

    /* Form Card */
    .form-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .form-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid #e5e7eb;
    }

    .form-header h3 {
      font-size: 16px;
      font-weight: 600;
      color: #111827;
      margin: 0;
    }

    .form-body {
      padding: 20px;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }

    .features-row {
      display: flex;
      gap: 24px;
      margin: 16px 0;
    }

    .computer-count-field {
      width: 200px;
    }

    .full-width {
      width: 100%;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #e5e7eb;
    }

    /* Table Card */
    .table-card {
      flex: 1;
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .table-container {
      flex: 1;
      overflow: auto;
    }

    table {
      width: 100%;
    }

    .mat-mdc-header-row {
      background: #f9fafb;
    }

    .mat-mdc-header-cell {
      font-weight: 600;
      color: #374151;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .room-row {
      transition: background-color 0.15s ease;
    }

    .room-row:hover {
      background-color: #f9fafb;
    }

    /* Room Cell */
    .room-cell {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 0;
    }

    .room-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .room-icon mat-icon {
      color: white;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .room-icon.classroom { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
    .room-icon.lecture-hall { background: linear-gradient(135deg, #8b5cf6, #6d28d9); }
    .room-icon.laboratory { background: linear-gradient(135deg, #10b981, #059669); }
    .room-icon.computer-lab { background: linear-gradient(135deg, #06b6d4, #0891b2); }
    .room-icon.conference { background: linear-gradient(135deg, #f59e0b, #d97706); }
    .room-icon.study { background: linear-gradient(135deg, #f97316, #ea580c); }
    .room-icon.auditorium { background: linear-gradient(135deg, #ef4444, #dc2626); }
    .room-icon.library { background: linear-gradient(135deg, #6366f1, #4f46e5); }
    .room-icon.default { background: linear-gradient(135deg, #6b7280, #4b5563); }

    .room-info {
      display: flex;
      flex-direction: column;
    }

    .room-number {
      font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
      font-weight: 600;
      color: #6366f1;
      font-size: 13px;
    }

    .room-name {
      color: #6b7280;
      font-size: 13px;
    }

    .building-name {
      color: #4b5563;
      font-size: 14px;
    }

    .type-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }

    .type-badge.bg-blue-100 { background: #dbeafe; color: #1d4ed8; }
    .type-badge.bg-purple-100 { background: #ede9fe; color: #6d28d9; }
    .type-badge.bg-green-100 { background: #d1fae5; color: #065f46; }
    .type-badge.bg-cyan-100 { background: #cffafe; color: #0e7490; }
    .type-badge.bg-yellow-100 { background: #fef3c7; color: #92400e; }
    .type-badge.bg-orange-100 { background: #ffedd5; color: #9a3412; }
    .type-badge.bg-red-100 { background: #fee2e2; color: #991b1b; }
    .type-badge.bg-indigo-100 { background: #e0e7ff; color: #4338ca; }
    .type-badge.bg-gray-100 { background: #f3f4f6; color: #4b5563; }

    .capacity-cell {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .capacity-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #9ca3af;
    }

    .capacity-value {
      font-weight: 600;
      color: #374151;
    }

    .floor-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      background: #f3f4f6;
      border-radius: 6px;
      font-weight: 600;
      color: #374151;
      font-size: 13px;
    }

    .features-cell {
      display: flex;
      gap: 4px;
    }

    .feature-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #6b7280;
    }

    .feature-icon.accessible {
      color: #2563eb;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }

    .status-badge.active {
      background: #d1fae5;
      color: #065f46;
    }

    .status-badge.inactive {
      background: #f3f4f6;
      color: #6b7280;
    }

    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
    }

    /* Availability Card */
    .availability-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .availability-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid #e5e7eb;
    }

    .availability-title {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .availability-title mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
      color: #6366f1;
    }

    .availability-title h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #111827;
    }

    .availability-title p {
      margin: 0;
      font-size: 13px;
      color: #6b7280;
    }

    .availability-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .date-picker {
      width: 160px;
    }

    .availability-body {
      padding: 20px;
    }

    .loading-availability {
      display: flex;
      justify-content: center;
      padding: 24px;
    }

    .slots-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 24px;
    }

    .slots-column h4 {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      font-weight: 600;
      margin: 0 0 12px 0;
    }

    .slots-column.available h4 {
      color: #059669;
    }

    .slots-column.booked h4 {
      color: #dc2626;
    }

    .slots-column h4 mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .slot-item {
      padding: 8px 12px;
      border-radius: 6px;
      margin-bottom: 8px;
      font-size: 13px;
    }

    .slots-column.available .slot-item {
      background: #d1fae5;
      color: #065f46;
    }

    .slots-column.booked .slot-item {
      background: #fee2e2;
      color: #991b1b;
    }

    .slot-time {
      font-weight: 500;
    }

    .slot-title {
      font-size: 12px;
      opacity: 0.8;
      margin-top: 2px;
    }

    .no-slots {
      color: #9ca3af;
      font-size: 13px;
      font-style: italic;
      margin: 0;
    }

    /* Buildings Grid */
    .buildings-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
    }

    .building-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      padding: 20px;
      display: flex;
      gap: 16px;
    }

    .building-card.inactive {
      opacity: 0.7;
    }

    .building-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .building-icon mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
      color: white;
    }

    .building-content {
      flex: 1;
      min-width: 0;
    }

    .building-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
    }

    .building-code {
      font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
      font-size: 12px;
      font-weight: 600;
      color: #6366f1;
      background: #eef2ff;
      padding: 2px 8px;
      border-radius: 4px;
    }

    .building-status {
      font-size: 11px;
      font-weight: 500;
      padding: 2px 8px;
      border-radius: 10px;
      background: #f3f4f6;
      color: #6b7280;
    }

    .building-status.active {
      background: #d1fae5;
      color: #065f46;
    }

    .building-card h3.building-name {
      margin: 0 0 4px 0;
      font-size: 16px;
      font-weight: 600;
      color: #111827;
    }

    .building-address {
      margin: 0 0 12px 0;
      font-size: 13px;
      color: #6b7280;
    }

    .building-stats {
      display: flex;
      gap: 16px;
    }

    .building-stats .stat {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 13px;
      color: #6b7280;
    }

    .building-stats .stat mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    /* States */
    .loading-state,
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px 24px;
      text-align: center;
    }

    .loading-state p {
      margin-top: 16px;
      color: #6b7280;
    }

    .empty-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #9ca3af;
      margin-bottom: 16px;
    }

    .empty-state h3 {
      font-size: 18px;
      font-weight: 600;
      color: #111827;
      margin: 0 0 8px 0;
    }

    .empty-state p {
      color: #6b7280;
      margin: 0 0 24px 0;
    }

    /* Dark mode */
    @media (prefers-color-scheme: dark) {
      .filter-sidebar,
      .table-card,
      .form-card,
      .availability-card,
      .building-card {
        background: #1f2937;
      }

      .sidebar-header,
      .form-header,
      .availability-header {
        border-color: #374151;
      }

      .sidebar-title,
      .page-title,
      .form-header h3,
      .availability-title h3,
      .building-card h3.building-name {
        color: #f9fafb;
      }

      .mat-mdc-header-row {
        background: #111827;
      }

      .room-row:hover {
        background-color: #374151;
      }
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .filter-sidebar {
        display: none;
      }

      .main-layout {
        gap: 0;
      }

      .form-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .slots-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .form-grid {
        grid-template-columns: 1fr;
      }

      .features-row {
        flex-wrap: wrap;
      }
    }
  `]
})
export class RoomListComponent implements OnInit {
  private readonly schedulingService = inject(SchedulingService);
  private readonly notification = inject(NotificationService);
  private readonly fb = inject(FormBuilder);

  roomTypes = ROOM_TYPES;
  sidebarCollapsed = signal(false);
  selectedTab = 0;

  roomColumns = ['room', 'buildingName', 'type', 'capacity', 'floor', 'features', 'isActive', 'actions'];
  buildingColumns = ['code', 'name', 'address', 'totalFloors', 'roomCount', 'activeRoomCount', 'isActive'];

  buildings = signal<BuildingListItem[]>([]);
  loadingBuildings = signal(false);

  rooms = signal<RoomListItem[]>([]);
  loadingRooms = signal(false);
  roomTotalCount = signal(0);
  roomPageSize = signal(10);
  roomPageIndex = signal(0);
  roomSortBy = signal('RoomNumber');
  roomSortDirection = signal<'asc' | 'desc'>('asc');
  roomSearchTerm = signal('');

  selectedBuildingId = signal<string>('');
  selectedRoomType = signal<string>('');
  minCapacity = signal<number | null>(null);

  filterHasProjector = false;
  filterHasComputers = false;
  filterIsAccessible = false;

  selectedRoomAvailability = signal<RoomAvailability | null>(null);
  selectedRoomForAvailability = signal<RoomListItem | null>(null);
  availabilityDate = signal(new Date().toISOString().split('T')[0]);
  loadingAvailability = signal(false);

  showBuildingForm = false;
  showRoomForm = false;
  creatingBuilding = signal(false);
  creatingRoom = signal(false);

  buildingForm: FormGroup = this.fb.group({
    code: ['', [Validators.required, Validators.maxLength(10)]],
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: [''],
    address: [''],
    totalFloors: [null]
  });

  roomForm: FormGroup = this.fb.group({
    buildingId: ['', Validators.required],
    roomNumber: ['', [Validators.required, Validators.maxLength(20)]],
    name: ['', [Validators.required, Validators.maxLength(100)]],
    type: ['', Validators.required],
    capacity: [30, [Validators.required, Validators.min(1)]],
    floor: [null],
    description: [''],
    hasProjector: [false],
    hasWhiteboard: [true],
    hasComputers: [false],
    computerCount: [null],
    isAccessible: [false]
  });

  toggleSidebar(): void {
    this.sidebarCollapsed.update(v => !v);
  }

  getBuildingName(id: string): string {
    const building = this.buildings().find(b => b.id === id);
    return building?.name || '';
  }

  hasActiveFilters(): boolean {
    return !!(this.selectedBuildingId() || this.selectedRoomType() || this.minCapacity());
  }

  clearFilters(): void {
    this.selectedBuildingId.set('');
    this.selectedRoomType.set('');
    this.minCapacity.set(null);
    this.roomSearchTerm.set('');
    this.filterHasProjector = false;
    this.filterHasComputers = false;
    this.filterIsAccessible = false;
    this.roomPageIndex.set(0);
    this.loadRooms();
  }

  ngOnInit(): void {
    this.loadBuildings();
    this.loadRooms();
  }

  loadBuildings(): void {
    this.loadingBuildings.set(true);
    this.schedulingService.getBuildings({ pageSize: 100 }).subscribe({
      next: (response) => {
        this.buildings.set(response.data.items);
        this.loadingBuildings.set(false);
      },
      error: () => {
        this.notification.showError('Failed to load buildings');
        this.loadingBuildings.set(false);
      }
    });
  }

  loadRooms(): void {
    this.loadingRooms.set(true);
    this.schedulingService.getRooms(
      {
        pageNumber: this.roomPageIndex() + 1,
        pageSize: this.roomPageSize(),
        sortBy: this.roomSortBy(),
        sortDirection: this.roomSortDirection(),
        searchTerm: this.roomSearchTerm() || undefined
      },
      {
        buildingId: this.selectedBuildingId() || undefined,
        type: this.selectedRoomType() || undefined,
        minCapacity: this.minCapacity() ?? undefined,
        hasProjector: this.filterHasProjector || undefined,
        hasComputers: this.filterHasComputers || undefined,
        isAccessible: this.filterIsAccessible || undefined,
        isActive: undefined
      }
    ).subscribe({
      next: (response) => {
        this.rooms.set(response.data.items);
        this.roomTotalCount.set(response.data.totalCount);
        this.loadingRooms.set(false);
      },
      error: () => {
        this.notification.showError('Failed to load rooms');
        this.loadingRooms.set(false);
      }
    });
  }

  onRoomSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.roomSearchTerm.set(value);
    this.roomPageIndex.set(0);
    this.loadRooms();
  }

  onBuildingFilter(buildingId: string): void {
    this.selectedBuildingId.set(buildingId);
    this.roomPageIndex.set(0);
    this.loadRooms();
  }

  onTypeFilter(type: string): void {
    this.selectedRoomType.set(type);
    this.roomPageIndex.set(0);
    this.loadRooms();
  }

  onCapacityFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.minCapacity.set(value ? parseInt(value, 10) : null);
    this.roomPageIndex.set(0);
    this.loadRooms();
  }

  onRoomSort(sort: Sort): void {
    this.roomSortBy.set(sort.active);
    this.roomSortDirection.set(sort.direction as 'asc' | 'desc' || 'asc');
    this.loadRooms();
  }

  onRoomPageChange(event: PageEvent): void {
    this.roomPageIndex.set(event.pageIndex);
    this.roomPageSize.set(event.pageSize);
    this.loadRooms();
  }

  getRoomTypeClass(type: string): string {
    const classes: Record<string, string> = {
      'Classroom': 'bg-blue-100',
      'Lecture Hall': 'bg-purple-100',
      'Laboratory': 'bg-green-100',
      'Computer Lab': 'bg-cyan-100',
      'Conference Room': 'bg-yellow-100',
      'Study Room': 'bg-orange-100',
      'Office': 'bg-gray-100',
      'Auditorium': 'bg-red-100',
      'Library': 'bg-indigo-100'
    };
    return classes[type] || 'bg-gray-100';
  }

  getRoomIconClass(type: string): string {
    const classes: Record<string, string> = {
      'Classroom': 'classroom',
      'Lecture Hall': 'lecture-hall',
      'Laboratory': 'laboratory',
      'Computer Lab': 'computer-lab',
      'Conference Room': 'conference',
      'Study Room': 'study',
      'Auditorium': 'auditorium',
      'Library': 'library'
    };
    return classes[type] || 'default';
  }

  getRoomIcon(type: string): string {
    const icons: Record<string, string> = {
      'Classroom': 'class',
      'Lecture Hall': 'school',
      'Laboratory': 'science',
      'Computer Lab': 'computer',
      'Conference Room': 'groups',
      'Study Room': 'menu_book',
      'Auditorium': 'theater_comedy',
      'Library': 'local_library'
    };
    return icons[type] || 'meeting_room';
  }

  createBuilding(): void {
    if (this.buildingForm.invalid) return;

    this.creatingBuilding.set(true);
    const request: CreateBuildingRequest = this.buildingForm.value;

    this.schedulingService.createBuilding(request).subscribe({
      next: () => {
        this.notification.showSuccess('Building created successfully');
        this.cancelBuildingForm();
        this.loadBuildings();
      },
      error: () => {
        this.notification.showError('Failed to create building');
        this.creatingBuilding.set(false);
      }
    });
  }

  cancelBuildingForm(): void {
    this.showBuildingForm = false;
    this.buildingForm.reset();
    this.creatingBuilding.set(false);
  }

  createRoom(): void {
    if (this.roomForm.invalid) return;

    this.creatingRoom.set(true);
    const formValue = this.roomForm.value;
    const request: CreateRoomRequest = {
      buildingId: formValue.buildingId,
      roomNumber: formValue.roomNumber,
      name: formValue.name,
      type: formValue.type,
      capacity: formValue.capacity,
      floor: formValue.floor,
      description: formValue.description,
      hasProjector: formValue.hasProjector,
      hasWhiteboard: formValue.hasWhiteboard,
      hasComputers: formValue.hasComputers,
      computerCount: formValue.hasComputers ? formValue.computerCount : undefined,
      isAccessible: formValue.isAccessible
    };

    this.schedulingService.createRoom(request).subscribe({
      next: () => {
        this.notification.showSuccess('Room created successfully');
        this.cancelRoomForm();
        this.loadRooms();
        this.loadBuildings();
      },
      error: () => {
        this.notification.showError('Failed to create room');
        this.creatingRoom.set(false);
      }
    });
  }

  cancelRoomForm(): void {
    this.showRoomForm = false;
    this.roomForm.reset({
      capacity: 30,
      hasWhiteboard: true
    });
    this.creatingRoom.set(false);
  }

  checkAvailability(room: RoomListItem): void {
    this.selectedRoomForAvailability.set(room);
    this.loadAvailability(room.id);
  }

  loadAvailability(roomId: string): void {
    this.loadingAvailability.set(true);
    this.schedulingService.getRoomAvailability(roomId, this.availabilityDate()).subscribe({
      next: (availability) => {
        this.selectedRoomAvailability.set(availability);
        this.loadingAvailability.set(false);
      },
      error: () => {
        this.notification.showError('Failed to load room availability');
        this.loadingAvailability.set(false);
      }
    });
  }

  onAvailabilityDateChange(event: any): void {
    const date = event.value;
    if (date instanceof Date) {
      this.availabilityDate.set(date.toISOString().split('T')[0]);
    }
    const room = this.selectedRoomForAvailability();
    if (room) {
      this.loadAvailability(room.id);
    }
  }
}
