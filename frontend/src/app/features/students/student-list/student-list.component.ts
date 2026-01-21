import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { StudentService } from '../services/student.service';
import { NotificationService } from '../../../core/services/notification.service';
import { StudentListItem, StudentStatus, StudentType, AcademicStanding, StudentListFilter } from '../../../models';

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDividerModule
  ],
  template: `
    <div class="space-y-6">
      <!-- Page header -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Students</h1>
          <p class="text-gray-500 dark:text-gray-400">Manage student records and information</p>
        </div>
        <a mat-flat-button color="primary" routerLink="/students/new">
          <mat-icon>add</mat-icon>
          Add Student
        </a>
      </div>

      <!-- Filters -->
      <mat-card>
        <mat-card-content class="p-4">
          <div class="flex flex-wrap gap-4 items-end">
            <mat-form-field appearance="outline" class="flex-1 min-w-[200px]">
              <input
                matInput
                [(ngModel)]="searchTerm"
                placeholder="Search by name, ID, or email"
                (keyup.enter)="applyFilters()"
              >
              <mat-icon matPrefix>search</mat-icon>
              @if (searchTerm) {
                <button matSuffix mat-icon-button (click)="searchTerm = ''; applyFilters()">
                  <mat-icon>close</mat-icon>
                </button>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="min-w-[120px]">
              <mat-select [(ngModel)]="statusFilter" (selectionChange)="applyFilters()" placeholder="Status">
                <mat-option value="">All Status</mat-option>
                <mat-option value="Admitted">Admitted</mat-option>
                <mat-option value="Active">Active</mat-option>
                <mat-option value="Inactive">Inactive</mat-option>
                <mat-option value="Graduated">Graduated</mat-option>
                <mat-option value="Suspended">Suspended</mat-option>
                <mat-option value="Withdrawn">Withdrawn</mat-option>
                <mat-option value="OnLeave">On Leave</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="min-w-[120px]">
              <mat-select [(ngModel)]="typeFilter" (selectionChange)="applyFilters()" placeholder="Type">
                <mat-option value="">All Types</mat-option>
                <mat-option value="FullTime">Full Time</mat-option>
                <mat-option value="PartTime">Part Time</mat-option>
                <mat-option value="Online">Online</mat-option>
                <mat-option value="Exchange">Exchange</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="min-w-[140px]">
              <mat-select [(ngModel)]="standingFilter" (selectionChange)="applyFilters()" placeholder="Standing">
                <mat-option value="">All Standing</mat-option>
                <mat-option value="GoodStanding">Good Standing</mat-option>
                <mat-option value="AcademicWarning">Warning</mat-option>
                <mat-option value="Probation">Probation</mat-option>
                <mat-option value="Dismissed">Dismissed</mat-option>
              </mat-select>
            </mat-form-field>

            <button mat-stroked-button (click)="clearFilters()" [disabled]="!hasActiveFilters()">
              <mat-icon>clear</mat-icon>
              Clear Filters
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Data table -->
      <mat-card>
        @if (isLoading()) {
          <div class="flex items-center justify-center p-12">
            <mat-spinner diameter="40"></mat-spinner>
          </div>
        } @else if (error()) {
          <div class="flex flex-col items-center justify-center p-12 text-center">
            <mat-icon class="text-5xl text-red-500 mb-4">error_outline</mat-icon>
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Error Loading Students</h3>
            <p class="text-gray-500 dark:text-gray-400 mb-4">{{ error() }}</p>
            <button mat-flat-button color="primary" (click)="loadStudents()">
              <mat-icon>refresh</mat-icon>
              Try Again
            </button>
          </div>
        } @else if (students().length === 0) {
          <div class="flex flex-col items-center justify-center p-12 text-center">
            <mat-icon class="text-5xl text-gray-400 mb-4">school</mat-icon>
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Students Found</h3>
            <p class="text-gray-500 dark:text-gray-400 mb-4">
              @if (hasActiveFilters()) {
                No students match your current filters.
              } @else {
                Get started by adding your first student.
              }
            </p>
            @if (hasActiveFilters()) {
              <button mat-stroked-button (click)="clearFilters()">
                Clear Filters
              </button>
            } @else {
              <a mat-flat-button color="primary" routerLink="/students/new">
                <mat-icon>add</mat-icon>
                Add Student
              </a>
            }
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table mat-table [dataSource]="students()" matSort (matSortChange)="onSort($event)" class="w-full">
              <!-- Student ID Column -->
              <ng-container matColumnDef="studentId">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Student ID</th>
                <td mat-cell *matCellDef="let student">
                  <span class="font-mono text-sm">{{ student.studentId }}</span>
                </td>
              </ng-container>

              <!-- Name Column -->
              <ng-container matColumnDef="fullName">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Name</th>
                <td mat-cell *matCellDef="let student">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center flex-shrink-0">
                      <span class="text-sm font-medium text-primary-700 dark:text-primary-300">
                        {{ student.firstName?.charAt(0) }}{{ student.lastName?.charAt(0) }}
                      </span>
                    </div>
                    <div class="min-w-0">
                      <div class="font-medium truncate">{{ student.fullName }}</div>
                      <div class="text-sm text-gray-500 truncate">{{ student.email }}</div>
                    </div>
                  </div>
                </td>
              </ng-container>

              <!-- Program Column -->
              <ng-container matColumnDef="programName">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Program</th>
                <td mat-cell *matCellDef="let student">
                  <div class="truncate max-w-[200px]" [matTooltip]="student.programName || 'N/A'">
                    {{ student.programName || 'N/A' }}
                  </div>
                  @if (student.departmentName) {
                    <div class="text-xs text-gray-500 truncate">{{ student.departmentName }}</div>
                  }
                </td>
              </ng-container>

              <!-- GPA Column -->
              <ng-container matColumnDef="cumulativeGpa">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>GPA</th>
                <td mat-cell *matCellDef="let student">
                  <span [class]="getGpaClass(student.cumulativeGpa)">
                    {{ student.cumulativeGpa | number:'1.2-2' }}
                  </span>
                </td>
              </ng-container>

              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
                <td mat-cell *matCellDef="let student">
                  <span
                    class="px-2 py-1 rounded-full text-xs font-medium"
                    [class]="getStatusClass(student.status)"
                  >
                    {{ student.status }}
                  </span>
                </td>
              </ng-container>

              <!-- Standing Column -->
              <ng-container matColumnDef="academicStanding">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Standing</th>
                <td mat-cell *matCellDef="let student">
                  <div class="flex items-center gap-1">
                    <span
                      class="px-2 py-1 rounded-full text-xs font-medium"
                      [class]="getStandingClass(student.academicStanding)"
                    >
                      {{ formatStanding(student.academicStanding) }}
                    </span>
                    @if (student.hasFinancialHold || student.hasAcademicHold) {
                      <mat-icon
                        class="text-red-500 text-sm"
                        [matTooltip]="getHoldTooltip(student)"
                      >
                        warning
                      </mat-icon>
                    }
                  </div>
                </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef class="w-16">Actions</th>
                <td mat-cell *matCellDef="let student">
                  <button mat-icon-button [matMenuTriggerFor]="menu">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #menu="matMenu">
                    <a mat-menu-item [routerLink]="['/students', student.id]">
                      <mat-icon>visibility</mat-icon>
                      <span>View Details</span>
                    </a>
                    <a mat-menu-item [routerLink]="['/students', student.id, 'edit']">
                      <mat-icon>edit</mat-icon>
                      <span>Edit</span>
                    </a>
                    <a mat-menu-item [routerLink]="['/enrollments']" [queryParams]="{studentId: student.id}">
                      <mat-icon>assignment</mat-icon>
                      <span>Enrollments</span>
                    </a>
                    <a mat-menu-item [routerLink]="['/grades']" [queryParams]="{studentId: student.id}">
                      <mat-icon>grade</mat-icon>
                      <span>Grades</span>
                    </a>
                    <mat-divider></mat-divider>
                    <button mat-menu-item class="text-red-600" (click)="confirmDelete(student)">
                      <mat-icon class="text-red-600">delete</mat-icon>
                      <span>Delete</span>
                    </button>
                  </mat-menu>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr
                mat-row
                *matRowDef="let row; columns: displayedColumns;"
                class="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                [routerLink]="['/students', row.id]"
              ></tr>
            </table>
          </div>

          <mat-paginator
            [length]="totalCount()"
            [pageSize]="pageSize()"
            [pageIndex]="pageIndex()"
            [pageSizeOptions]="[10, 25, 50]"
            (page)="onPageChange($event)"
            showFirstLastButtons
          />
        }
      </mat-card>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .mat-mdc-row:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }
  `]
})
export class StudentListComponent implements OnInit {
  private readonly studentService = inject(StudentService);
  private readonly notificationService = inject(NotificationService);

