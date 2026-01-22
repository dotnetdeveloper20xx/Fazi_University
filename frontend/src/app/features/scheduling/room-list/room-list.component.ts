import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Room Management</h1>
      </div>

      <mat-tab-group>
        <!-- Rooms Tab -->
        <mat-tab label="Rooms">
          <div class="py-4">
            <!-- Filters and Actions -->
            <mat-card class="mb-4">
              <mat-card-content>
                <div class="flex flex-wrap gap-4 items-end">
                  <mat-form-field appearance="outline" class="min-w-[160px]">
                    <input matInput
                           [value]="roomSearchTerm()"
                           (input)="onRoomSearch($event)"
                           placeholder="Search rooms">
                    <mat-icon matPrefix>search</mat-icon>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="min-w-[140px]">
                    <mat-label>Building</mat-label>
                    <mat-select [value]="selectedBuildingId()" (selectionChange)="onBuildingFilter($event.value)">
                      <mat-option value="">All Buildings</mat-option>
                      @for (building of buildings(); track building.id) {
                        <mat-option [value]="building.id">{{ building.name }}</mat-option>
                      }
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="min-w-[130px]">
                    <mat-label>Room Type</mat-label>
                    <mat-select [value]="selectedRoomType()" (selectionChange)="onTypeFilter($event.value)">
                      <mat-option value="">All Types</mat-option>
                      @for (type of roomTypes; track type) {
                        <mat-option [value]="type">{{ type }}</mat-option>
                      }
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="min-w-[100px]">
                    <input matInput type="number" min="0"
                           [value]="minCapacity()"
                           (input)="onCapacityFilter($event)"
                           placeholder="Min Capacity">
                  </mat-form-field>

                  <button mat-raised-button color="primary" (click)="showRoomForm = true">
                    <mat-icon>add</mat-icon>
                    Add Room
                  </button>
                </div>
              </mat-card-content>
            </mat-card>

            <!-- Add Room Form -->
            @if (showRoomForm) {
              <mat-card class="mb-4">
                <mat-card-header>
                  <mat-card-title>Add New Room</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <form [formGroup]="roomForm" (ngSubmit)="createRoom()" class="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
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

                    <mat-form-field appearance="outline" class="md:col-span-3">
                      <mat-label>Description</mat-label>
                      <textarea matInput formControlName="description" rows="2"></textarea>
                    </mat-form-field>

                    <div class="md:col-span-3 flex flex-wrap gap-4">
                      <mat-checkbox formControlName="hasProjector">Has Projector</mat-checkbox>
                      <mat-checkbox formControlName="hasWhiteboard">Has Whiteboard</mat-checkbox>
                      <mat-checkbox formControlName="hasComputers">Has Computers</mat-checkbox>
                      <mat-checkbox formControlName="isAccessible">Wheelchair Accessible</mat-checkbox>
                    </div>

                    @if (roomForm.get('hasComputers')?.value) {
                      <mat-form-field appearance="outline">
                        <mat-label>Computer Count</mat-label>
                        <input matInput type="number" formControlName="computerCount" min="1">
                      </mat-form-field>
                    }

                    <div class="md:col-span-3 flex gap-2 justify-end">
                      <button mat-button type="button" (click)="cancelRoomForm()">Cancel</button>
                      <button mat-raised-button color="primary" type="submit"
                              [disabled]="roomForm.invalid || creatingRoom()">
                        @if (creatingRoom()) {
                          <mat-spinner diameter="20"></mat-spinner>
                        } @else {
                          Create Room
                        }
                      </button>
                    </div>
                  </form>
                </mat-card-content>
              </mat-card>
            }

            <!-- Rooms Table -->
            <mat-card>
              <mat-card-content>
                @if (loadingRooms()) {
                  <div class="flex justify-center py-8">
                    <mat-spinner diameter="40"></mat-spinner>
                  </div>
                } @else {
                  <table mat-table [dataSource]="rooms()" matSort (matSortChange)="onRoomSort($event)" class="w-full">
                    <ng-container matColumnDef="roomNumber">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Room #</th>
                      <td mat-cell *matCellDef="let room">{{ room.roomNumber }}</td>
                    </ng-container>

                    <ng-container matColumnDef="name">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Name</th>
                      <td mat-cell *matCellDef="let room">{{ room.name }}</td>
                    </ng-container>

                    <ng-container matColumnDef="buildingName">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Building</th>
                      <td mat-cell *matCellDef="let room">{{ room.buildingName }}</td>
                    </ng-container>

                    <ng-container matColumnDef="type">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Type</th>
                      <td mat-cell *matCellDef="let room">
                        <span class="px-2 py-1 rounded text-xs font-medium"
                              [class]="getRoomTypeClass(room.type)">
                          {{ room.type }}
                        </span>
                      </td>
                    </ng-container>

                    <ng-container matColumnDef="capacity">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Capacity</th>
                      <td mat-cell *matCellDef="let room">{{ room.capacity }}</td>
                    </ng-container>

                    <ng-container matColumnDef="floor">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Floor</th>
                      <td mat-cell *matCellDef="let room">{{ room.floor ?? '-' }}</td>
                    </ng-container>

                    <ng-container matColumnDef="features">
                      <th mat-header-cell *matHeaderCellDef>Features</th>
                      <td mat-cell *matCellDef="let room">
                        <div class="flex gap-1">
                          @if (room.features.includes('Projector')) {
                            <mat-icon class="text-sm text-gray-600" matTooltip="Projector">videocam</mat-icon>
                          }
                          @if (room.features.includes('Whiteboard')) {
                            <mat-icon class="text-sm text-gray-600" matTooltip="Whiteboard">edit</mat-icon>
                          }
                          @if (room.features.includes('Computer')) {
                            <mat-icon class="text-sm text-gray-600" matTooltip="Computers">computer</mat-icon>
                          }
                          @if (room.features.includes('Accessible')) {
                            <mat-icon class="text-sm text-gray-600" matTooltip="Accessible">accessible</mat-icon>
                          }
                        </div>
                      </td>
                    </ng-container>

                    <ng-container matColumnDef="isActive">
                      <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
                      <td mat-cell *matCellDef="let room">
                        <span [class]="room.isActive ? 'text-green-600' : 'text-red-600'">
                          {{ room.isActive ? 'Active' : 'Inactive' }}
                        </span>
                      </td>
                    </ng-container>

                    <ng-container matColumnDef="actions">
                      <th mat-header-cell *matHeaderCellDef>Actions</th>
                      <td mat-cell *matCellDef="let room">
                        <button mat-icon-button color="primary"
                                matTooltip="Check Availability"
                                (click)="checkAvailability(room)">
                          <mat-icon>event_available</mat-icon>
                        </button>
                      </td>
                    </ng-container>

                    <tr mat-header-row *matHeaderRowDef="roomColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: roomColumns;"></tr>
                  </table>

                  @if (rooms().length === 0) {
                    <div class="text-center py-8 text-gray-500">
                      No rooms found matching your criteria.
                    </div>
                  }

                  <mat-paginator
                    [length]="roomTotalCount()"
                    [pageSize]="roomPageSize()"
                    [pageIndex]="roomPageIndex()"
                    [pageSizeOptions]="[10, 25, 50]"
                    (page)="onRoomPageChange($event)"
                    showFirstLastButtons>
                  </mat-paginator>
                }
              </mat-card-content>
            </mat-card>

            <!-- Room Availability Dialog -->
            @if (selectedRoomAvailability()) {
              <mat-card class="mt-4">
                <mat-card-header>
                  <mat-card-title>
                    Room Availability: {{ selectedRoomAvailability()!.roomName }}
                  </mat-card-title>
                  <mat-card-subtitle>
                    {{ selectedRoomAvailability()!.buildingName }} - {{ selectedRoomAvailability()!.date }}
                  </mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                  <div class="flex items-center gap-4 mb-4">
                    <mat-form-field appearance="outline" class="min-w-[160px]">
                      <mat-label>Check Date</mat-label>
                      <input matInput [matDatepicker]="availabilityPicker"
                             [value]="availabilityDate()"
                             (dateChange)="onAvailabilityDateChange($event)">
                      <mat-datepicker-toggle matIconSuffix [for]="availabilityPicker"></mat-datepicker-toggle>
                      <mat-datepicker #availabilityPicker></mat-datepicker>
                    </mat-form-field>
                    <button mat-button (click)="selectedRoomAvailability.set(null)">Close</button>
                  </div>

                  @if (loadingAvailability()) {
                    <mat-spinner diameter="24"></mat-spinner>
                  } @else {
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <h4 class="font-semibold text-green-700 mb-2">Available Slots</h4>
                        @for (slot of selectedRoomAvailability()!.availableSlots; track slot.startTime) {
                          <div class="text-sm py-1 px-2 bg-green-50 rounded mb-1">
                            {{ slot.startTime }} - {{ slot.endTime }}
                          </div>
                        } @empty {
                          <div class="text-sm text-gray-500">No available slots</div>
                        }
                      </div>
                      <div>
                        <h4 class="font-semibold text-red-700 mb-2">Booked Slots</h4>
                        @for (slot of selectedRoomAvailability()!.bookedSlots; track slot.startTime) {
                          <div class="text-sm py-1 px-2 bg-red-50 rounded mb-1">
                            {{ slot.startTime }} - {{ slot.endTime }}
                            @if (slot.bookingTitle) {
                              <br><span class="text-xs text-gray-600">{{ slot.bookingTitle }}</span>
                            }
                          </div>
                        } @empty {
                          <div class="text-sm text-gray-500">No bookings</div>
                        }
                      </div>
                    </div>
                  }
                </mat-card-content>
              </mat-card>
            }
          </div>
        </mat-tab>

        <!-- Buildings Tab -->
        <mat-tab label="Buildings">
          <div class="py-4">
            <!-- Add Building Button -->
            <div class="flex justify-end mb-4">
              <button mat-raised-button color="primary" (click)="showBuildingForm = true">
                <mat-icon>add</mat-icon>
                Add Building
              </button>
            </div>

            <!-- Add Building Form -->
            @if (showBuildingForm) {
              <mat-card class="mb-4">
                <mat-card-header>
                  <mat-card-title>Add New Building</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <form [formGroup]="buildingForm" (ngSubmit)="createBuilding()" class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    <mat-form-field appearance="outline">
                      <mat-label>Building Code</mat-label>
                      <input matInput formControlName="code" required placeholder="e.g., SCI">
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Building Name</mat-label>
                      <input matInput formControlName="name" required placeholder="e.g., Science Building">
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Address</mat-label>
                      <input matInput formControlName="address">
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Total Floors</mat-label>
                      <input matInput type="number" formControlName="totalFloors" min="1">
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="md:col-span-2">
                      <mat-label>Description</mat-label>
                      <textarea matInput formControlName="description" rows="2"></textarea>
                    </mat-form-field>

                    <div class="md:col-span-2 flex gap-2 justify-end">
                      <button mat-button type="button" (click)="cancelBuildingForm()">Cancel</button>
                      <button mat-raised-button color="primary" type="submit"
                              [disabled]="buildingForm.invalid || creatingBuilding()">
                        @if (creatingBuilding()) {
                          <mat-spinner diameter="20"></mat-spinner>
                        } @else {
                          Create Building
                        }
                      </button>
                    </div>
                  </form>
                </mat-card-content>
              </mat-card>
            }

            <!-- Buildings Table -->
            <mat-card>
              <mat-card-content>
                @if (loadingBuildings()) {
                  <div class="flex justify-center py-8">
                    <mat-spinner diameter="40"></mat-spinner>
                  </div>
                } @else {
                  <table mat-table [dataSource]="buildings()" class="w-full">
                    <ng-container matColumnDef="code">
                      <th mat-header-cell *matHeaderCellDef>Code</th>
                      <td mat-cell *matCellDef="let building">{{ building.code }}</td>
                    </ng-container>

                    <ng-container matColumnDef="name">
                      <th mat-header-cell *matHeaderCellDef>Name</th>
                      <td mat-cell *matCellDef="let building">{{ building.name }}</td>
                    </ng-container>

                    <ng-container matColumnDef="address">
                      <th mat-header-cell *matHeaderCellDef>Address</th>
                      <td mat-cell *matCellDef="let building">{{ building.address ?? '-' }}</td>
                    </ng-container>

                    <ng-container matColumnDef="totalFloors">
                      <th mat-header-cell *matHeaderCellDef>Floors</th>
                      <td mat-cell *matCellDef="let building">{{ building.totalFloors ?? '-' }}</td>
                    </ng-container>

                    <ng-container matColumnDef="roomCount">
                      <th mat-header-cell *matHeaderCellDef>Total Rooms</th>
                      <td mat-cell *matCellDef="let building">{{ building.roomCount }}</td>
                    </ng-container>

                    <ng-container matColumnDef="activeRoomCount">
                      <th mat-header-cell *matHeaderCellDef>Active Rooms</th>
                      <td mat-cell *matCellDef="let building">{{ building.activeRoomCount }}</td>
                    </ng-container>

                    <ng-container matColumnDef="isActive">
                      <th mat-header-cell *matHeaderCellDef>Status</th>
                      <td mat-cell *matCellDef="let building">
                        <span [class]="building.isActive ? 'text-green-600' : 'text-red-600'">
                          {{ building.isActive ? 'Active' : 'Inactive' }}
                        </span>
                      </td>
                    </ng-container>

                    <tr mat-header-row *matHeaderRowDef="buildingColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: buildingColumns;"></tr>
                  </table>

                  @if (buildings().length === 0) {
                    <div class="text-center py-8 text-gray-500">
                      No buildings found.
                    </div>
                  }
                }
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `
})
export class RoomListComponent implements OnInit {
  private readonly schedulingService = inject(SchedulingService);
  private readonly notification = inject(NotificationService);
  private readonly fb = inject(FormBuilder);

  // Room types constant
  roomTypes = ROOM_TYPES;

  // Room table columns
  roomColumns = ['roomNumber', 'name', 'buildingName', 'type', 'capacity', 'floor', 'features', 'isActive', 'actions'];
  buildingColumns = ['code', 'name', 'address', 'totalFloors', 'roomCount', 'activeRoomCount', 'isActive'];

  // Buildings data
  buildings = signal<BuildingListItem[]>([]);
  loadingBuildings = signal(false);

  // Rooms data
  rooms = signal<RoomListItem[]>([]);
  loadingRooms = signal(false);
  roomTotalCount = signal(0);
  roomPageSize = signal(10);
  roomPageIndex = signal(0);
  roomSortBy = signal('RoomNumber');
  roomSortDirection = signal<'asc' | 'desc'>('asc');
  roomSearchTerm = signal('');

  // Filters
  selectedBuildingId = signal<string>('');
  selectedRoomType = signal<string>('');
  minCapacity = signal<number | null>(null);

  // Room availability
  selectedRoomAvailability = signal<RoomAvailability | null>(null);
  selectedRoomForAvailability = signal<RoomListItem | null>(null);
  availabilityDate = signal(new Date().toISOString().split('T')[0]);
  loadingAvailability = signal(false);

  // Forms
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
      'Classroom': 'bg-blue-100 text-blue-800',
      'Lecture Hall': 'bg-purple-100 text-purple-800',
      'Laboratory': 'bg-green-100 text-green-800',
      'Computer Lab': 'bg-cyan-100 text-cyan-800',
      'Conference Room': 'bg-yellow-100 text-yellow-800',
      'Study Room': 'bg-orange-100 text-orange-800',
      'Office': 'bg-gray-100 text-gray-800',
      'Auditorium': 'bg-red-100 text-red-800',
      'Library': 'bg-indigo-100 text-indigo-800'
    };
    return classes[type] || 'bg-gray-100 text-gray-800';
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
        this.loadBuildings(); // Refresh building room counts
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
