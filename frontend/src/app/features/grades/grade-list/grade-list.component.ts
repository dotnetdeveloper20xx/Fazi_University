import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { GradeService } from '../services/grade.service';
import { EnrollmentService } from '../../enrollments/services/enrollment.service';
import { NotificationService } from '../../../core/services/notification.service';
import {
  SectionEnrollment,
  CourseSectionListItem,
  SubmitGradeRequest,
  VALID_LETTER_GRADES
} from '../../../models';

interface GradeEntry extends SectionEnrollment {
  enrollmentId: string; // Alias for id from SectionEnrollment
  newGrade?: string;
  newNumericGrade?: number;
  isSaving?: boolean;
}

@Component({
  selector: 'app-grade-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatChipsModule
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Grade Management</h1>
          <p class="text-gray-500 dark:text-gray-400">Submit and manage grades by course section</p>
        </div>
        <div class="flex gap-2">
          <button mat-stroked-button routerLink="/grades/transcript">
            <mat-icon>assignment</mat-icon>
            View Transcripts
          </button>
        </div>
      </div>

      <!-- Section Selector -->
      <mat-card class="p-6">
        <h2 class="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Select Course Section</h2>
        <div class="flex flex-col md:flex-row gap-4">
          <mat-form-field appearance="outline" class="flex-1">
            <mat-label>Course Section</mat-label>
            <mat-select [(ngModel)]="selectedSectionId" (selectionChange)="onSectionChange()">
              @for (section of sections(); track section.id) {
                <mat-option [value]="section.id">
                  <span class="font-mono">{{ section.courseCode }}</span>
                  <span class="mx-1">-</span>
                  <span>{{ section.courseName }}</span>
                  <span class="text-gray-500 ml-2">(Section {{ section.sectionNumber }})</span>
                </mat-option>
              }
            </mat-select>
            <mat-hint>Select a section to view and manage grades</mat-hint>
          </mat-form-field>
          @if (selectedSection()) {
            <div class="flex items-center gap-4">
              <div class="text-sm">
                <span class="text-gray-500">Instructor:</span>
                <span class="ml-1 font-medium">{{ selectedSection()!.instructorName || 'TBA' }}</span>
              </div>
              <div class="text-sm">
                <span class="text-gray-500">Enrolled:</span>
                <span class="ml-1 font-medium">{{ selectedSection()!.currentEnrollment }}/{{ selectedSection()!.maxEnrollment }}</span>
              </div>
            </div>
          }
        </div>
      </mat-card>

      @if (isLoadingSections()) {
        <div class="flex items-center justify-center p-12">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else if (!selectedSectionId) {
        <mat-card class="p-12">
          <div class="text-center">
            <mat-icon class="text-5xl text-gray-400 mb-4">school</mat-icon>
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Select a Course Section</h3>
            <p class="text-gray-500">Choose a course section above to view and manage student grades.</p>
          </div>
        </mat-card>
      } @else if (isLoadingEnrollments()) {
        <div class="flex items-center justify-center p-12">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else if (enrollments().length === 0) {
        <mat-card class="p-12">
          <div class="text-center">
            <mat-icon class="text-5xl text-gray-400 mb-4">person_off</mat-icon>
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Students Enrolled</h3>
            <p class="text-gray-500">There are no students enrolled in this section.</p>
          </div>
        </mat-card>
      } @else {
        <!-- Grade Entry Table -->
        <mat-card class="overflow-hidden">
          <div class="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Student Grades ({{ enrollments().length }} students)
            </h3>
            <div class="flex gap-2">
              @if (hasUnsavedChanges()) {
                <button mat-stroked-button color="warn" (click)="resetChanges()">
                  <mat-icon>undo</mat-icon>
                  Reset Changes
                </button>
              }
              <button
                mat-flat-button
                color="primary"
                [disabled]="!canFinalizeGrades() || isFinalizing()"
                (click)="confirmFinalizeGrades()"
                matTooltip="Finalize all grades for this section"
              >
                @if (isFinalizing()) {
                  <mat-spinner diameter="20" class="inline-block mr-2"></mat-spinner>
                }
                <mat-icon>check_circle</mat-icon>
                Finalize All Grades
              </button>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table mat-table [dataSource]="enrollments()" class="w-full">
              <!-- Student ID Column -->
              <ng-container matColumnDef="studentId">
                <th mat-header-cell *matHeaderCellDef class="font-semibold">Student ID</th>
                <td mat-cell *matCellDef="let row">
                  <span class="font-mono text-sm">{{ row.studentId_Display }}</span>
                </td>
              </ng-container>

              <!-- Student Name Column -->
              <ng-container matColumnDef="studentName">
                <th mat-header-cell *matHeaderCellDef class="font-semibold">Student Name</th>
                <td mat-cell *matCellDef="let row">
                  <a [routerLink]="['/students', row.studentId]" class="text-primary-600 hover:underline">
                    {{ row.studentName }}
                  </a>
                </td>
              </ng-container>

              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef class="font-semibold">Status</th>
                <td mat-cell *matCellDef="let row">
                  <span
                    class="px-2 py-0.5 rounded-full text-xs font-medium"
                    [class]="getStatusClass(row.status)"
                  >
                    {{ row.status }}
                  </span>
                </td>
              </ng-container>

              <!-- Attendance Column -->
              <ng-container matColumnDef="attendance">
                <th mat-header-cell *matHeaderCellDef class="font-semibold">Attendance</th>
                <td mat-cell *matCellDef="let row">
                  @if (row.attendancePercentage !== null && row.attendancePercentage !== undefined) {
                    <span [class]="getAttendanceClass(row.attendancePercentage)">
                      {{ row.attendancePercentage }}%
                    </span>
                  } @else {
                    <span class="text-gray-400">--</span>
                  }
                </td>
              </ng-container>

              <!-- Current Grade Column -->
              <ng-container matColumnDef="currentGrade">
                <th mat-header-cell *matHeaderCellDef class="font-semibold">Current Grade</th>
                <td mat-cell *matCellDef="let row">
                  @if (row.grade) {
                    <span class="font-bold" [class]="getGradeTextClass(row.grade)">{{ row.grade }}</span>
                    @if (row.numericGrade !== null) {
                      <span class="text-gray-500 text-sm ml-1">({{ row.numericGrade | number:'1.1-1' }}%)</span>
                    }
                    @if (row.isGradeFinalized) {
                      <mat-icon class="text-green-600 text-sm ml-1" matTooltip="Grade finalized">check_circle</mat-icon>
                    }
                  } @else {
                    <span class="text-gray-400">Not graded</span>
                  }
                </td>
              </ng-container>

              <!-- Grade Entry Column -->
              <ng-container matColumnDef="gradeEntry">
                <th mat-header-cell *matHeaderCellDef class="font-semibold">Enter Grade</th>
                <td mat-cell *matCellDef="let row">
                  @if (row.status === 'Enrolled' && !row.isGradeFinalized) {
                    <div class="flex items-center gap-2">
                      <mat-form-field appearance="outline" class="w-24">
                        <mat-label>Grade</mat-label>
                        <mat-select [(ngModel)]="row.newGrade">
                          @for (grade of validGrades; track grade) {
                            <mat-option [value]="grade">{{ grade }}</mat-option>
                          }
                        </mat-select>
                      </mat-form-field>
                      <mat-form-field appearance="outline" class="w-20">
                        <input
                          matInput
                          type="number"
                          [(ngModel)]="row.newNumericGrade"
                          placeholder="%"
                          min="0"
                          max="100"
                        />
                      </mat-form-field>
                    </div>
                  } @else if (row.isGradeFinalized) {
                    <span class="text-gray-400 text-sm italic">Finalized</span>
                  } @else {
                    <span class="text-gray-400 text-sm italic">{{ row.status }}</span>
                  }
                </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef class="font-semibold">Actions</th>
                <td mat-cell *matCellDef="let row">
                  @if (row.status === 'Enrolled' && !row.isGradeFinalized && row.newGrade) {
                    <button
                      mat-icon-button
                      color="primary"
                      (click)="submitGrade(row)"
                      [disabled]="row.isSaving"
                      matTooltip="Save grade"
                    >
                      @if (row.isSaving) {
                        <mat-spinner diameter="20"></mat-spinner>
                      } @else {
                        <mat-icon>save</mat-icon>
                      }
                    </button>
                  }
                  <button
                    mat-icon-button
                    [routerLink]="['/enrollments', row.enrollmentId]"
                    matTooltip="View enrollment details"
                  >
                    <mat-icon>visibility</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          </div>
        </mat-card>

        <!-- Grade Statistics -->
        @if (enrollments().length > 0) {
          <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
            <mat-card class="p-4 text-center">
              <div class="text-3xl font-bold text-green-600">{{ getGradeCount(['A+', 'A', 'A-']) }}</div>
              <div class="text-sm text-gray-500">A Grades</div>
            </mat-card>
            <mat-card class="p-4 text-center">
              <div class="text-3xl font-bold text-blue-600">{{ getGradeCount(['B+', 'B', 'B-']) }}</div>
              <div class="text-sm text-gray-500">B Grades</div>
            </mat-card>
            <mat-card class="p-4 text-center">
              <div class="text-3xl font-bold text-yellow-600">{{ getGradeCount(['C+', 'C', 'C-']) }}</div>
              <div class="text-sm text-gray-500">C Grades</div>
            </mat-card>
            <mat-card class="p-4 text-center">
              <div class="text-3xl font-bold text-orange-600">{{ getGradeCount(['D+', 'D', 'D-']) }}</div>
              <div class="text-sm text-gray-500">D Grades</div>
            </mat-card>
            <mat-card class="p-4 text-center">
              <div class="text-3xl font-bold text-red-600">{{ getGradeCount(['F']) }}</div>
              <div class="text-sm text-gray-500">F Grades</div>
            </mat-card>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .mat-mdc-form-field {
      font-size: 14px;
    }
  `]
})
export class GradeListComponent implements OnInit {
  private readonly gradeService = inject(GradeService);
  private readonly enrollmentService = inject(EnrollmentService);
  private readonly notificationService = inject(NotificationService);

  sections = signal<CourseSectionListItem[]>([]);
  enrollments = signal<GradeEntry[]>([]);
  selectedSection = signal<CourseSectionListItem | null>(null);

  isLoadingSections = signal(false);
  isLoadingEnrollments = signal(false);
  isFinalizing = signal(false);

  selectedSectionId: string = '';
  validGrades = VALID_LETTER_GRADES;

  displayedColumns = ['studentId', 'studentName', 'status', 'attendance', 'currentGrade', 'gradeEntry', 'actions'];

  ngOnInit(): void {
    this.loadSections();
  }

  loadSections(): void {
    this.isLoadingSections.set(true);

    // Get all sections (not just open ones, for grading)
    this.enrollmentService.getCourseSections(
      { pageNumber: 1, pageSize: 500 },
      {}
    ).subscribe({
      next: (response) => {
        this.sections.set(response.data.items);
        this.isLoadingSections.set(false);
      },
      error: () => {
        this.notificationService.showError('Failed to load course sections');
        this.isLoadingSections.set(false);
      }
    });
  }

  onSectionChange(): void {
    if (!this.selectedSectionId) {
      this.enrollments.set([]);
      this.selectedSection.set(null);
      return;
    }

    const section = this.sections().find(s => s.id === this.selectedSectionId);
    this.selectedSection.set(section || null);
    this.loadEnrollments();
  }

  loadEnrollments(): void {
    if (!this.selectedSectionId) return;

    this.isLoadingEnrollments.set(true);

    this.enrollmentService.getSectionEnrollments(this.selectedSectionId, undefined, true).subscribe({
      next: (enrollments) => {
        // Map to GradeEntry with editable fields
        const gradeEntries: GradeEntry[] = enrollments.map(e => ({
          ...e,
          enrollmentId: e.id, // Map id to enrollmentId for clarity
          newGrade: e.grade || undefined,
          newNumericGrade: e.numericGrade ?? undefined,
          isSaving: false
        }));
        this.enrollments.set(gradeEntries);
        this.isLoadingEnrollments.set(false);
      },
      error: () => {
        this.notificationService.showError('Failed to load enrollments');
        this.isLoadingEnrollments.set(false);
      }
    });
  }

  submitGrade(entry: GradeEntry): void {
    if (!entry.newGrade) return;

    entry.isSaving = true;
    const request: SubmitGradeRequest = {
      enrollmentId: entry.enrollmentId,
      grade: entry.newGrade,
      numericGrade: entry.newNumericGrade
    };

    this.gradeService.submitGrade(request).subscribe({
      next: () => {
        entry.grade = entry.newGrade;
        entry.numericGrade = entry.newNumericGrade;
        entry.isSaving = false;
        this.notificationService.showSuccess(`Grade saved for ${entry.studentName}`);
      },
      error: (err) => {
        entry.isSaving = false;
        this.notificationService.showError(err.error?.message || 'Failed to save grade');
      }
    });
  }

  confirmFinalizeGrades(): void {
    const section = this.selectedSection();
    if (!section) return;

    const ungraded = this.enrollments().filter(e => e.status === 'Enrolled' && !e.grade);
    if (ungraded.length > 0) {
      if (!confirm(`There are ${ungraded.length} students without grades. Are you sure you want to finalize?`)) {
        return;
      }
    }

    if (confirm(`Finalize all grades for ${section.courseCode} Section ${section.sectionNumber}? This action cannot be undone.`)) {
      this.finalizeGrades();
    }
  }

  finalizeGrades(): void {
    if (!this.selectedSectionId) return;

    this.isFinalizing.set(true);

    this.gradeService.finalizeGrades(this.selectedSectionId).subscribe({
      next: (count) => {
        this.isFinalizing.set(false);
        this.notificationService.showSuccess(`Grades finalized for ${count} student(s)`);
        this.loadEnrollments(); // Reload to show finalized status
      },
      error: (err) => {
        this.isFinalizing.set(false);
        this.notificationService.showError(err.error?.message || 'Failed to finalize grades');
      }
    });
  }

  hasUnsavedChanges(): boolean {
    return this.enrollments().some(e =>
      (e.newGrade && e.newGrade !== e.grade) ||
      (e.newNumericGrade !== undefined && e.newNumericGrade !== e.numericGrade)
    );
  }

  resetChanges(): void {
    const entries = this.enrollments().map(e => ({
      ...e,
      enrollmentId: e.enrollmentId || e.id,
      newGrade: e.grade || undefined,
      newNumericGrade: e.numericGrade ?? undefined
    }));
    this.enrollments.set(entries);
  }

  canFinalizeGrades(): boolean {
    const enrolled = this.enrollments().filter(e => e.status === 'Enrolled');
    if (enrolled.length === 0) return false;

    // Can finalize if at least some grades exist
    return enrolled.some(e => e.grade);
  }

  getGradeCount(grades: string[]): number {
    return this.enrollments().filter(e => e.grade && grades.includes(e.grade)).length;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Enrolled':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Dropped':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'Withdrawn':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  }

  getGradeTextClass(grade: string): string {
    if (['A', 'A+', 'A-'].includes(grade)) return 'text-green-600 dark:text-green-400';
    if (['B', 'B+', 'B-'].includes(grade)) return 'text-blue-600 dark:text-blue-400';
    if (['C', 'C+', 'C-'].includes(grade)) return 'text-yellow-600 dark:text-yellow-400';
    if (['D', 'D+', 'D-'].includes(grade)) return 'text-orange-600 dark:text-orange-400';
    if (['F', 'W', 'WF'].includes(grade)) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  }

  getAttendanceClass(attendance: number): string {
    if (attendance >= 90) return 'text-green-600 dark:text-green-400';
    if (attendance >= 75) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  }
}