  displayedColumns = ['studentId', 'fullName', 'programName', 'cumulativeGpa', 'status', 'academicStanding', 'actions'];

  students = signal<StudentListItem[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);
  totalCount = signal(0);
  pageSize = signal(10);
  pageIndex = signal(0);
  sortBy = signal('CreatedAt');
  sortDirection = signal<'asc' | 'desc'>('desc');

  searchTerm = '';
  statusFilter = '';
  typeFilter = '';
  standingFilter = '';

  ngOnInit(): void {
    this.loadStudents();
  }

  loadStudents(): void {
    this.isLoading.set(true);
    this.error.set(null);

    const filter: StudentListFilter = {};
    if (this.statusFilter) filter.status = this.statusFilter as StudentStatus;
    if (this.typeFilter) filter.type = this.typeFilter as StudentType;
    if (this.standingFilter) filter.academicStanding = this.standingFilter as AcademicStanding;

    this.studentService.getStudents(
      {
        pageNumber: this.pageIndex() + 1,
        pageSize: this.pageSize(),
        sortBy: this.sortBy(),
        sortDirection: this.sortDirection(),
        searchTerm: this.searchTerm || undefined
      },
      filter
    ).subscribe({
      next: (response) => {
        if (response.succeeded) {
          this.students.set(response.data.items);
          this.totalCount.set(response.data.totalCount);
        } else {
          this.error.set(response.errors?.join(', ') || 'Failed to load students');
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Failed to load students');
        this.isLoading.set(false);
      }
    });
  }

  applyFilters(): void {
    this.pageIndex.set(0);
    this.loadStudents();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = '';
    this.typeFilter = '';
    this.standingFilter = '';
    this.pageIndex.set(0);
    this.loadStudents();
  }

  hasActiveFilters(): boolean {
    return !!(this.searchTerm || this.statusFilter || this.typeFilter || this.standingFilter);
  }

  onSort(sort: Sort): void {
    if (sort.direction) {
      this.sortBy.set(this.mapSortColumn(sort.active));
      this.sortDirection.set(sort.direction as 'asc' | 'desc');
    } else {
      this.sortBy.set('CreatedAt');
      this.sortDirection.set('desc');
    }
    this.loadStudents();
  }

  private mapSortColumn(column: string): string {
    const map: Record<string, string> = {
      'studentId': 'StudentId',
      'fullName': 'LastName',
      'programName': 'ProgramName',
      'cumulativeGpa': 'CumulativeGpa',
      'status': 'Status',
      'academicStanding': 'AcademicStanding'
    };
    return map[column] || 'CreatedAt';
  }

  onPageChange(event: PageEvent): void {
    this.pageSize.set(event.pageSize);
    this.pageIndex.set(event.pageIndex);
    this.loadStudents();
  }

  confirmDelete(student: StudentListItem): void {
    if (confirm(`Are you sure you want to delete ${student.fullName}? This action cannot be undone.`)) {
      this.studentService.deleteStudent(student.id).subscribe({
        next: () => {
          this.notificationService.showSuccess(`${student.fullName} has been deleted`);
          this.loadStudents();
        },
        error: (err) => {
          this.notificationService.showError(err.error?.message || 'Failed to delete student');
        }
      });
    }
  }

  getStatusClass(status: StudentStatus): string {
    switch (status) {
      case 'Admitted':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'Active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      case 'Graduated':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Suspended':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'Withdrawn':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'OnLeave':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  }

  getStandingClass(standing: AcademicStanding): string {
    switch (standing) {
      case 'GoodStanding':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'AcademicWarning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Probation':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'Dismissed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  }

  formatStanding(standing: AcademicStanding): string {
    switch (standing) {
      case 'GoodStanding': return 'Good';
      case 'AcademicWarning': return 'Warning';
      case 'Probation': return 'Probation';
      case 'Dismissed': return 'Dismissed';
      default: return standing;
    }
  }

  getGpaClass(gpa: number): string {
    if (gpa >= 3.5) return 'text-green-600 dark:text-green-400 font-semibold';
    if (gpa >= 3.0) return 'text-blue-600 dark:text-blue-400';
    if (gpa >= 2.0) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  }

  getHoldTooltip(student: StudentListItem): string {
    const holds = [];
    if (student.hasFinancialHold) holds.push('Financial Hold');
    if (student.hasAcademicHold) holds.push('Academic Hold');
    return holds.join(', ');
  }
}
