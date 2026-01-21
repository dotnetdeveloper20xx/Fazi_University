import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { EnrollmentService } from '../services/enrollment.service';
import { NotificationService } from '../../../core/services/notification.service';
import { StudentService } from '../../students/services/student.service';
import { StudentListItem, CourseSectionListItem } from '../../../models';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-enroll-student',
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
    MatProgressSpinnerModule,
    MatAutocompleteModule
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center gap-4">
        <button mat-icon-button routerLink="/enrollments">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Enroll Student</h1>
          <p class="text-gray-500 dark:text-gray-400">Register a student for a course section</p>
        </div>
      </div>

      @if (isLoading()) {
        <div class="flex items-center justify-center p-12">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else {
        <form [formGroup]="enrollForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <!-- Student Selection -->
          <mat-card class="p-6">
            <h2 class="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Select Student</h2>
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Student</mat-label>
              <mat-select formControlName="studentId">
                @for (student of students(); track student.id) {
                  <mat-option [value]="student.id">
                    <div class="flex items-center gap-2">
                      <span class="font-mono text-sm text-gray-500">{{ student.studentId }}</span>
                      <span>{{ student.fullName }}</span>
                      <span class="text-sm text-gray-400">- {{ student.email }}</span>
                    </div>
                  </mat-option>
                }
              </mat-select>
              @if (enrollForm.get('studentId')?.hasError('required') && enrollForm.get('studentId')?.touched) {
                <mat-error>Please select a student</mat-error>
              }
              <mat-hint>Select the student to enroll</mat-hint>
            </mat-form-field>
          </mat-card>

          <!-- Course Section Selection -->
          <mat-card class="p-6">
            <h2 class="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Select Course Section</h2>

            @if (sections().length === 0) {
              <div class="text-center py-8">
                <mat-icon class="text-5xl text-gray-400 mb-2">info</mat-icon>
                <p class="text-gray-500">No available sections with open seats found.</p>
              </div>
            } @else {
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Course Section</mat-label>
                <mat-select formControlName="courseSectionId">
                  @for (section of sections(); track section.id) {
                    <mat-option [value]="section.id" [disabled]="section.isCancelled">
                      <div class="flex items-center justify-between w-full">
                        <div>
                          <span class="font-mono font-medium">{{ section.courseCode }}</span>
                          <span class="mx-1">-</span>
                          <span>{{ section.courseName }}</span>
                          <span class="text-gray-500 ml-2">(Section {{ section.sectionNumber }})</span>
                        </div>
                        <div class="text-sm">
                          @if (section.isCancelled) {
                            <span class="text-red-500">Cancelled</span>
                          } @else if (!section.isOpen) {
                            <span class="text-orange-500">Closed</span>
                          } @else {
                            <span class="text-green-600">{{ section.availableSeats }} seats</span>
                          }
                        </div>
                      </div>
                    </mat-option>
                  }
                </mat-select>
                @if (enrollForm.get('courseSectionId')?.hasError('required') && enrollForm.get('courseSectionId')?.touched) {
                  <mat-error>Please select a course section</mat-error>
                }
              </mat-form-field>

              @if (selectedSection()) {
                <div class="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h4 class="font-medium text-gray-900 dark:text-gray-100 mb-2">Section Details</h4>
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span class="text-gray-500">Instructor:</span>
                      <span class="ml-1 text-gray-900 dark:text-gray-100">{{ selectedSection()!.instructorName || 'TBA' }}</span>
                    </div>
                    <div>
                      <span class="text-gray-500">Schedule:</span>
                      <span class="ml-1 text-gray-900 dark:text-gray-100">{{ selectedSection()!.schedule || 'TBA' }}</span>
                    </div>
                    <div>
                      <span class="text-gray-500">Room:</span>
                      <span class="ml-1 text-gray-900 dark:text-gray-100">{{ selectedSection()!.room || 'TBA' }}</span>
                    </div>
                    <div>
                      <span class="text-gray-500">Enrollment:</span>
                      <span class="ml-1 text-gray-900 dark:text-gray-100">{{ selectedSection()!.currentEnrollment }}/{{ selectedSection()!.maxEnrollment }}</span>
                    </div>
                  </div>
                </div>
              }
            }
          </mat-card>

          <!-- Notes -->
          <mat-card class="p-6">
            <h2 class="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Additional Information</h2>
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Notes (Optional)</mat-label>
              <textarea
                matInput
                formControlName="notes"
                rows="3"
                placeholder="Add any notes about this enrollment"
              ></textarea>
              <mat-hint>Optional notes for administrative purposes</mat-hint>
            </mat-form-field>
          </mat-card>

          <!-- Form Actions -->
          <div class="flex items-center justify-end gap-4">
            <button mat-stroked-button type="button" routerLink="/enrollments">
              Cancel
            </button>
            <button
              mat-flat-button
              color="primary"
              type="submit"
              [disabled]="isSaving() || enrollForm.invalid"
            >
              @if (isSaving()) {
                <mat-spinner diameter="20" class="inline-block mr-2"></mat-spinner>
              }
              <mat-icon>how_to_reg</mat-icon>
              Enroll Student
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
export class EnrollStudentComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly enrollmentService = inject(EnrollmentService);
  private readonly studentService = inject(StudentService);
  private readonly notificationService = inject(NotificationService);

  isLoading = signal(false);
  isSaving = signal(false);

  students = signal<StudentListItem[]>([]);
  sections = signal<CourseSectionListItem[]>([]);
  selectedSection = signal<CourseSectionListItem | null>(null);

  enrollForm: FormGroup = this.fb.group({
    studentId: ['', Validators.required],
    courseSectionId: ['', Validators.required],
    notes: ['']
  });

  ngOnInit(): void {
    this.loadData();

    // Watch for section selection changes
    this.enrollForm.get('courseSectionId')?.valueChanges.subscribe(sectionId => {
      const section = this.sections().find(s => s.id === sectionId);
      this.selectedSection.set(section || null);
    });

    // Pre-fill from query params
    const params = this.route.snapshot.queryParams;
    if (params['studentId']) {
      this.enrollForm.patchValue({ studentId: params['studentId'] });
    }
    if (params['sectionId']) {
      this.enrollForm.patchValue({ courseSectionId: params['sectionId'] });
    }
  }

  loadData(): void {
    this.isLoading.set(true);

    forkJoin({
      students: this.studentService.getStudents({ pageNumber: 1, pageSize: 500 }, { status: 'Active' }),
      sections: this.enrollmentService.getAvailableSections()
    }).subscribe({
      next: ({ students, sections }) => {
        this.students.set(students.data.items);
        this.sections.set(sections);
        this.isLoading.set(false);

        // Re-set selected section if pre-filled
        const sectionId = this.enrollForm.get('courseSectionId')?.value;
        if (sectionId) {
          const section = sections.find(s => s.id === sectionId);
          this.selectedSection.set(section || null);
        }
      },
      error: (err) => {
        this.notificationService.showError('Failed to load data');
        this.isLoading.set(false);
      }
    });
  }

  onSubmit(): void {
    if (this.enrollForm.invalid) {
      this.enrollForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const formValue = this.enrollForm.value;

    this.enrollmentService.enrollStudent({
      studentId: formValue.studentId,
      courseSectionId: formValue.courseSectionId,
      notes: formValue.notes || undefined
    }).subscribe({
      next: (enrollmentId) => {
        this.isSaving.set(false);
        this.notificationService.showSuccess('Student enrolled successfully');
        this.router.navigate(['/enrollments', enrollmentId]);
      },
      error: (err) => {
        this.isSaving.set(false);
        this.notificationService.showError(err.error?.message || 'Failed to enroll student');
      }
    });
  }
}
