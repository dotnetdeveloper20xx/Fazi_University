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
    <div class="enrollment-list-container">
      <!-- Main Layout: Sidebar + Content -->
      <div class="main-layout">
        <!-- Collapsible Filter Sidebar -->
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
                  [(ngModel)]="searchTerm"
                  placeholder="Student or course..."
                  (keyup.enter)="applyFilters()"
                >
                @if (searchTerm) {
                  <button matSuffix mat-icon-button (click)="searchTerm = ''; applyFilters()" class="clear-btn">
                    <mat-icon>close</mat-icon>
                  </button>
                }
              </mat-form-field>
            </div>

            <!-- Status Filter -->
            <div class="filter-section">
              <label class="filter-label">Status</label>
              <mat-form-field appearance="outline" class="w-full filter-field">
                <mat-select [(ngModel)]="statusFilter" (selectionChange)="applyFilters()">
                  <mat-option value="">All Status</mat-option>
                  <mat-option value="Enrolled">
                    <span class="option-with-dot enrolled">Enrolled</span>
                  </mat-option>
                  <mat-option value="Completed">
                    <span class="option-with-dot completed">Completed</span>
                  </mat-option>
                  <mat-option value="Dropped">
                    <span class="option-with-dot dropped">Dropped</span>
                  </mat-option>
                  <mat-option value="Withdrawn">
                    <span class="option-with-dot withdrawn">Withdrawn</span>
                  </mat-option>
                  <mat-option value="Waitlisted">
                    <span class="option-with-dot waitlisted">Waitlisted</span>
                  </mat-option>
                  <mat-option value="Failed">
                    <span class="option-with-dot failed">Failed</span>
                  </mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <!-- Grade Status Filter -->
            <div class="filter-section">
              <label class="filter-label">Grade Status</label>
              <mat-form-field appearance="outline" class="w-full filter-field">
                <mat-select [(ngModel)]="gradeFilter" (selectionChange)="applyFilters()">
                  <mat-option value="">All Grades</mat-option>
                  <mat-option [value]="true">Finalized</mat-option>
                  <mat-option [value]="false">Pending</mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <!-- Term Filter -->
            <div class="filter-section">
              <label class="filter-label">Term</label>
              <mat-form-field appearance="outline" class="w-full filter-field">
                <mat-select [(ngModel)]="termIdFilter" (selectionChange)="applyFilters()">
                  <mat-option value="">All Terms</mat-option>
                  <!-- Dynamic terms would be loaded here -->
                </mat-select>
              </mat-form-field>
            </div>

            <!-- Clear Filters Button -->
            <div class="filter-actions">
              <button
                mat-stroked-button
                (click)="clearFilters()"
                [disabled]="!hasActiveFilters()"
                class="clear-filters-btn"
              >
                <mat-icon>refresh</mat-icon>
                Reset Filters
              </button>
            </div>
          </div>
        </aside>

        <!-- Main Content Area -->
        <main class="content-area">
          <!-- Page Header -->
          <header class="page-header">
            <div class="header-info">
              <h1 class="page-title">Enrollments</h1>
              <p class="page-subtitle">
                {{ totalCount() }} enrollments
                @if (hasActiveFilters()) {
                  <span class="filter-indicator">(filtered)</span>
                }
              </p>
            </div>
            <div class="header-actions">
              <button mat-stroked-button (click)="loadEnrollments()" matTooltip="Refresh list">
                <mat-icon>refresh</mat-icon>
              </button>
              <a mat-flat-button color="primary" routerLink="/enrollments/new">
                <mat-icon>add</mat-icon>
                Enroll Student
              </a>
            </div>
          </header>

          <!-- Active Filters Display -->
          @if (hasActiveFilters()) {
            <div class="active-filters">
              <span class="active-filters-label">Active filters:</span>
              @if (searchTerm) {
                <span class="filter-chip">
                  Search: "{{ searchTerm }}"
                  <button mat-icon-button (click)="searchTerm = ''; applyFilters()">
                    <mat-icon>close</mat-icon>
                  </button>
                </span>
              }
              @if (statusFilter) {
                <span class="filter-chip status-chip" [class]="'status-' + statusFilter.toLowerCase()">
                  {{ statusFilter }}
                  <button mat-icon-button (click)="statusFilter = ''; applyFilters()">
                    <mat-icon>close</mat-icon>
                  </button>
                </span>
              }
              @if (gradeFilter !== '') {
                <span class="filter-chip grade-chip">
                  {{ gradeFilter ? 'Finalized' : 'Pending' }}
                  <button mat-icon-button (click)="gradeFilter = ''; applyFilters()">
                    <mat-icon>close</mat-icon>
                  </button>
                </span>
              }
              @if (studentIdFilter) {
                <span class="filter-chip student-chip">
                  Student Filter
                  <button mat-icon-button (click)="studentIdFilter = ''; applyFilters()">
                    <mat-icon>close</mat-icon>
                  </button>
                </span>
              }
              @if (courseIdFilter) {
                <span class="filter-chip course-chip">
                  Course Filter
                  <button mat-icon-button (click)="courseIdFilter = ''; applyFilters()">
                    <mat-icon>close</mat-icon>
                  </button>
                </span>
              }
            </div>
          }

          <!-- Data Table Card -->
          <div class="table-card">
            @if (isLoading()) {
              <div class="loading-state">
                <mat-spinner diameter="48"></mat-spinner>
                <p>Loading enrollments...</p>
              </div>
            } @else if (error()) {
              <div class="error-state">
                <mat-icon>error_outline</mat-icon>
                <h3>Error Loading Enrollments</h3>
                <p>{{ error() }}</p>
                <button mat-flat-button color="primary" (click)="loadEnrollments()">
                  <mat-icon>refresh</mat-icon>
                  Try Again
                </button>
              </div>
            } @else if (enrollments().length === 0) {
              <div class="empty-state">
                <mat-icon>assignment</mat-icon>
                <h3>No Enrollments Found</h3>
                <p>
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
              <div class="table-container">
                <table mat-table [dataSource]="enrollments()" matSort (matSortChange)="onSort($event)">
                  <!-- Student Column -->
                  <ng-container matColumnDef="student">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header="studentName">Student</th>
                    <td mat-cell *matCellDef="let enrollment">
                      <div class="student-cell">
                        <div class="student-avatar">
                          {{ getInitials(enrollment.studentName) }}
                        </div>
                        <div class="student-info">
                          <span class="student-name">{{ enrollment.studentName }}</span>
                          <span class="student-id">{{ enrollment.studentId_Display }}</span>
                        </div>
                      </div>
                    </td>
                  </ng-container>

                  <!-- Course Column -->
                  <ng-container matColumnDef="course">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header="courseCode">Course</th>
                    <td mat-cell *matCellDef="let enrollment">
                      <div class="course-cell">
                        <span class="course-code">{{ enrollment.courseCode }}</span>
                        <span class="course-name" [matTooltip]="enrollment.courseName">{{ enrollment.courseName }}</span>
                      </div>
                    </td>
                  </ng-container>

                  <!-- Section Column -->
                  <ng-container matColumnDef="sectionNumber">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>Section</th>
                    <td mat-cell *matCellDef="let enrollment">
                      <span class="section-badge">{{ enrollment.sectionNumber }}</span>
                    </td>
                  </ng-container>

                  <!-- Term Column -->
                  <ng-container matColumnDef="termName">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>Term</th>
                    <td mat-cell *matCellDef="let enrollment">
                      <span class="term-name">{{ enrollment.termName }}</span>
                    </td>
                  </ng-container>

                  <!-- Enrollment Date Column -->
                  <ng-container matColumnDef="enrollmentDate">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>Enrolled</th>
                    <td mat-cell *matCellDef="let enrollment">
                      <span class="date-text">{{ enrollment.enrollmentDate | date:'MMM d, y' }}</span>
                    </td>
                  </ng-container>

                  <!-- Status Column -->
                  <ng-container matColumnDef="status">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
                    <td mat-cell *matCellDef="let enrollment">
                      <span class="status-badge" [class]="getStatusClass(enrollment.status)">
                        <span class="status-dot"></span>
                        {{ enrollment.status }}
                      </span>
                    </td>
                  </ng-container>

                  <!-- Grade Column -->
                  <ng-container matColumnDef="grade">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>Grade</th>
                    <td mat-cell *matCellDef="let enrollment">
                      @if (enrollment.grade) {
                        <div class="grade-cell">
                          <span class="grade-value" [class]="getGradeClass(enrollment.grade)">
                            {{ enrollment.grade }}
                          </span>
                          @if (enrollment.isGradeFinalized) {
                            <mat-icon class="finalized-icon" matTooltip="Grade Finalized">verified</mat-icon>
                          }
                        </div>
                      } @else {
                        <span class="no-grade">--</span>
                      }
                    </td>
                  </ng-container>

                  <!-- Actions Column -->
                  <ng-container matColumnDef="actions">
                    <th mat-header-cell *matHeaderCellDef></th>
                    <td mat-cell *matCellDef="let enrollment">
                      <button mat-icon-button [matMenuTriggerFor]="menu" (click)="$event.stopPropagation()" class="actions-btn">
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
                          <button mat-menu-item class="drop-action" (click)="confirmDrop(enrollment)">
                            <mat-icon>remove_circle</mat-icon>
                            <span>Drop</span>
                          </button>
                          <button mat-menu-item class="withdraw-action" (click)="confirmWithdraw(enrollment)">
                            <mat-icon>cancel</mat-icon>
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
                    class="enrollment-row"
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
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .enrollment-list-container {
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

    /* Sidebar Styles */
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

    .filter-field .mdc-text-field--outlined {
      --mdc-outlined-text-field-container-shape: 8px;
    }

    .search-icon {
      color: #9ca3af;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .clear-btn mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .option-with-dot {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .option-with-dot::before {
      content: '';
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .option-with-dot.enrolled::before { background: #10b981; }
    .option-with-dot.completed::before { background: #3b82f6; }
    .option-with-dot.dropped::before { background: #f97316; }
    .option-with-dot.withdrawn::before { background: #ef4444; }
    .option-with-dot.waitlisted::before { background: #eab308; }
    .option-with-dot.failed::before { background: #dc2626; }

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
      padding: 0 4px;
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

    .filter-indicator {
      color: #6366f1;
      font-weight: 500;
    }

    .header-actions {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    /* Active Filters */
    .active-filters {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      padding: 0 4px;
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

    .filter-chip.status-enrolled { background: #d1fae5; color: #065f46; }
    .filter-chip.status-completed { background: #dbeafe; color: #1e40af; }
    .filter-chip.status-dropped { background: #ffedd5; color: #9a3412; }
    .filter-chip.status-withdrawn { background: #fee2e2; color: #991b1b; }
    .filter-chip.status-waitlisted { background: #fef3c7; color: #92400e; }
    .filter-chip.status-failed { background: #fee2e2; color: #991b1b; }

    .filter-chip.grade-chip { background: #ede9fe; color: #6d28d9; }
    .filter-chip.student-chip { background: #dbeafe; color: #1e40af; }
    .filter-chip.course-chip { background: #fef3c7; color: #92400e; }

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

    .enrollment-row {
      cursor: pointer;
      transition: background-color 0.15s ease;
    }

    .enrollment-row:hover {
      background-color: #f9fafb;
    }

    /* Student Cell */
    .student-cell {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 0;
    }

    .student-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 600;
      flex-shrink: 0;
    }

    .student-info {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .student-name {
      font-weight: 500;
      color: #111827;
      font-size: 14px;
    }

    .student-id {
      font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
      font-size: 12px;
      color: #6b7280;
    }

    /* Course Cell */
    .course-cell {
      display: flex;
      flex-direction: column;
    }

    .course-code {
      font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
      font-weight: 600;
      color: #6366f1;
      font-size: 13px;
    }

    .course-name {
      font-size: 13px;
      color: #6b7280;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 180px;
    }

    .section-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 4px 10px;
      background: #f3f4f6;
      border-radius: 6px;
      font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
      font-size: 13px;
      font-weight: 500;
      color: #374151;
    }

    .term-name {
      color: #4b5563;
      font-size: 14px;
    }

    .date-text {
      color: #6b7280;
      font-size: 13px;
    }

    /* Status Badge */
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }

    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
    }

    .status-badge.enrolled { background: #d1fae5; color: #065f46; }
    .status-badge.completed { background: #dbeafe; color: #1e40af; }
    .status-badge.dropped { background: #ffedd5; color: #9a3412; }
    .status-badge.withdrawn { background: #fee2e2; color: #991b1b; }
    .status-badge.waitlisted { background: #fef3c7; color: #92400e; }
    .status-badge.failed { background: #fee2e2; color: #991b1b; }

    /* Grade Cell */
    .grade-cell {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .grade-value {
      font-size: 16px;
      font-weight: 700;
    }

    .grade-value.grade-a { color: #059669; }
    .grade-value.grade-b { color: #2563eb; }
    .grade-value.grade-c { color: #d97706; }
    .grade-value.grade-d { color: #ea580c; }
    .grade-value.grade-f { color: #dc2626; }
    .grade-value.grade-other { color: #6b7280; }

    .finalized-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: #10b981;
    }

    .no-grade {
      color: #d1d5db;
      font-size: 14px;
    }

    .actions-btn {
      opacity: 0.6;
      transition: opacity 0.15s;
    }

    .enrollment-row:hover .actions-btn {
      opacity: 1;
    }

    .drop-action {
      color: #f97316 !important;
    }

    .drop-action mat-icon {
      color: #f97316 !important;
    }

    .withdraw-action {
      color: #dc2626 !important;
    }

    .withdraw-action mat-icon {
      color: #dc2626 !important;
    }

    /* States */
    .loading-state,
    .error-state,
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

    .error-state mat-icon,
    .empty-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
    }

    .error-state mat-icon {
      color: #ef4444;
    }

    .empty-state mat-icon {
      color: #9ca3af;
    }

    .error-state h3,
    .empty-state h3 {
      font-size: 18px;
      font-weight: 600;
      color: #111827;
      margin: 0 0 8px 0;
    }

    .error-state p,
    .empty-state p {
      color: #6b7280;
      margin: 0 0 24px 0;
    }

    /* Paginator */
    mat-paginator {
      border-top: 1px solid #e5e7eb;
    }

    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      .filter-sidebar,
      .table-card {
        background: #1f2937;
      }

      .sidebar-header {
        border-color: #374151;
      }

      .sidebar-title {
        color: #f3f4f6;
      }

      .filter-label {
        color: #9ca3af;
      }

      .page-title {
        color: #f9fafb;
      }

      .mat-mdc-header-row {
        background: #111827;
      }

      .mat-mdc-header-cell {
        color: #d1d5db;
      }

      .enrollment-row:hover {
        background-color: #374151;
      }

      .student-name,
      .course-code {
        color: #f9fafb;
      }

      mat-paginator {
        border-color: #374151;
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
    }
  `]
})
export class EnrollmentListComponent implements OnInit {
  private readonly enrollmentService = inject(EnrollmentService);
  private readonly notificationService = inject(NotificationService);
  private readonly route = inject(ActivatedRoute);

  displayedColumns = ['student', 'course', 'sectionNumber', 'termName', 'enrollmentDate', 'status', 'grade', 'actions'];

  enrollments = signal<EnrollmentListItem[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);
  totalCount = signal(0);
  pageSize = signal(10);
  pageIndex = signal(0);
  sortBy = signal('EnrollmentDate');
  sortDirection = signal<'asc' | 'desc'>('desc');
  sidebarCollapsed = signal(false);

  searchTerm = '';
  statusFilter = '';
  gradeFilter: boolean | '' = '';

  // Pre-filled filters from query params
  studentIdFilter = '';
  courseIdFilter = '';
  termIdFilter = '';

  toggleSidebar(): void {
    this.sidebarCollapsed.update(v => !v);
  }

  getInitials(name: string): string {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

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
        if (response.success) {
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
      'student': 'StudentName',
      'studentName': 'StudentName',
      'course': 'CourseCode',
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
      case 'Enrolled': return 'enrolled';
      case 'Completed': return 'completed';
      case 'Dropped': return 'dropped';
      case 'Withdrawn': return 'withdrawn';
      case 'Waitlisted': return 'waitlisted';
      case 'Failed': return 'failed';
      default: return '';
    }
  }

  getGradeClass(grade: string): string {
    if (['A', 'A+', 'A-'].includes(grade)) return 'grade-a';
    if (['B', 'B+', 'B-'].includes(grade)) return 'grade-b';
    if (['C', 'C+', 'C-'].includes(grade)) return 'grade-c';
    if (['D', 'D+', 'D-'].includes(grade)) return 'grade-d';
    if (['F', 'W', 'WF'].includes(grade)) return 'grade-f';
    return 'grade-other';
  }
}
