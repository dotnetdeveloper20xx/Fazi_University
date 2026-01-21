import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { EnrollmentService } from '../services/enrollment.service';
import { NotificationService } from '../../../core/services/notification.service';
import { EnrollmentDetail, EnrollmentStatus } from '../../../models';

@Component({
  selector: 'app-enrollment-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatChipsModule
  ],
  template: `
    @if (isLoading()) {
      <div class="flex items-center justify-center p-12">
        <mat-spinner diameter="40"></mat-spinner>
      </div>
    } @else if (error()) {
      <div class="flex flex-col items-center justify-center p-12 text-center">
        <mat-icon class="text-5xl text-red-500 mb-4">error_outline</mat-icon>
        <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Error Loading Enrollment</h3>
        <p class="text-gray-500 dark:text-gray-400 mb-4">{{ error() }}</p>
        <div class="flex gap-2">
          <button mat-stroked-button routerLink="/enrollments">
            <mat-icon>arrow_back</mat-icon>
            Back to List
          </button>
          <button mat-flat-button color="primary" (click)="loadEnrollment()">
            <mat-icon>refresh</mat-icon>
            Try Again
          </button>
        </div>
      </div>
    } @else if (enrollment()) {
      <div class="space-y-6">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div class="flex items-start gap-4">
            <button mat-icon-button routerLink="/enrollments" class="mt-1">
              <mat-icon>arrow_back</mat-icon>
            </button>
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span
                  class="px-2 py-0.5 rounded-full text-xs font-medium"
                  [class]="getStatusClass(enrollment()!.status)"
                >
                  {{ enrollment()!.status }}
                </span>
                @if (enrollment()!.isGradeFinalized) {
                  <span class="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Grade Finalized
                  </span>
                }
              </div>
              <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {{ enrollment()!.studentName }}
              </h1>
              <p class="text-gray-500 dark:text-gray-400">
                <span class="font-mono">{{ enrollment()!.courseCode }}</span> - {{ enrollment()!.courseName }}
              </p>
            </div>
          </div>
          <div class="flex gap-2 ml-12 md:ml-0">
            @if (enrollment()!.status === 'Enrolled') {
              <button mat-stroked-button color="warn" (click)="confirmDrop()">
                <mat-icon>remove_circle</mat-icon>
                Drop
              </button>
              <button mat-stroked-button color="warn" (click)="confirmWithdraw()">
                <mat-icon>cancel</mat-icon>
                Withdraw
              </button>
            }
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <mat-card class="p-4">
            <div class="text-sm text-gray-500">Grade</div>
            @if (enrollment()!.grade) {
              <div class="text-2xl font-bold" [class]="getGradeTextClass(enrollment()!.grade!)">
                {{ enrollment()!.grade }}
              </div>
            } @else {
              <div class="text-2xl font-bold text-gray-400">--</div>
            }
          </mat-card>
          <mat-card class="p-4">
            <div class="text-sm text-gray-500">Grade Points</div>
            <div class="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {{ enrollment()!.gradePoints !== null ? (enrollment()!.gradePoints | number:'1.2-2') : '--' }}
            </div>
          </mat-card>
          <mat-card class="p-4">
            <div class="text-sm text-gray-500">Credit Hours</div>
            <div class="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {{ enrollment()!.creditHours }}
            </div>
          </mat-card>
          <mat-card class="p-4">
            <div class="text-sm text-gray-500">Attendance</div>
            <div class="text-2xl font-bold" [class]="getAttendanceClass(enrollment()!.attendancePercentage)">
              {{ enrollment()!.attendancePercentage !== null ? enrollment()!.attendancePercentage + '%' : '--' }}
            </div>
          </mat-card>
        </div>

        <!-- Details -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Student Information -->
          <mat-card class="p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Student Information</h3>
            <div class="space-y-4">
              <div>
                <label class="text-sm text-gray-500">Student Name</label>
                <p class="text-gray-900 dark:text-gray-100 font-medium">{{ enrollment()!.studentName }}</p>
              </div>
              <div>
                <label class="text-sm text-gray-500">Student ID</label>
                <p class="text-gray-900 dark:text-gray-100 font-mono">{{ enrollment()!.studentId_Display }}</p>
              </div>
              <a
                mat-stroked-button
                [routerLink]="['/students', enrollment()!.studentId]"
                class="mt-2"
              >
                <mat-icon>person</mat-icon>
                View Student Profile
              </a>
            </div>
          </mat-card>

          <!-- Course Information -->
          <mat-card class="p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Course Information</h3>
            <div class="space-y-4">
              <div>
                <label class="text-sm text-gray-500">Course</label>
                <p class="text-gray-900 dark:text-gray-100">
                  <span class="font-mono font-medium">{{ enrollment()!.courseCode }}</span> - {{ enrollment()!.courseName }}
                </p>
              </div>
              <div>
                <label class="text-sm text-gray-500">Section</label>
                <p class="text-gray-900 dark:text-gray-100 font-mono">{{ enrollment()!.sectionNumber }}</p>
              </div>
              <div>
                <label class="text-sm text-gray-500">Instructor</label>
                <p class="text-gray-900 dark:text-gray-100">{{ enrollment()!.instructorName || 'TBA' }}</p>
              </div>
              @if (enrollment()!.schedule) {
                <div>
                  <label class="text-sm text-gray-500">Schedule</label>
                  <p class="text-gray-900 dark:text-gray-100">{{ enrollment()!.schedule }}</p>
                </div>
              }
              <div>
                <label class="text-sm text-gray-500">Term</label>
                <p class="text-gray-900 dark:text-gray-100">{{ enrollment()!.termName }}</p>
              </div>
            </div>
          </mat-card>

          <!-- Enrollment Details -->
          <mat-card class="p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Enrollment Details</h3>
            <div class="space-y-4">
              <div>
                <label class="text-sm text-gray-500">Status</label>
                <span
                  class="px-2 py-1 rounded-full text-xs font-medium ml-2"
                  [class]="getStatusClass(enrollment()!.status)"
                >
                  {{ enrollment()!.status }}
                </span>
              </div>
              <div>
                <label class="text-sm text-gray-500">Enrollment Date</label>
                <p class="text-gray-900 dark:text-gray-100">{{ enrollment()!.enrollmentDate | date:'medium' }}</p>
              </div>
              @if (enrollment()!.dropDate) {
                <div>
                  <label class="text-sm text-gray-500">Drop Date</label>
                  <p class="text-gray-900 dark:text-gray-100">{{ enrollment()!.dropDate | date:'medium' }}</p>
                </div>
              }
              @if (enrollment()!.withdrawalDate) {
                <div>
                  <label class="text-sm text-gray-500">Withdrawal Date</label>
                  <p class="text-gray-900 dark:text-gray-100">{{ enrollment()!.withdrawalDate | date:'medium' }}</p>
                </div>
              }
            </div>
          </mat-card>

          <!-- Grade Information -->
          <mat-card class="p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Grade Information</h3>
            <div class="space-y-4">
              <div class="flex items-center gap-4">
                <div>
                  <label class="text-sm text-gray-500">Letter Grade</label>
                  @if (enrollment()!.grade) {
                    <p class="text-2xl font-bold" [class]="getGradeTextClass(enrollment()!.grade!)">
                      {{ enrollment()!.grade }}
                    </p>
                  } @else {
                    <p class="text-2xl font-bold text-gray-400">Not Graded</p>
                  }
                </div>
                @if (enrollment()!.numericGrade !== null) {
                  <div>
                    <label class="text-sm text-gray-500">Numeric Grade</label>
                    <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {{ enrollment()!.numericGrade | number:'1.1-1' }}%
                    </p>
                  </div>
                }
              </div>
              <div>
                <label class="text-sm text-gray-500">Grade Status</label>
                @if (enrollment()!.isGradeFinalized) {
                  <p class="text-green-600 font-medium flex items-center gap-1">
                    <mat-icon class="text-sm">check_circle</mat-icon>
                    Finalized
                  </p>
                } @else {
                  <p class="text-yellow-600 font-medium flex items-center gap-1">
                    <mat-icon class="text-sm">pending</mat-icon>
                    Pending
                  </p>
                }
              </div>
              @if (enrollment()!.gradePoints !== null) {
                <div>
                  <label class="text-sm text-gray-500">Quality Points</label>
                  <p class="text-gray-900 dark:text-gray-100">
                    {{ enrollment()!.gradePoints | number:'1.2-2' }} ({{ enrollment()!.creditHours }} credits x {{ (enrollment()!.gradePoints! / enrollment()!.creditHours) | number:'1.2-2' }})
                  </p>
                </div>
              }
            </div>
          </mat-card>
        </div>

        <!-- Notes -->
        @if (enrollment()!.notes) {
          <mat-card class="p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Notes</h3>
            <p class="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{{ enrollment()!.notes }}</p>
          </mat-card>
        }
      </div>
    }
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class EnrollmentDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly enrollmentService = inject(EnrollmentService);
  private readonly notificationService = inject(NotificationService);

  enrollment = signal<EnrollmentDetail | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadEnrollment();
  }

  loadEnrollment(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('Enrollment ID not provided');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    this.enrollmentService.getEnrollment(id).subscribe({
      next: (enrollment) => {
        this.enrollment.set(enrollment);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load enrollment');
        this.isLoading.set(false);
      }
    });
  }

  confirmDrop(): void {
    const e = this.enrollment();
    if (!e) return;

    const reason = prompt(`Enter reason for dropping ${e.studentName} from ${e.courseCode}:`);
    if (reason !== null) {
      this.enrollmentService.dropEnrollment(e.id, { reason }).subscribe({
        next: () => {
          this.notificationService.showSuccess('Enrollment dropped successfully');
          this.loadEnrollment();
        },
        error: (err) => {
          this.notificationService.showError(err.error?.message || 'Failed to drop enrollment');
        }
      });
    }
  }

  confirmWithdraw(): void {
    const e = this.enrollment();
    if (!e) return;

    const reason = prompt(`Enter reason for withdrawal of ${e.studentName} from ${e.courseCode}:`);
    if (reason !== null) {
      this.enrollmentService.withdrawEnrollment(e.id, { reason }).subscribe({
        next: () => {
          this.notificationService.showSuccess('Withdrawal processed successfully');
          this.loadEnrollment();
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

  getGradeTextClass(grade: string): string {
    if (['A', 'A+', 'A-'].includes(grade)) return 'text-green-600 dark:text-green-400';
    if (['B', 'B+', 'B-'].includes(grade)) return 'text-blue-600 dark:text-blue-400';
    if (['C', 'C+', 'C-'].includes(grade)) return 'text-yellow-600 dark:text-yellow-400';
    if (['D', 'D+', 'D-'].includes(grade)) return 'text-orange-600 dark:text-orange-400';
    if (['F', 'W', 'WF'].includes(grade)) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  }

  getAttendanceClass(attendance: number | undefined | null): string {
    if (attendance === null || attendance === undefined) return 'text-gray-400';
    if (attendance >= 90) return 'text-green-600 dark:text-green-400';
    if (attendance >= 75) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  }
}
