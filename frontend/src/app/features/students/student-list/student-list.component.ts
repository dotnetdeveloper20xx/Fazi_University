import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatExpansionModule } from '@angular/material/expansion';
import { StudentService } from '../services/student.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ExportService, ExportColumn } from '../../../shared/services/export.service';
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
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDividerModule,
    MatChipsModule,
    MatBadgeModule,
    MatExpansionModule
  ],
  template: `
    <div class="page-container">
      <!-- Page Header -->
      <header class="page-header">
        <div class="header-content">
          <div class="header-title">
            <h1>Students</h1>
            <p class="subtitle">{{ totalCount() }} students in database</p>
          </div>
          <div class="header-actions">
            <button mat-stroked-button [matMenuTriggerFor]="exportMenu" [disabled]="students().length === 0">
              <mat-icon>download</mat-icon>
              Export
            </button>
            <mat-menu #exportMenu="matMenu">
              <button mat-menu-item (click)="exportToExcel()">
                <mat-icon>table_chart</mat-icon>
                Excel
              </button>
              <button mat-menu-item (click)="exportToCsv()">
                <mat-icon>description</mat-icon>
                CSV
              </button>
              <button mat-menu-item (click)="exportToPdf()">
                <mat-icon>picture_as_pdf</mat-icon>
                PDF
              </button>
            </mat-menu>
            <a mat-flat-button color="primary" routerLink="/students/new">
              <mat-icon>person_add</mat-icon>
              Add Student
            </a>
          </div>
        </div>
      </header>

      <!-- Main Content: Filters + Table -->
      <div class="content-layout">
        <!-- Left: Filters Panel -->
        <aside class="filters-panel" [class.collapsed]="filtersCollapsed()">
          <div class="filters-header">
            <span class="filters-title">
              <mat-icon>filter_list</mat-icon>
              Filters
            </span>
            <button mat-icon-button (click)="filtersCollapsed.set(!filtersCollapsed())" matTooltip="Toggle filters">
              <mat-icon>{{ filtersCollapsed() ? 'chevron_right' : 'chevron_left' }}</mat-icon>
            </button>
          </div>

          @if (!filtersCollapsed()) {
            <div class="filters-body">
              <!-- Search -->
              <div class="filter-section">
                <label class="filter-label">Search</label>
                <mat-form-field appearance="outline" class="filter-field">
                  <mat-icon matPrefix>search</mat-icon>
                  <input matInput [(ngModel)]="searchTerm" placeholder="Name, ID, or email" (keyup.enter)="applyFilters()">
                  @if (searchTerm) {
                    <button matSuffix mat-icon-button (click)="searchTerm = ''; applyFilters()">
                      <mat-icon>close</mat-icon>
                    </button>
                  }
                </mat-form-field>
              </div>

              <!-- Status Filter -->
              <div class="filter-section">
                <label class="filter-label">Status</label>
                <mat-form-field appearance="outline" class="filter-field">
                  <mat-select [(ngModel)]="statusFilter" (selectionChange)="applyFilters()">
                    <mat-option value="">All Statuses</mat-option>
                    <mat-option value="Active">
                      <span class="status-option active"></span> Active
                    </mat-option>
                    <mat-option value="Admitted">
                      <span class="status-option admitted"></span> Admitted
                    </mat-option>
                    <mat-option value="Graduated">
                      <span class="status-option graduated"></span> Graduated
                    </mat-option>
                    <mat-option value="Suspended">
                      <span class="status-option suspended"></span> Suspended
                    </mat-option>
                    <mat-option value="Withdrawn">
                      <span class="status-option withdrawn"></span> Withdrawn
                    </mat-option>
                    <mat-option value="OnLeave">
                      <span class="status-option onleave"></span> On Leave
                    </mat-option>
                  </mat-select>
                </mat-form-field>
              </div>

              <!-- Type Filter -->
              <div class="filter-section">
                <label class="filter-label">Enrollment Type</label>
                <mat-form-field appearance="outline" class="filter-field">
                  <mat-select [(ngModel)]="typeFilter" (selectionChange)="applyFilters()">
                    <mat-option value="">All Types</mat-option>
                    <mat-option value="FullTime">Full Time</mat-option>
                    <mat-option value="PartTime">Part Time</mat-option>
                    <mat-option value="Online">Online</mat-option>
                    <mat-option value="Exchange">Exchange</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>

              <!-- Academic Standing Filter -->
              <div class="filter-section">
                <label class="filter-label">Academic Standing</label>
                <mat-form-field appearance="outline" class="filter-field">
                  <mat-select [(ngModel)]="standingFilter" (selectionChange)="applyFilters()">
                    <mat-option value="">All Standings</mat-option>
                    <mat-option value="GoodStanding">Good Standing</mat-option>
                    <mat-option value="DeansList">Dean's List</mat-option>
                    <mat-option value="PresidentsList">President's List</mat-option>
                    <mat-option value="AcademicWarning">Warning</mat-option>
                    <mat-option value="Probation">Probation</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>

              <!-- Active Filters & Clear -->
              @if (hasActiveFilters()) {
                <div class="active-filters">
                  <div class="active-filters-header">
                    <span>Active Filters</span>
                    <button mat-button color="warn" (click)="clearFilters()">
                      Clear All
                    </button>
                  </div>
                  <div class="filter-chips">
                    @if (searchTerm) {
                      <mat-chip-row (removed)="searchTerm = ''; applyFilters()">
                        Search: {{ searchTerm }}
                        <button matChipRemove><mat-icon>cancel</mat-icon></button>
                      </mat-chip-row>
                    }
                    @if (statusFilter) {
                      <mat-chip-row (removed)="statusFilter = ''; applyFilters()">
                        Status: {{ statusFilter }}
                        <button matChipRemove><mat-icon>cancel</mat-icon></button>
                      </mat-chip-row>
                    }
                    @if (typeFilter) {
                      <mat-chip-row (removed)="typeFilter = ''; applyFilters()">
                        Type: {{ typeFilter }}
                        <button matChipRemove><mat-icon>cancel</mat-icon></button>
                      </mat-chip-row>
                    }
                    @if (standingFilter) {
                      <mat-chip-row (removed)="standingFilter = ''; applyFilters()">
                        Standing: {{ standingFilter }}
                        <button matChipRemove><mat-icon>cancel</mat-icon></button>
                      </mat-chip-row>
                    }
                  </div>
                </div>
              }
            </div>
          }
        </aside>

        <!-- Right: Data Table -->
        <main class="data-panel">
          @if (isLoading()) {
            <div class="loading-state">
              <mat-spinner diameter="48"></mat-spinner>
              <p>Loading students...</p>
            </div>
          } @else if (error()) {
            <div class="error-state">
              <mat-icon>error_outline</mat-icon>
              <h3>Failed to load students</h3>
              <p>{{ error() }}</p>
              <button mat-flat-button color="primary" (click)="loadStudents()">
                <mat-icon>refresh</mat-icon>
                Retry
              </button>
            </div>
          } @else if (students().length === 0) {
            <div class="empty-state">
              <mat-icon>school</mat-icon>
              <h3>No students found</h3>
              <p>{{ hasActiveFilters() ? 'Try adjusting your filters' : 'Add your first student to get started' }}</p>
              @if (hasActiveFilters()) {
                <button mat-stroked-button (click)="clearFilters()">Clear Filters</button>
              } @else {
                <a mat-flat-button color="primary" routerLink="/students/new">Add Student</a>
              }
            </div>
          } @else {
            <div class="table-container">
              <table mat-table [dataSource]="students()" matSort (matSortChange)="onSort($event)">
                <!-- Student ID -->
                <ng-container matColumnDef="studentId">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>ID</th>
                  <td mat-cell *matCellDef="let s">
                    <code class="student-id">{{ s.studentId }}</code>
                  </td>
                </ng-container>

                <!-- Name -->
                <ng-container matColumnDef="fullName">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Student</th>
                  <td mat-cell *matCellDef="let s">
                    <div class="student-info">
                      <div class="avatar">{{ s.firstName?.charAt(0) }}{{ s.lastName?.charAt(0) }}</div>
                      <div class="details">
                        <span class="name">{{ s.fullName }}</span>
                        <span class="email">{{ s.email }}</span>
                      </div>
                    </div>
                  </td>
                </ng-container>

                <!-- Program -->
                <ng-container matColumnDef="programName">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Program</th>
                  <td mat-cell *matCellDef="let s">
                    <div class="program-info">
                      <span class="program">{{ s.programName || '—' }}</span>
                      @if (s.departmentName) {
                        <span class="department">{{ s.departmentName }}</span>
                      }
                    </div>
                  </td>
                </ng-container>

                <!-- GPA -->
                <ng-container matColumnDef="cumulativeGpa">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>GPA</th>
                  <td mat-cell *matCellDef="let s">
                    <span class="gpa" [class]="getGpaClass(s.cumulativeGpa)">
                      {{ s.cumulativeGpa | number:'1.2-2' }}
                    </span>
                  </td>
                </ng-container>

                <!-- Status -->
                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
                  <td mat-cell *matCellDef="let s">
                    <span class="status-badge" [class]="'status-' + s.status.toLowerCase()">
                      {{ s.status }}
                    </span>
                  </td>
                </ng-container>

                <!-- Standing -->
                <ng-container matColumnDef="academicStanding">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Standing</th>
                  <td mat-cell *matCellDef="let s">
                    <div class="standing-cell">
                      <span class="standing-badge" [class]="'standing-' + s.academicStanding.toLowerCase()">
                        {{ formatStanding(s.academicStanding) }}
                      </span>
                      @if (s.hasFinancialHold || s.hasAcademicHold) {
                        <mat-icon class="hold-icon" [matTooltip]="getHoldTooltip(s)">warning</mat-icon>
                      }
                    </div>
                  </td>
                </ng-container>

                <!-- Actions -->
                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef></th>
                  <td mat-cell *matCellDef="let s">
                    <button mat-icon-button [matMenuTriggerFor]="rowMenu" (click)="$event.stopPropagation()">
                      <mat-icon>more_vert</mat-icon>
                    </button>
                    <mat-menu #rowMenu="matMenu">
                      <a mat-menu-item [routerLink]="['/students', s.id]">
                        <mat-icon>visibility</mat-icon> View
                      </a>
                      <a mat-menu-item [routerLink]="['/students', s.id, 'edit']">
                        <mat-icon>edit</mat-icon> Edit
                      </a>
                      <mat-divider></mat-divider>
                      <a mat-menu-item [routerLink]="['/enrollments']" [queryParams]="{studentId: s.id}">
                        <mat-icon>assignment</mat-icon> Enrollments
                      </a>
                      <a mat-menu-item [routerLink]="['/grades']" [queryParams]="{studentId: s.id}">
                        <mat-icon>grade</mat-icon> Grades
                      </a>
                      <a mat-menu-item [routerLink]="['/billing']" [queryParams]="{studentId: s.id}">
                        <mat-icon>payments</mat-icon> Billing
                      </a>
                      <mat-divider></mat-divider>
                      <button mat-menu-item class="delete-action" (click)="confirmDelete(s)">
                        <mat-icon>delete</mat-icon> Delete
                      </button>
                    </mat-menu>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns; sticky: true"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;"
                    [routerLink]="['/students', row.id]"
                    class="clickable-row"></tr>
              </table>
            </div>

            <mat-paginator
              [length]="totalCount()"
              [pageSize]="pageSize()"
              [pageIndex]="pageIndex()"
              [pageSizeOptions]="[10, 25, 50, 100]"
              (page)="onPageChange($event)"
              showFirstLastButtons>
            </mat-paginator>
          }
        </main>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: #f8fafc;
    }

    /* Header */
    .page-header {
      background: white;
      border-bottom: 1px solid #e2e8f0;
      padding: 1.25rem 1.5rem;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      max-width: 100%;
    }

    .header-title h1 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: #1e293b;
    }

    .subtitle {
      margin: 0.25rem 0 0;
      font-size: 0.875rem;
      color: #64748b;
    }

    .header-actions {
      display: flex;
      gap: 0.75rem;
    }

    /* Content Layout */
    .content-layout {
      display: flex;
      flex: 1;
      overflow: hidden;
    }

    /* Filters Panel */
    .filters-panel {
      width: 280px;
      background: white;
      border-right: 1px solid #e2e8f0;
      display: flex;
      flex-direction: column;
      transition: width 0.2s ease;
    }

    .filters-panel.collapsed {
      width: 48px;
    }

    .filters-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem;
      border-bottom: 1px solid #e2e8f0;
      background: #f8fafc;
    }

    .filters-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 500;
      color: #475569;
    }

    .filters-panel.collapsed .filters-title span {
      display: none;
    }

    .filters-body {
      padding: 1rem;
      overflow-y: auto;
      flex: 1;
    }

    .filter-section {
      margin-bottom: 1.25rem;
    }

    .filter-label {
      display: block;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #64748b;
      margin-bottom: 0.5rem;
    }

    .filter-field {
      width: 100%;
    }

    .filter-field ::ng-deep .mat-mdc-form-field-subscript-wrapper {
      display: none;
    }

    .status-option {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-right: 8px;
    }

    .status-option.active { background: #22c55e; }
    .status-option.admitted { background: #8b5cf6; }
    .status-option.graduated { background: #3b82f6; }
    .status-option.suspended { background: #ef4444; }
    .status-option.withdrawn { background: #f97316; }
    .status-option.onleave { background: #eab308; }

    .active-filters {
      padding-top: 1rem;
      border-top: 1px solid #e2e8f0;
    }

    .active-filters-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      color: #64748b;
    }

    .filter-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    /* Data Panel */
    .data-panel {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background: white;
      margin: 1rem;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .table-container {
      flex: 1;
      overflow: auto;
    }

    table {
      width: 100%;
    }

    th.mat-mdc-header-cell {
      background: #f8fafc;
      font-weight: 600;
      color: #475569;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .clickable-row {
      cursor: pointer;
      transition: background 0.15s ease;
    }

    .clickable-row:hover {
      background: #f1f5f9;
    }

    /* Student ID */
    .student-id {
      font-family: 'SF Mono', Monaco, monospace;
      font-size: 0.8125rem;
      color: #6366f1;
      background: #eef2ff;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
    }

    /* Student Info */
    .student-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .details {
      display: flex;
      flex-direction: column;
    }

    .name {
      font-weight: 500;
      color: #1e293b;
    }

    .email {
      font-size: 0.8125rem;
      color: #64748b;
    }

    /* Program Info */
    .program-info {
      display: flex;
      flex-direction: column;
    }

    .program {
      color: #1e293b;
    }

    .department {
      font-size: 0.8125rem;
      color: #64748b;
    }

    /* GPA */
    .gpa {
      font-weight: 600;
      font-size: 0.9375rem;
    }

    .gpa.excellent { color: #22c55e; }
    .gpa.good { color: #3b82f6; }
    .gpa.average { color: #eab308; }
    .gpa.poor { color: #ef4444; }

    /* Status Badge */
    .status-badge {
      display: inline-block;
      padding: 0.25rem 0.625rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .status-active { background: #dcfce7; color: #166534; }
    .status-admitted { background: #ede9fe; color: #5b21b6; }
    .status-graduated { background: #dbeafe; color: #1e40af; }
    .status-suspended { background: #fee2e2; color: #991b1b; }
    .status-withdrawn { background: #ffedd5; color: #9a3412; }
    .status-onleave { background: #fef9c3; color: #854d0e; }
    .status-inactive { background: #f1f5f9; color: #475569; }

    /* Standing Badge */
    .standing-cell {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .standing-badge {
      display: inline-block;
      padding: 0.25rem 0.625rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .standing-goodstanding { background: #dcfce7; color: #166534; }
    .standing-deanslist { background: #dbeafe; color: #1e40af; }
    .standing-presidentslist { background: #ede9fe; color: #5b21b6; }
    .standing-academicwarning { background: #fef9c3; color: #854d0e; }
    .standing-probation { background: #ffedd5; color: #9a3412; }
    .standing-dismissed { background: #fee2e2; color: #991b1b; }

    .hold-icon {
      color: #ef4444;
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .delete-action {
      color: #ef4444;
    }

    /* States */
    .loading-state, .error-state, .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      text-align: center;
      flex: 1;
    }

    .loading-state p, .error-state p, .empty-state p {
      color: #64748b;
      margin: 1rem 0;
    }

    .error-state mat-icon, .empty-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #94a3b8;
    }

    .error-state mat-icon {
      color: #ef4444;
    }

    .error-state h3, .empty-state h3 {
      margin: 0;
      color: #1e293b;
    }

    /* Paginator */
    mat-paginator {
      border-top: 1px solid #e2e8f0;
    }
  `]
})
export class StudentListComponent implements OnInit {
  private readonly studentService = inject(StudentService);
  private readonly notificationService = inject(NotificationService);
  private readonly exportService = inject(ExportService);

