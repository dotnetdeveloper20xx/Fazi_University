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
    <div class="space-y-6">
      <!-- Page header -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Courses</h1>
          <p class="text-gray-500 dark:text-gray-400">Manage course catalog and information</p>
        </div>
        <a mat-flat-button color="primary" routerLink="/courses/new">
          <mat-icon>add</mat-icon>
          Add Course
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
                placeholder="Search by code or name"
                (keyup.enter)="applyFilters()"
              >
              <mat-icon matPrefix>search</mat-icon>
              @if (searchTerm) {
                <button matSuffix mat-icon-button (click)="searchTerm = ''; applyFilters()">
                  <mat-icon>close</mat-icon>
                </button>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="min-w-[140px]">
              <mat-select [(ngModel)]="levelFilter" (selectionChange)="applyFilters()" placeholder="Level">
                <mat-option value="">All Levels</mat-option>
                <mat-option value="Undergraduate">Undergraduate</mat-option>
                <mat-option value="Graduate">Graduate</mat-option>
                <mat-option value="Doctoral">Doctoral</mat-option>
                <mat-option value="Professional">Professional</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="min-w-[100px]">
              <mat-select [(ngModel)]="activeFilter" (selectionChange)="applyFilters()" placeholder="Status">
                <mat-option value="">All Status</mat-option>
                <mat-option [value]="true">Active</mat-option>
                <mat-option [value]="false">Inactive</mat-option>
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
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Error Loading Courses</h3>
            <p class="text-gray-500 dark:text-gray-400 mb-4">{{ error() }}</p>
            <button mat-flat-button color="primary" (click)="loadCourses()">
              <mat-icon>refresh</mat-icon>
              Try Again
            </button>
          </div>
        } @else if (courses().length === 0) {
          <div class="flex flex-col items-center justify-center p-12 text-center">
            <mat-icon class="text-5xl text-gray-400 mb-4">menu_book</mat-icon>
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Courses Found</h3>
            <p class="text-gray-500 dark:text-gray-400 mb-4">
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
          <div class="overflow-x-auto">
            <table mat-table [dataSource]="courses()" matSort (matSortChange)="onSort($event)" class="w-full">
              <!-- Code Column -->
              <ng-container matColumnDef="code">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Code</th>
                <td mat-cell *matCellDef="let course">
                  <span class="font-mono font-medium text-primary-600 dark:text-primary-400">{{ course.code }}</span>
                </td>
              </ng-container>

              <!-- Name Column -->
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Name</th>
                <td mat-cell *matCellDef="let course">
                  <div class="font-medium truncate max-w-[300px]" [matTooltip]="course.name">
                    {{ course.name }}
                  </div>
                </td>
              </ng-container>

              <!-- Department Column -->
              <ng-container matColumnDef="departmentName">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Department</th>
                <td mat-cell *matCellDef="let course">
                  <div class="truncate max-w-[180px]" [matTooltip]="course.departmentName">
                    {{ course.departmentName }}
                  </div>
                </td>
              </ng-container>

              <!-- Credits Column -->
              <ng-container matColumnDef="creditHours">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Credits</th>
                <td mat-cell *matCellDef="let course">
                  <span class="font-medium">{{ course.creditHours }}</span>
                </td>
              </ng-container>

              <!-- Level Column -->
              <ng-container matColumnDef="level">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Level</th>
                <td mat-cell *matCellDef="let course">
                  <span
                    class="px-2 py-1 rounded-full text-xs font-medium"
                    [class]="getLevelClass(course.level)"
                  >
                    {{ course.level }}
                  </span>
                </td>
              </ng-container>

              <!-- Sections Column -->
              <ng-container matColumnDef="sectionCount">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Sections</th>
                <td mat-cell *matCellDef="let course">
                  <span class="text-gray-600 dark:text-gray-400">{{ course.sectionCount }}</span>
                </td>
              </ng-container>

              <!-- Status Column -->
              <ng-container matColumnDef="isActive">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
                <td mat-cell *matCellDef="let course">
                  <span
                    class="px-2 py-1 rounded-full text-xs font-medium"
                    [class]="course.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'"
                  >
                    {{ course.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef class="w-16">Actions</th>
                <td mat-cell *matCellDef="let course">
                  <button mat-icon-button [matMenuTriggerFor]="menu" (click)="$event.stopPropagation()">
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
                    <button mat-menu-item class="text-red-600" (click)="confirmDelete(course)">
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
export class CourseListComponent implements OnInit {
  private readonly courseService = inject(CourseService);
  private readonly notificationService = inject(NotificationService);

  displayedColumns = ['code', 'name', 'departmentName', 'creditHours', 'level', 'sectionCount', 'isActive', 'actions'];

  courses = signal<CourseListItem[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);
  totalCount = signal(0);
  pageSize = signal(10);
  pageIndex = signal(0);
  sortBy = signal('Code');
  sortDirection = signal<'asc' | 'desc'>('asc');

  searchTerm = '';
  levelFilter = '';
  activeFilter: boolean | '' = '';

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
        if (response.succeeded) {
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
    this.activeFilter = '';
    this.pageIndex.set(0);
    this.loadCourses();
  }

  hasActiveFilters(): boolean {
    return !!(this.searchTerm || this.levelFilter || this.activeFilter !== '');
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
}
