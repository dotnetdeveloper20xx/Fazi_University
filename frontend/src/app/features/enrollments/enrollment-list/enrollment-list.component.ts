import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
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
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { EnrollmentService } from '../services/enrollment.service';
import { NotificationService } from '../../../core/services/notification.service';
import { EnrollmentListItem, EnrollmentStatus, EnrollmentListFilter } from '../../../models';

@Component({
  selector: 'app-enrollment-list',
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
    MatDividerModule,
    MatDialogModule
  ],
  template: `
    <div class="space-y-6">
      <!-- Page header -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Enrollments</h1>
          <p class="text-gray-500 dark:text-gray-400">Manage student course enrollments</p>
        </div>
        <a mat-flat-button color="primary" routerLink="/enrollments/new">
          <mat-icon>add</mat-icon>
          Enroll Student
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
                placeholder="Search by student name or course"
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
              <mat-label>Status</mat-label>
              <mat-select [(ngModel)]="statusFilter" (selectionChange)="applyFilters()">
                <mat-option value="">All Status</mat-option>
                <mat-option value="Enrolled">Enrolled</mat-option>
                <mat-option value="Completed">Completed</mat-option>
                <mat-option value="Dropped">Dropped</mat-option>
                <mat-option value="Withdrawn">Withdrawn</mat-option>
                <mat-option value="Waitlisted">Waitlisted</mat-option>
                <mat-option value="Failed">Failed</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="min-w-[120px]">
              <mat-label>Grade</mat-label>
              <mat-select [(ngModel)]="gradeFilter" (selectionChange)="applyFilters()">
                <mat-option value="">All Grades</mat-option>
                <mat-option [value]="true">Finalized</mat-option>
                <mat-option [value]="false">Pending</mat-option>
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
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Error Loading Enrollments</h3>
            <p class="text-gray-500 dark:text-gray-400 mb-4">{{ error() }}</p>
            <button mat-flat-button color="primary" (click)="loadEnrollments()">
              <mat-icon>refresh</mat-icon>
              Try Again
            </button>
          </div>
        } @else if (enrollments().length === 0) {
          <div class="flex flex-col items-center justify-center p-12 text-center">
            <mat-icon class="text-5xl text-gray-400 mb-4">assignment</mat-icon>
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Enrollments Found</h3>
            <p class="text-gray-500 dark:text-gray-400 mb-4">
              @if (hasActiveFilters()) {
                No enrollments match your current filters.
              } @else {
                Get started by enrolling students in courses.
              }
            </p>
            @if (hasActiveFilters()) {
              <button mat-stroked-button (click)="clearFilters()">
                Clear Filters
              </button>
            } @else {
              <a mat-flat-button color="primary" routerLink="/enrollments/new">
                <mat-icon>add</mat-icon>
                Enroll Student
              </a>
            }
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table mat-table [dataSource]="enrollments()" matSort (matSortChange)="onSort($event)" class="w-full">
              <!-- Student Column -->
              <ng-container matColumnDef="studentName">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Student</th>
                <td mat-cell *matCellDef="let enrollment">
                  <div>
                    <div class="font-medium">{{ enrollment.studentName }}</div>
                    <div class="text-sm text-gray-500 font-mono">{{ enrollment.studentId_Display }}</div>
                  </div>
                </td>
              </ng-container>

              <!-- Course Column -->
              <ng-container matColumnDef="courseCode">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Course</th>
                <td mat-cell *matCellDef="let enrollment">
                  <div>
                    <div class="font-mono font-medium text-primary-600 dark:text-primary-400">
                      {{ enrollment.courseCode }}
                    </div>
                    <div class="text-sm text-gray-500 truncate max-w-[200px]" [matTooltip]="enrollment.courseName">
                      {{ enrollment.courseName }}
                    </div>
                  </div>
                </td>
              </ng-container>

              <!-- Section Column -->
              <ng-container matColumnDef="sectionNumber">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Section</th>
                <td mat-cell *matCellDef="let enrollment">
                  <span class="font-mono">{{ enrollment.sectionNumber }}</span>
                </td>
              </ng-container>

              <!-- Term Column -->
              <ng-container matColumnDef="termName">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Term</th>
                <td mat-cell *matCellDef="let enrollment">{{ enrollment.termName }}</td>
              </ng-container>

              <!-- Enrollment Date Column -->
              <ng-container matColumnDef="enrollmentDate">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Enrolled</th>
                <td mat-cell *matCellDef="let enrollment">
                  {{ enrollment.enrollmentDate | date:'mediumDate' }}
                </td>
              </ng-container>

              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
                <td mat-cell *matCellDef="let enrollment">
                  <span
                    class="px-2 py-1 rounded-full text-xs font-medium"
                    [class]="getStatusClass(enrollment.status)"
                  >
                    {{ enrollment.status }}
                  </span>
                </td>
              </ng-container>

              <!-- Grade Column -->
              <ng-container matColumnDef="grade">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Grade</th>
                <td mat-cell *matCellDef="let enrollment">
                  @if (enrollment.grade) {
                    <div class="flex items-center gap-1">
                      <span class="font-semibold" [class]="getGradeClass(enrollment.grade)">
                        {{ enrollment.grade }}
                      </span>
                      @if (enrollment.isGradeFinalized) {
                        <mat-icon class="text-sm text-green-500" matTooltip="Grade Finalized">check_circle</mat-icon>
                      }
                    </div>
                  } @else {
                    <span class="text-gray-400">--</span>
                  }
                </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef class="w-16">Actions</th>
                <td mat-cell *matCellDef="let enrollment">
                  <button mat-icon-button [matMenuTriggerFor]="menu" (click)="$event.stopPropagation()">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #menu="matMenu">
                    <a mat-menu-item [routerLink]="['/enrollments', enrollment.id]">
                      <mat-icon>visibility</mat-icon>
                      <span>View Details</span>
                    </a>
                    <a mat-menu-item [routerLink]="['/students', enrollment.studentId]" *ngIf="enrollment.studentId">
                      <mat-icon>person</mat-icon>
                      <span>View Student</span>
                    </a>
                    @if (enrollment.status === 'Enrolled') {
                      <mat-divider></mat-divider>
                      <button mat-menu-item class="text-orange-600" (click)="confirmDrop(enrollment)">
                        <mat-icon class="text-orange-600">remove_circle</mat-icon>
                        <span>Drop</span>
                      </button>
                      <button mat-menu-item class="text-red-600" (click)="confirmWithdraw(enrollment)">
                        <mat-icon class="text-red-600">cancel</mat-icon>
                        <span>Withdraw</span>
                      </button>
                    }
                  </mat-menu>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr
                mat-row
                *matRowDef="let row; columns: displayedColumns;"
                class="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                [routerLink]="['/enrollments', row.id]"
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
export class EnrollmentListComponent implements OnInit {
  private readonly enrollmentService = inject(EnrollmentService);
  private readonly notificationService = inject(NotificationService);
  private readonly route = inject(ActivatedRoute);

  displayedColumns = ['studentName', 'courseCode', 'sectionNumber', 'termName', 'enrollmentDate', 'status', 'grade', 'actions'];

  enrollments = signal<EnrollmentListItem[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);
  totalCount = signal(0);
  pageSize = signal(10);
  pageIndex = signal(0);
  sortBy = signal('EnrollmentDate');
  sortDirection = signal<'asc' | 'desc'>('desc');

  searchTerm = '';
  statusFilter = '';
  gradeFilter: boolean | '' = '';

  // Pre-filled filters from query params
  studentIdFilter = '';
  courseIdFilter = '';
  termIdFilter = '';

  ngOnInit(): void {
    // Check for query params to pre-filter
    const params = this.route.snapshot.queryParams;
    if (params['studentId']) this.studentIdFilter = params['studentId'];
    if (params['courseId']) this.courseIdFilter = params['courseId'];
    if (params['termId']) this.termIdFilter = params['termId'];

    this.loadEnrollments();
  }

  loadEnrollments(): void {
    this.isLoading.set(true);
    this.error.set(null);

    const filter: EnrollmentListFilter = {};
    if (this.statusFilter) filter.status = this.statusFilter as EnrollmentStatus;
    if (this.gradeFilter !== '') filter.isGradeFinalized = this.gradeFilter;
    if (this.studentIdFilter) filter.studentId = this.studentIdFilter;
    if (this.courseIdFilter) filter.courseId = this.courseIdFilter;
    if (this.termIdFilter) filter.termId = this.termIdFilter;

    this.enrollmentService.getEnrollments(
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
          this.enrollments.set(response.data.items);
          this.totalCount.set(response.data.totalCount);
        } else {
          this.error.set(response.errors?.join(', ') || 'Failed to load enrollments');
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Failed to load enrollments');
        this.isLoading.set(false);
      }
    });
  }

  applyFilters(): void {
    this.pageIndex.set(0);
    this.loadEnrollments();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = '';
    this.gradeFilter = '';
    this.studentIdFilter = '';
    this.courseIdFilter = '';
    this.termIdFilter = '';
    this.pageIndex.set(0);
    this.loadEnrollments();
  }

  hasActiveFilters(): boolean {
    return !!(this.searchTerm || this.statusFilter || this.gradeFilter !== '' ||
              this.studentIdFilter || this.courseIdFilter || this.termIdFilter);
  }

  onSort(sort: Sort): void {
    if (sort.direction) {
      this.sortBy.set(this.mapSortColumn(sort.active));
      this.sortDirection.set(sort.direction as 'asc' | 'desc');
    } else {
      this.sortBy.set('EnrollmentDate');
      this.sortDirection.set('desc');
    }
    this.loadEnrollments();
  }

  private mapSortColumn(column: string): string {
    const map: Record<string, string> = {
      'studentName': 'StudentName',
      'courseCode': 'CourseCode',
      'sectionNumber': 'SectionNumber',
      'termName': 'TermName',
      'enrollmentDate': 'EnrollmentDate',
      'status': 'Status',
      'grade': 'Grade'
    };
    return map[column] || 'EnrollmentDate';
  }

  onPageChange(event: PageEvent): void {
    this.pageSize.set(event.pageSize);
    this.pageIndex.set(event.pageIndex);
    this.loadEnrollments();
  }

  confirmDrop(enrollment: EnrollmentListItem): void {
    const reason = prompt(`Enter reason for dropping ${enrollment.studentName} from ${enrollment.courseCode}:`);
    if (reason !== null) {
      this.enrollmentService.dropEnrollment(enrollment.id, { reason }).subscribe({
        next: () => {
          this.notificationService.showSuccess('Enrollment dropped successfully');
          this.loadEnrollments();
        },
        error: (err) => {
          this.notificationService.showError(err.error?.message || 'Failed to drop enrollment');
        }
      });
    }
  }

  confirmWithdraw(enrollment: EnrollmentListItem): void {
    const reason = prompt(`Enter reason for withdrawal of ${enrollment.studentName} from ${enrollment.courseCode}:`);
    if (reason !== null) {
      this.enrollmentService.withdrawEnrollment(enrollment.id, { reason }).subscribe({
        next: () => {
          this.notificationService.showSuccess('Withdrawal processed successfully');
          this.loadEnrollments();
        },
        error: (err) => {
          this.notificationService.showError(err.error?.message || 'Failed to process withdrawal');
        }
      });
    }
  }

  getStatusClass(status: EnrollmentStatus): string {
    switch (status) {
      case 'Enrolled':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Dropped':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'Withdrawn':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'Waitlisted':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  }

  getGradeClass(grade: string): string {
    if (['A', 'A+', 'A-'].includes(grade)) return 'text-green-600 dark:text-green-400';
    if (['B', 'B+', 'B-'].includes(grade)) return 'text-blue-600 dark:text-blue-400';
    if (['C', 'C+', 'C-'].includes(grade)) return 'text-yellow-600 dark:text-yellow-400';
    if (['D', 'D+', 'D-'].includes(grade)) return 'text-orange-600 dark:text-orange-400';
    if (['F', 'W', 'WF'].includes(grade)) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  }
}