  displayedColumns = ['studentId', 'fullName', 'programName', 'cumulativeGpa', 'status', 'academicStanding', 'actions'];

  students = signal<StudentListItem[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);
  totalCount = signal(0);
  pageSize = signal(25);
  pageIndex = signal(0);
  sortBy = signal('CreatedAt');
  sortDirection = signal<'asc' | 'desc'>('desc');
  filtersCollapsed = signal(false);

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
        if (response.success) {
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
    if (confirm(`Are you sure you want to delete ${student.fullName}?`)) {
      this.studentService.deleteStudent(student.id).subscribe({
        next: () => {
          this.notificationService.showSuccess(`${student.fullName} deleted`);
          this.loadStudents();
        },
        error: (err) => {
          this.notificationService.showError(err.error?.message || 'Failed to delete');
        }
      });
    }
  }

  formatStanding(standing: AcademicStanding): string {
    const map: Record<string, string> = {
      'GoodStanding': 'Good',
      'AcademicWarning': 'Warning',
      'Probation': 'Probation',
      'DeansList': "Dean's List",
      'PresidentsList': "President's List"
    };
    return map[standing] || standing;
  }

  getGpaClass(gpa: number): string {
    if (gpa >= 3.5) return 'excellent';
    if (gpa >= 3.0) return 'good';
    if (gpa >= 2.0) return 'average';
    return 'poor';
  }

