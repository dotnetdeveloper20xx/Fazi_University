import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { CourseService } from '../services/course.service';
import { NotificationService } from '../../../core/services/notification.service';
import { CourseDetail, CourseLevel, CoursePrerequisite } from '../../../models';

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatTableModule
  ],
  template: `
    @if (isLoading()) {
      <div class="flex items-center justify-center p-12">
        <mat-spinner diameter="40"></mat-spinner>
      </div>
    } @else if (error()) {
      <div class="flex flex-col items-center justify-center p-12 text-center">
        <mat-icon class="text-5xl text-red-500 mb-4">error_outline</mat-icon>
        <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Error Loading Course</h3>
        <p class="text-gray-500 dark:text-gray-400 mb-4">{{ error() }}</p>
        <div class="flex gap-2">
          <button mat-stroked-button routerLink="/courses">
            <mat-icon>arrow_back</mat-icon>
            Back to List
          </button>
          <button mat-flat-button color="primary" (click)="loadCourse()">
            <mat-icon>refresh</mat-icon>
            Try Again
          </button>
        </div>
      </div>
    } @else if (course()) {
      <div class="space-y-6">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div class="flex items-start gap-4">
            <button mat-icon-button routerLink="/courses" class="mt-1">
              <mat-icon>arrow_back</mat-icon>
            </button>
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 rounded-lg bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                <mat-icon class="text-3xl text-primary-700 dark:text-primary-300">menu_book</mat-icon>
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-mono text-lg font-bold text-primary-600 dark:text-primary-400">
                    {{ course()!.code }}
                  </span>
                  <span
                    class="px-2 py-0.5 rounded-full text-xs font-medium"
                    [class]="getLevelClass(course()!.level)"
                  >
                    {{ course()!.level }}
                  </span>
                  <span
                    class="px-2 py-0.5 rounded-full text-xs font-medium"
                    [class]="course()!.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'"
                  >
                    {{ course()!.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </div>
                <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {{ course()!.name }}
                </h1>
                <p class="text-gray-500 dark:text-gray-400 mt-1">{{ course()!.departmentName }}</p>
              </div>
            </div>
          </div>
          <div class="flex gap-2 ml-12 md:ml-0">
            <a mat-stroked-button [routerLink]="['/courses', course()!.id, 'edit']">
              <mat-icon>edit</mat-icon>
              Edit
            </a>
            <button mat-stroked-button color="warn" (click)="confirmDelete()">
              <mat-icon>delete</mat-icon>
              Delete
            </button>
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <mat-card class="p-4">
            <div class="text-sm text-gray-500">Credit Hours</div>
            <div class="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {{ course()!.creditHours }}
            </div>
          </mat-card>
          <mat-card class="p-4">
            <div class="text-sm text-gray-500">Lecture Hours</div>
            <div class="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {{ course()!.lectureHours }}
            </div>
          </mat-card>
          <mat-card class="p-4">
            <div class="text-sm text-gray-500">Lab Hours</div>
            <div class="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {{ course()!.labHours }}
            </div>
          </mat-card>
          <mat-card class="p-4">
            <div class="text-sm text-gray-500">Active Sections</div>
            <div class="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {{ course()!.sectionCount }}
            </div>
          </mat-card>
        </div>

        <!-- Tabs -->
        <mat-card>
          <mat-tab-group>
            <!-- Overview Tab -->
            <mat-tab label="Overview">
              <div class="p-6 space-y-6">
                @if (course()!.description) {
                  <div>
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Description</h3>
                    <p class="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{{ course()!.description }}</p>
                  </div>
                }

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="space-y-4">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Course Details</h3>
                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <label class="text-sm text-gray-500">Course Code</label>
                        <p class="text-gray-900 dark:text-gray-100 font-mono">{{ course()!.code }}</p>
                      </div>
                      <div>
                        <label class="text-sm text-gray-500">Level</label>
                        <p class="text-gray-900 dark:text-gray-100">{{ course()!.level }}</p>
                      </div>
                      <div>
                        <label class="text-sm text-gray-500">Credit Hours</label>
                        <p class="text-gray-900 dark:text-gray-100">{{ course()!.creditHours }}</p>
                      </div>
                      <div>
                        <label class="text-sm text-gray-500">Total Contact Hours</label>
                        <p class="text-gray-900 dark:text-gray-100">{{ course()!.lectureHours + course()!.labHours }}</p>
                      </div>
                    </div>
                  </div>

                  <div class="space-y-4">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Department Info</h3>
                    <div class="grid grid-cols-1 gap-4">
                      <div>
                        <label class="text-sm text-gray-500">Department</label>
                        <p class="text-gray-900 dark:text-gray-100">{{ course()!.departmentName }}</p>
                      </div>
                      <div>
                        <label class="text-sm text-gray-500">Status</label>
                        <span
                          class="px-2 py-1 rounded-full text-xs font-medium"
                          [class]="course()!.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
                        >
                          {{ course()!.isActive ? 'Active' : 'Inactive' }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </mat-tab>

            <!-- Prerequisites Tab -->
            <mat-tab label="Prerequisites">
              <div class="p-6">
                @if (course()!.prerequisites.length === 0) {
                  <div class="flex flex-col items-center justify-center py-12 text-center">
                    <mat-icon class="text-5xl text-gray-400 mb-4">checklist</mat-icon>
                    <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Prerequisites</h3>
                    <p class="text-gray-500 dark:text-gray-400">
                      This course has no prerequisite requirements.
                    </p>
                  </div>
                } @else {
                  <div class="space-y-4">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Required Prerequisites ({{ course()!.prerequisites.length }})
                    </h3>
                    <div class="overflow-x-auto">
                      <table mat-table [dataSource]="course()!.prerequisites" class="w-full">
                        <ng-container matColumnDef="courseCode">
                          <th mat-header-cell *matHeaderCellDef>Course Code</th>
                          <td mat-cell *matCellDef="let prereq">
                            <a
                              [routerLink]="['/courses', prereq.courseId]"
                              class="font-mono font-medium text-primary-600 dark:text-primary-400 hover:underline"
                            >
                              {{ prereq.courseCode }}
                            </a>
                          </td>
                        </ng-container>

                        <ng-container matColumnDef="courseName">
                          <th mat-header-cell *matHeaderCellDef>Course Name</th>
                          <td mat-cell *matCellDef="let prereq">{{ prereq.courseName }}</td>
                        </ng-container>

                        <ng-container matColumnDef="minimumGrade">
                          <th mat-header-cell *matHeaderCellDef>Minimum Grade</th>
                          <td mat-cell *matCellDef="let prereq">
                            <span class="font-medium">{{ prereq.minimumGrade || 'D' }}</span>
                          </td>
                        </ng-container>

                        <ng-container matColumnDef="isConcurrent">
                          <th mat-header-cell *matHeaderCellDef>Concurrent</th>
                          <td mat-cell *matCellDef="let prereq">
                            @if (prereq.isConcurrent) {
                              <mat-chip class="text-xs">Can be concurrent</mat-chip>
                            } @else {
                              <span class="text-gray-500">Must be completed</span>
                            }
                          </td>
                        </ng-container>

                        <tr mat-header-row *matHeaderRowDef="prerequisiteColumns"></tr>
                        <tr mat-row *matRowDef="let row; columns: prerequisiteColumns;"></tr>
                      </table>
                    </div>
                  </div>
                }
              </div>
            </mat-tab>

            <!-- Sections Tab -->
            <mat-tab label="Sections">
              <div class="p-6">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Course Sections ({{ course()!.sectionCount }})
                  </h3>
                  <a mat-flat-button color="primary" [routerLink]="['/courses', course()!.id, 'sections', 'new']">
                    <mat-icon>add</mat-icon>
                    Add Section
                  </a>
                </div>
                @if (course()!.sectionCount === 0) {
                  <div class="flex flex-col items-center justify-center py-12 text-center">
                    <mat-icon class="text-5xl text-gray-400 mb-4">class</mat-icon>
                    <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Sections</h3>
                    <p class="text-gray-500 dark:text-gray-400 mb-4">
                      This course doesn't have any active sections.
                    </p>
                    <a mat-flat-button color="primary" [routerLink]="['/courses', course()!.id, 'sections', 'new']">
                      <mat-icon>add</mat-icon>
                      Create First Section
                    </a>
                  </div>
                } @else {
                  <p class="text-gray-500 dark:text-gray-400">
                    View and manage course sections on the
                    <a
                      [routerLink]="['/courses', course()!.id, 'sections']"
                      class="text-primary-600 hover:underline"
                    >
                      Sections Management
                    </a>
                    page.
                  </p>
                }
              </div>
            </mat-tab>
          </mat-tab-group>
        </mat-card>

        <!-- Audit Information -->
        <mat-card class="p-4">
          <div class="flex items-center justify-between text-sm text-gray-500">
            <span>Created: {{ course()!.createdAt | date:'medium' }}</span>
          </div>
        </mat-card>
      </div>
    }
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class CourseDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly courseService = inject(CourseService);
  private readonly notificationService = inject(NotificationService);

  course = signal<CourseDetail | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);

  prerequisiteColumns = ['courseCode', 'courseName', 'minimumGrade', 'isConcurrent'];

  ngOnInit(): void {
    this.loadCourse();
  }

  loadCourse(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('Course ID not provided');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    this.courseService.getCourse(id).subscribe({
      next: (course) => {
        this.course.set(course);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load course');
        this.isLoading.set(false);
      }
    });
  }

  confirmDelete(): void {
    const c = this.course();
    if (!c) return;

    if (confirm(`Are you sure you want to delete "${c.code} - ${c.name}"? This action cannot be undone.`)) {
      this.courseService.deleteCourse(c.id).subscribe({
        next: () => {
          this.notificationService.showSuccess(`Course "${c.code}" has been deleted`);
          this.router.navigate(['/courses']);
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
