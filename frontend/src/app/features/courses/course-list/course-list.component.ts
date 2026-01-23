import { Component, inject, signal, OnInit } from '@angular/core';
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
import { CourseService } from '../services/course.service';
import { NotificationService } from '../../../core/services/notification.service';
import { CourseListItem, CourseLevel, CourseListFilter } from '../../../models';

@Component({
  selector: 'app-course-list',
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
    <div class="course-list-container">
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
                  placeholder="Code or name..."
                  (keyup.enter)="applyFilters()"
                >
                @if (searchTerm) {
                  <button matSuffix mat-icon-button (click)="searchTerm = ''; applyFilters()" class="clear-btn">
                    <mat-icon>close</mat-icon>
                  </button>
                }
              </mat-form-field>
            </div>

            <!-- Level Filter -->
            <div class="filter-section">
              <label class="filter-label">Level</label>
              <mat-form-field appearance="outline" class="w-full filter-field">
                <mat-select [(ngModel)]="levelFilter" (selectionChange)="applyFilters()">
                  <mat-option value="">All Levels</mat-option>
                  <mat-option value="Undergraduate">Undergraduate</mat-option>
                  <mat-option value="Graduate">Graduate</mat-option>
                  <mat-option value="Doctoral">Doctoral</mat-option>
                  <mat-option value="Professional">Professional</mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <!-- Credit Hours Filter -->
            <div class="filter-section">
              <label class="filter-label">Credit Hours</label>
              <mat-form-field appearance="outline" class="w-full filter-field">
                <mat-select [(ngModel)]="creditsFilter" (selectionChange)="applyFilters()">
                  <mat-option value="">Any Credits</mat-option>
                  <mat-option value="1">1 Credit</mat-option>
                  <mat-option value="2">2 Credits</mat-option>
                  <mat-option value="3">3 Credits</mat-option>
                  <mat-option value="4">4 Credits</mat-option>
                  <mat-option value="5+">5+ Credits</mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <!-- Status Filter -->
            <div class="filter-section">
              <label class="filter-label">Status</label>
              <mat-form-field appearance="outline" class="w-full filter-field">
                <mat-select [(ngModel)]="activeFilter" (selectionChange)="applyFilters()">
                  <mat-option value="">All Status</mat-option>
                  <mat-option [value]="true">Active</mat-option>
                  <mat-option [value]="false">Inactive</mat-option>
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
              <h1 class="page-title">Course Catalog</h1>
              <p class="page-subtitle">
                {{ totalCount() }} courses
                @if (hasActiveFilters()) {
                  <span class="filter-indicator">(filtered)</span>
                }
              </p>
            </div>
            <div class="header-actions">
              <button mat-stroked-button (click)="loadCourses()" matTooltip="Refresh list">
                <mat-icon>refresh</mat-icon>
              </button>
              <a mat-flat-button color="primary" routerLink="/courses/new">
                <mat-icon>add</mat-icon>
                Add Course
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
              @if (levelFilter) {
                <span class="filter-chip level-chip">
                  {{ levelFilter }}
                  <button mat-icon-button (click)="levelFilter = ''; applyFilters()">
                    <mat-icon>close</mat-icon>
                  </button>
                </span>
              }
              @if (creditsFilter) {
                <span class="filter-chip credits-chip">
                  {{ creditsFilter }} {{ creditsFilter === '5+' ? '' : 'Credit(s)' }}
                  <button mat-icon-button (click)="creditsFilter = ''; applyFilters()">
                    <mat-icon>close</mat-icon>
                  </button>
                </span>
              }
              @if (activeFilter !== '') {
                <span class="filter-chip status-chip">
                  {{ activeFilter ? 'Active' : 'Inactive' }}
                  <button mat-icon-button (click)="activeFilter = ''; applyFilters()">
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
                <p>Loading courses...</p>
              </div>
            } @else if (error()) {
              <div class="error-state">
                <mat-icon>error_outline</mat-icon>
                <h3>Error Loading Courses</h3>
                <p>{{ error() }}</p>
                <button mat-flat-button color="primary" (click)="loadCourses()">
                  <mat-icon>refresh</mat-icon>
                  Try Again
                </button>
              </div>
            } @else if (courses().length === 0) {
              <div class="empty-state">
                <mat-icon>menu_book</mat-icon>
                <h3>No Courses Found</h3>
                <p>
                  @if (hasActiveFilters()) {
                    No courses match your current filters.
                  } @else {
                    Get started by adding your first course.
                  }
                </p>
                @if (hasActiveFilters()) {
                  <button mat-stroked-button (click)="clearFilters()">
                    Clear Filters
                  </button>
                } @else {
                  <a mat-flat-button color="primary" routerLink="/courses/new">
                    <mat-icon>add</mat-icon>
                    Add Course
                  </a>
                }
              </div>
            } @else {
              <div class="table-container">
                <table mat-table [dataSource]="courses()" matSort (matSortChange)="onSort($event)">
                  <!-- Course Info Column (Code + Name combined) -->
                  <ng-container matColumnDef="course">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header="code">Course</th>
                    <td mat-cell *matCellDef="let course">
                      <div class="course-cell">
                        <div class="course-icon" [class]="getLevelIconClass(course.level)">
                          <mat-icon>menu_book</mat-icon>
                        </div>
                        <div class="course-info">
                          <span class="course-code">{{ course.code }}</span>
                          <span class="course-name" [matTooltip]="course.name">{{ course.name }}</span>
                        </div>
                      </div>
                    </td>
                  </ng-container>

                  <!-- Department Column -->
                  <ng-container matColumnDef="departmentName">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>Department</th>
                    <td mat-cell *matCellDef="let course">
                      <span class="department-name" [matTooltip]="course.departmentName">
                        {{ course.departmentName }}
                      </span>
                    </td>
                  </ng-container>

                  <!-- Credits Column -->
                  <ng-container matColumnDef="creditHours">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>Credits</th>
                    <td mat-cell *matCellDef="let course">
                      <span class="credits-badge">{{ course.creditHours }}</span>
                    </td>
                  </ng-container>

                  <!-- Level Column -->
                  <ng-container matColumnDef="level">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>Level</th>
                    <td mat-cell *matCellDef="let course">
                      <span class="level-badge" [class]="getLevelClass(course.level)">
                        {{ course.level }}
                      </span>
                    </td>
                  </ng-container>

                  <!-- Sections Column -->
                  <ng-container matColumnDef="sectionCount">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>Sections</th>
                    <td mat-cell *matCellDef="let course">
                      <span class="sections-count">
                        <mat-icon class="sections-icon">class</mat-icon>
                        {{ course.sectionCount }}
                      </span>
                    </td>
                  </ng-container>

                  <!-- Status Column -->
                  <ng-container matColumnDef="isActive">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
                    <td mat-cell *matCellDef="let course">
                      <span class="status-badge" [class.active]="course.isActive" [class.inactive]="!course.isActive">
                        <span class="status-dot"></span>
                        {{ course.isActive ? 'Active' : 'Inactive' }}
                      </span>
                    </td>
                  </ng-container>

                  <!-- Actions Column -->
                  <ng-container matColumnDef="actions">
                    <th mat-header-cell *matHeaderCellDef></th>
                    <td mat-cell *matCellDef="let course">
                      <button mat-icon-button [matMenuTriggerFor]="menu" (click)="$event.stopPropagation()" class="actions-btn">
                        <mat-icon>more_vert</mat-icon>
                      </button>
                      <mat-menu #menu="matMenu">
                        <a mat-menu-item [routerLink]="['/courses', course.id]">
                          <mat-icon>visibility</mat-icon>
                          <span>View Details</span>
                        </a>
                        <a mat-menu-item [routerLink]="['/courses', course.id, 'edit']">
                          <mat-icon>edit</mat-icon>
                          <span>Edit</span>
                        </a>
                        <a mat-menu-item [routerLink]="['/courses', course.id, 'sections']">
                          <mat-icon>class</mat-icon>
                          <span>Manage Sections</span>
                        </a>
                        <mat-divider></mat-divider>
                        <button mat-menu-item class="delete-action" (click)="confirmDelete(course)">
                          <mat-icon>delete</mat-icon>
                          <span>Delete</span>
                        </button>
                      </mat-menu>
                    </td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                  <tr
                    mat-row
                    *matRowDef="let row; columns: displayedColumns;"
                    class="course-row"
                    [routerLink]="['/courses', row.id]"
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

    .course-list-container {
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

    .filter-chip.level-chip {
      background: #ede9fe;
      color: #6d28d9;
    }

    .filter-chip.credits-chip {
      background: #fef3c7;
      color: #92400e;
    }

    .filter-chip.status-chip {
      background: #d1fae5;
      color: #065f46;
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

    .course-row {
      cursor: pointer;
      transition: background-color 0.15s ease;
    }

    .course-row:hover {
      background-color: #f9fafb;
    }

    /* Course Cell */
    .course-cell {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 0;
    }

    .course-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .course-icon mat-icon {
      color: white;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .course-icon.undergraduate { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
    .course-icon.graduate { background: linear-gradient(135deg, #8b5cf6, #6d28d9); }
    .course-icon.doctoral { background: linear-gradient(135deg, #6366f1, #4338ca); }
    .course-icon.professional { background: linear-gradient(135deg, #14b8a6, #0d9488); }
    .course-icon.default { background: linear-gradient(135deg, #6b7280, #4b5563); }

    .course-info {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .course-code {
      font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
      font-weight: 600;
      color: #6366f1;
      font-size: 13px;
    }

    .course-name {
      color: #111827;
      font-weight: 500;
      font-size: 14px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 280px;
    }

    .department-name {
      color: #4b5563;
      font-size: 14px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 180px;
      display: block;
    }

    .credits-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      background: #f3f4f6;
      border-radius: 6px;
      font-weight: 600;
      color: #374151;
      font-size: 14px;
    }

    .level-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }

    .level-badge.bg-blue-100 { background: #dbeafe; color: #1d4ed8; }
    .level-badge.bg-purple-100 { background: #ede9fe; color: #6d28d9; }
    .level-badge.bg-indigo-100 { background: #e0e7ff; color: #4338ca; }
    .level-badge.bg-teal-100 { background: #ccfbf1; color: #0d9488; }

    .sections-count {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      color: #6b7280;
      font-size: 14px;
    }

    .sections-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: #9ca3af;
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

    .actions-btn {
      opacity: 0.6;
      transition: opacity 0.15s;
    }

    .course-row:hover .actions-btn {
      opacity: 1;
    }

    .delete-action {
      color: #dc2626 !important;
    }

    .delete-action mat-icon {
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

      .course-row:hover {
        background-color: #374151;
      }

      .course-name {
        color: #f9fafb;
      }

      .department-name {
        color: #d1d5db;
      }

      .credits-badge {
        background: #374151;
        color: #e5e7eb;
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
export class CourseListComponent implements OnInit {
  private readonly courseService = inject(CourseService);
  private readonly notificationService = inject(NotificationService);

  displayedColumns = ['course', 'departmentName', 'creditHours', 'level', 'sectionCount', 'isActive', 'actions'];

  courses = signal<CourseListItem[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);
  totalCount = signal(0);
  pageSize = signal(10);
  pageIndex = signal(0);
  sortBy = signal('Code');
  sortDirection = signal<'asc' | 'desc'>('asc');
  sidebarCollapsed = signal(false);

  searchTerm = '';
  levelFilter = '';
  creditsFilter = '';
  activeFilter: boolean | '' = '';

  toggleSidebar(): void {
    this.sidebarCollapsed.update(v => !v);
  }

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.isLoading.set(true);
    this.error.set(null);

    const filter: CourseListFilter = {};
    if (this.levelFilter) filter.level = this.levelFilter as CourseLevel;
    if (this.activeFilter !== '') filter.isActive = this.activeFilter;

    this.courseService.getCourses(
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
          this.courses.set(response.data.items);
          this.totalCount.set(response.data.totalCount);
        } else {
          this.error.set(response.errors?.join(', ') || 'Failed to load courses');
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Failed to load courses');
        this.isLoading.set(false);
      }
    });
  }

  applyFilters(): void {
    this.pageIndex.set(0);
    this.loadCourses();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.levelFilter = '';
    this.creditsFilter = '';
    this.activeFilter = '';
    this.pageIndex.set(0);
    this.loadCourses();
  }

  hasActiveFilters(): boolean {
    return !!(this.searchTerm || this.levelFilter || this.creditsFilter || this.activeFilter !== '');
  }

  onSort(sort: Sort): void {
    if (sort.direction) {
      this.sortBy.set(this.mapSortColumn(sort.active));
      this.sortDirection.set(sort.direction as 'asc' | 'desc');
    } else {
      this.sortBy.set('Code');
      this.sortDirection.set('asc');
    }
    this.loadCourses();
  }

  private mapSortColumn(column: string): string {
    const map: Record<string, string> = {
      'code': 'Code',
      'name': 'Name',
      'departmentName': 'DepartmentName',
      'creditHours': 'CreditHours',
      'level': 'Level',
      'sectionCount': 'SectionCount',
      'isActive': 'IsActive'
    };
    return map[column] || 'Code';
  }

  onPageChange(event: PageEvent): void {
    this.pageSize.set(event.pageSize);
    this.pageIndex.set(event.pageIndex);
    this.loadCourses();
  }

  confirmDelete(course: CourseListItem): void {
    if (confirm(`Are you sure you want to delete "${course.code} - ${course.name}"? This action cannot be undone.`)) {
      this.courseService.deleteCourse(course.id).subscribe({
        next: () => {
          this.notificationService.showSuccess(`Course "${course.code}" has been deleted`);
          this.loadCourses();
        },
        error: (err) => {
          this.notificationService.showError(err.error?.message || 'Failed to delete course');
        }
      });
    }
  }

  getLevelClass(level: CourseLevel): string {
    switch (level) {
      case 'Undergraduate':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Graduate':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'Doctoral':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      case 'Professional':
        return 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  }

  getLevelIconClass(level: CourseLevel): string {
    switch (level) {
      case 'Undergraduate':
        return 'undergraduate';
      case 'Graduate':
        return 'graduate';
      case 'Doctoral':
        return 'doctoral';
      case 'Professional':
        return 'professional';
      default:
        return 'default';
    }
  }
}