  getHoldTooltip(student: StudentListItem): string {
    const holds = [];
    if (student.hasFinancialHold) holds.push('Financial Hold');
    if (student.hasAcademicHold) holds.push('Academic Hold');
    return holds.join(', ');
  }

  private getExportColumns(): ExportColumn[] {
    return [
      { header: 'Student ID', key: 'studentId', width: 15 },
      { header: 'First Name', key: 'firstName', width: 15 },
      { header: 'Last Name', key: 'lastName', width: 15 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Program', key: 'programName', width: 25 },
      { header: 'Department', key: 'departmentName', width: 20 },
      { header: 'GPA', key: 'cumulativeGpa', width: 8 },
      { header: 'Credits', key: 'earnedCredits', width: 10 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Standing', key: 'academicStanding', width: 15 }
    ];
  }

  exportToExcel(): void {
    this.exportService.exportToExcel(this.students(), this.getExportColumns(), 'students');
    this.notificationService.showSuccess('Exported to Excel');
  }

  exportToCsv(): void {
    this.exportService.exportToCsv(this.students(), this.getExportColumns(), 'students');
    this.notificationService.showSuccess('Exported to CSV');
  }

  exportToPdf(): void {
    this.exportService.exportToPdf(this.students(), this.getExportColumns(), 'students', 'Student List');
  }
}
