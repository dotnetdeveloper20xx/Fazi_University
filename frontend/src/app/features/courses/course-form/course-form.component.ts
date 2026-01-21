import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { CourseService, DepartmentListItem } from '../services/course.service';
import { NotificationService } from '../../../core/services/notification.service';
import { CreateCourseRequest, UpdateCourseRequest, CourseListItem, CourseLevel } from '../../../models';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-course-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatChipsModule,
    MatAutocompleteModule
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center gap-4">
        <button mat-icon-button routerLink="/courses">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {{ isEditMode() ? 'Edit Course' : 'Add New Course' }}
          </h1>
          <p class="text-gray-500 dark:text-gray-400">
            {{ isEditMode() ? 'Update course information' : 'Create a new course in the catalog' }}
          </p>
        </div>
      </div>

      @if (isLoading()) {
        <div class="flex items-center justify-center p-12">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else {
        <form [formGroup]="courseForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <!-- Basic Information -->
          <mat-card class="p-6">
            <h2 class="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Basic Information</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <mat-form-field appearance="outline">
                <mat-label>Course Code</mat-label>
                <input
                  matInput
                  formControlName="code"
                  placeholder="e.g., CS101"
                  [readonly]="isEditMode()"
                >
                <mat-hint>Unique identifier for the course</mat-hint>
                @if (courseForm.get('code')?.hasError('required') && courseForm.get('code')?.touched) {
                  <mat-error>Course code is required</mat-error>
                }
                @if (courseForm.get('code')?.hasError('maxlength') && courseForm.get('code')?.touched) {
                  <mat-error>Course code cannot exceed 20 characters</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Course Name</mat-label>
                <input matInput formControlName="name" placeholder="e.g., Introduction to Computer Science">
                @if (courseForm.get('name')?.hasError('required') && courseForm.get('name')?.touched) {
                  <mat-error>Course name is required</mat-error>
                }
                @if (courseForm.get('name')?.hasError('maxlength') && courseForm.get('name')?.touched) {
                  <mat-error>Course name cannot exceed 200 characters</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="md:col-span-2">
                <mat-label>Description</mat-label>
                <textarea
                  matInput
                  formControlName="description"
                  placeholder="Describe the course content, objectives, and outcomes"
                  rows="4"
                ></textarea>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Department</mat-label>
                <mat-select formControlName="departmentId">
                  @for (dept of departments(); track dept.id) {
                    <mat-option [value]="dept.id">{{ dept.name }} ({{ dept.code }})</mat-option>
                  }
                </mat-select>
                @if (courseForm.get('departmentId')?.hasError('required') && courseForm.get('departmentId')?.touched) {
                  <mat-error>Department is required</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Level</mat-label>
                <mat-select formControlName="level">
                  <mat-option value="Undergraduate">Undergraduate</mat-option>
                  <mat-option value="Graduate">Graduate</mat-option>
                  <mat-option value="Doctoral">Doctoral</mat-option>
                  <mat-option value="Professional">Professional</mat-option>
                </mat-select>
                @if (courseForm.get('level')?.hasError('required') && courseForm.get('level')?.touched) {
                  <mat-error>Level is required</mat-error>
                }
              </mat-form-field>
            </div>
          </mat-card>

          <!-- Credit Hours -->
          <mat-card class="p-6">
            <h2 class="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Credit Hours</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <mat-form-field appearance="outline">
                <mat-label>Credit Hours</mat-label>
                <input matInput type="number" formControlName="creditHours" min="0" max="12">
                <mat-hint>Total credits awarded</mat-hint>
                @if (courseForm.get('creditHours')?.hasError('required') && courseForm.get('creditHours')?.touched) {
                  <mat-error>Credit hours is required</mat-error>
                }
                @if (courseForm.get('creditHours')?.hasError('min') && courseForm.get('creditHours')?.touched) {
                  <mat-error>Credit hours must be at least 0</mat-error>
                }
                @if (courseForm.get('creditHours')?.hasError('max') && courseForm.get('creditHours')?.touched) {
                  <mat-error>Credit hours cannot exceed 12</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Lecture Hours</mat-label>
                <input matInput type="number" formControlName="lectureHours" min="0" max="10">
                <mat-hint>Weekly lecture hours</mat-hint>
                @if (courseForm.get('lectureHours')?.hasError('min') && courseForm.get('lectureHours')?.touched) {
                  <mat-error>Lecture hours must be at least 0</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Lab Hours</mat-label>
                <input matInput type="number" formControlName="labHours" min="0" max="10">
                <mat-hint>Weekly lab hours</mat-hint>
                @if (courseForm.get('labHours')?.hasError('min') && courseForm.get('labHours')?.touched) {
                  <mat-error>Lab hours must be at least 0</mat-error>
                }
              </mat-form-field>
            </div>
          </mat-card>

          <!-- Prerequisites (only for create mode) -->
          @if (!isEditMode()) {
            <mat-card class="p-6">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Prerequisites</h2>
                <button mat-stroked-button type="button" (click)="addPrerequisite()">
                  <mat-icon>add</mat-icon>
                  Add Prerequisite
                </button>
              </div>

              @if (prerequisitesArray.length === 0) {
                <p class="text-gray-500 dark:text-gray-400 text-center py-4">
                  No prerequisites added. This course will be open to all students.
                </p>
              } @else {
                <div class="space-y-4">
                  @for (prereq of prerequisitesArray.controls; track $index; let i = $index) {
                    <div class="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg" [formGroupName]="i">
                      <mat-form-field appearance="outline" class="flex-1">
                        <mat-label>Prerequisite Course</mat-label>
                        <mat-select formControlName="prerequisiteCourseId">
                          @for (course of availableCourses(); track course.id) {
                            <mat-option [value]="course.id">{{ course.code }} - {{ course.name }}</mat-option>
                          }
                        </mat-select>
                      </mat-form-field>

                      <mat-form-field appearance="outline" class="w-32">
                        <mat-label>Min Grade</mat-label>
                        <mat-select formControlName="minimumGrade">
                          <mat-option value="">Any</mat-option>
                          <mat-option value="A">A</mat-option>
                          <mat-option value="B">B</mat-option>
                          <mat-option value="C">C</mat-option>
                          <mat-option value="D">D</mat-option>
                        </mat-select>
                      </mat-form-field>

                      <mat-checkbox formControlName="isConcurrent" class="mt-4">
                        Concurrent allowed
                      </mat-checkbox>

                      <button mat-icon-button type="button" color="warn" (click)="removePrerequisite(i)" class="mt-2">
                        <mat-icon>delete</mat-icon>
                      </button>
                    </div>
                  }
                </div>
              }
            </mat-card>
          }

          <!-- Status (only for edit mode) -->
          @if (isEditMode()) {
            <mat-card class="p-6">
              <h2 class="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Status</h2>
              <mat-checkbox formControlName="isActive" color="primary">
                Course is active
              </mat-checkbox>
              <p class="text-sm text-gray-500 mt-2">
                Inactive courses will not be available for new section creation or enrollment.
              </p>
            </mat-card>
          }

          <!-- Form Actions -->
          <div class="flex items-center justify-end gap-4">
            <button mat-stroked-button type="button" routerLink="/courses">
              Cancel
            </button>
            <button
              mat-flat-button
              color="primary"
              type="submit"
              [disabled]="isSaving() || courseForm.invalid"
            >
              @if (isSaving()) {
                <mat-spinner diameter="20" class="inline-block mr-2"></mat-spinner>
              }
              {{ isEditMode() ? 'Update Course' : 'Create Course' }}
            </button>
          </div>
        </form>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class CourseFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly courseService = inject(CourseService);
  private readonly notificationService = inject(NotificationService);

  isEditMode = signal(false);
  isLoading = signal(false);
  isSaving = signal(false);
  courseId = signal<string | null>(null);

  departments = signal<DepartmentListItem[]>([]);
  availableCourses = signal<CourseListItem[]>([]);

  courseForm: FormGroup = this.fb.group({
    code: ['', [Validators.required, Validators.maxLength(20)]],
    name: ['', [Validators.required, Validators.maxLength(200)]],
    description: [''],
    departmentId: ['', Validators.required],
    level: ['Undergraduate', Validators.required],
    creditHours: [3, [Validators.required, Validators.min(0), Validators.max(12)]],
    lectureHours: [3, [Validators.min(0), Validators.max(10)]],
    labHours: [0, [Validators.min(0), Validators.max(10)]],
    isActive: [true],
    prerequisites: this.fb.array([])
  });

  get prerequisitesArray(): FormArray {
    return this.courseForm.get('prerequisites') as FormArray;
  }

  ngOnInit(): void {
    this.loadDropdownData();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.courseId.set(id);
      this.isEditMode.set(true);
      this.loadCourse(id);
    }
  }

  loadDropdownData(): void {
    this.isLoading.set(true);

    forkJoin({
      departments: this.courseService.getDepartments(),
      courses: this.courseService.getAllCourses()
    }).subscribe({
      next: ({ departments, courses }) => {
        this.departments.set(departments);
        this.availableCourses.set(courses);
        if (!this.isEditMode()) {
          this.isLoading.set(false);
        }
      },
      error: (err) => {
        this.notificationService.showError('Failed to load form data');
        this.isLoading.set(false);
      }
    });
  }

  loadCourse(id: string): void {
    this.courseService.getCourse(id).subscribe({
      next: (course) => {
        this.courseForm.patchValue({
          code: course.code,
          name: course.name,
          description: course.description,
          departmentId: course.departmentId,
          level: course.level,
          creditHours: course.creditHours,
          lectureHours: course.lectureHours,
          labHours: course.labHours,
          isActive: course.isActive
        });
        this.isLoading.set(false);
      },
      error: (err) => {
        this.notificationService.showError('Failed to load course data');
        this.router.navigate(['/courses']);
      }
    });
  }

  addPrerequisite(): void {
    const prereqGroup = this.fb.group({
      prerequisiteCourseId: ['', Validators.required],
      minimumGrade: [''],
      isConcurrent: [false]
    });
    this.prerequisitesArray.push(prereqGroup);
  }

  removePrerequisite(index: number): void {
    this.prerequisitesArray.removeAt(index);
  }

  onSubmit(): void {
    if (this.courseForm.invalid) {
      this.courseForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const formValue = this.courseForm.value;

    if (this.isEditMode()) {
      const updateRequest: UpdateCourseRequest = {
        name: formValue.name,
        description: formValue.description || undefined,
        creditHours: formValue.creditHours,
        lectureHours: formValue.lectureHours,
        labHours: formValue.labHours,
        isActive: formValue.isActive
      };

      this.courseService.updateCourse(this.courseId()!, updateRequest).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.notificationService.showSuccess('Course updated successfully');
          this.router.navigate(['/courses', this.courseId()]);
        },
        error: (err) => {
          this.isSaving.set(false);
          this.notificationService.showError(err.error?.message || 'Failed to update course');
        }
      });
    } else {
      // Filter out empty prerequisites
      const prerequisites = formValue.prerequisites
        .filter((p: any) => p.prerequisiteCourseId)
        .map((p: any) => ({
          prerequisiteCourseId: p.prerequisiteCourseId,
          minimumGrade: p.minimumGrade || undefined,
          isConcurrent: p.isConcurrent
        }));

      const createRequest: CreateCourseRequest = {
        code: formValue.code,
        name: formValue.name,
        description: formValue.description || undefined,
        departmentId: formValue.departmentId,
        creditHours: formValue.creditHours,
        lectureHours: formValue.lectureHours,
        labHours: formValue.labHours,
        level: formValue.level as CourseLevel,
        prerequisites: prerequisites.length > 0 ? prerequisites : undefined
      };

      this.courseService.createCourse(createRequest).subscribe({
        next: (newId) => {
          this.isSaving.set(false);
          this.notificationService.showSuccess('Course created successfully');
          this.router.navigate(['/courses', newId]);
        },
        error: (err) => {
          this.isSaving.set(false);
          this.notificationService.showError(err.error?.message || 'Failed to create course');
        }
      });
    }
  }
}
