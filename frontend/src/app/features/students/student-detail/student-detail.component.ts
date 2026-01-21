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
import { StudentService } from '../services/student.service';
import { NotificationService } from '../../../core/services/notification.service';
import { StudentDetail, StudentStatus, AcademicStanding } from '../../../models';

@Component({
  selector: 'app-student-detail',
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
    MatTooltipModule
  ],
  template: `
    @if (isLoading()) {
      <div class="flex items-center justify-center p-12">
        <mat-spinner diameter="40"></mat-spinner>
      </div>
    } @else if (error()) {
      <div class="flex flex-col items-center justify-center p-12 text-center">
        <mat-icon class="text-5xl text-red-500 mb-4">error_outline</mat-icon>
        <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Error Loading Student</h3>
        <p class="text-gray-500 dark:text-gray-400 mb-4">{{ error() }}</p>
        <div class="flex gap-2">
          <button mat-stroked-button routerLink="/students">
            <mat-icon>arrow_back</mat-icon>
            Back to List
          </button>
          <button mat-flat-button color="primary" (click)="loadStudent()">
            <mat-icon>refresh</mat-icon>
            Try Again
          </button>
        </div>
      </div>
    } @else if (student()) {
      <div class="space-y-6">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div class="flex items-start gap-4">
            <button mat-icon-button routerLink="/students" class="mt-1">
              <mat-icon>arrow_back</mat-icon>
            </button>
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                <span class="text-2xl font-bold text-primary-700 dark:text-primary-300">
                  {{ student()!.firstName.charAt(0) }}{{ student()!.lastName.charAt(0) }}
                </span>
              </div>
              <div>
                <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {{ student()!.fullName }}
                </h1>
                <div class="flex items-center gap-2 mt-1">
                  <span class="text-gray-500 font-mono">{{ student()!.studentId }}</span>
                  <span
                    class="px-2 py-0.5 rounded-full text-xs font-medium"
                    [class]="getStatusClass(student()!.status)"
                  >
                    {{ student()!.status }}
                  </span>
                  @if (student()!.hasFinancialHold || student()!.hasAcademicHold) {
                    <mat-icon
                      class="text-red-500 text-base"
                      [matTooltip]="getHoldTooltip()"
                    >
                      warning
                    </mat-icon>
                  }
                </div>
              </div>
            </div>
          </div>
          <div class="flex gap-2 ml-12 md:ml-0">
            <a mat-stroked-button [routerLink]="['/students', student()!.id, 'edit']">
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
            <div class="text-sm text-gray-500">GPA</div>
            <div class="text-2xl font-bold" [class]="getGpaClass(student()!.cumulativeGpa)">
              {{ student()!.cumulativeGpa | number:'1.2-2' }}
            </div>
          </mat-card>
          <mat-card class="p-4">
            <div class="text-sm text-gray-500">Credits Earned</div>
            <div class="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {{ student()!.totalCreditsEarned }}
            </div>
          </mat-card>
          <mat-card class="p-4">
            <div class="text-sm text-gray-500">Account Balance</div>
            <div class="text-2xl font-bold" [class]="student()!.accountBalance > 0 ? 'text-red-600' : 'text-green-600'">
              {{ student()!.accountBalance | currency }}
            </div>
          </mat-card>
          <mat-card class="p-4">
            <div class="text-sm text-gray-500">Academic Standing</div>
            <span
              class="px-2 py-1 rounded-full text-xs font-medium"
              [class]="getStandingClass(student()!.academicStanding)"
            >
              {{ formatStanding(student()!.academicStanding) }}
            </span>
          </mat-card>
        </div>

        <!-- Tabs -->
        <mat-card>
          <mat-tab-group>
            <!-- Personal Information Tab -->
            <mat-tab label="Personal Info">
              <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-4">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Basic Information</h3>
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="text-sm text-gray-500">First Name</label>
                      <p class="text-gray-900 dark:text-gray-100">{{ student()!.firstName }}</p>
                    </div>
                    <div>
                      <label class="text-sm text-gray-500">Last Name</label>
                      <p class="text-gray-900 dark:text-gray-100">{{ student()!.lastName }}</p>
                    </div>
                    @if (student()!.middleName) {
                      <div>
                        <label class="text-sm text-gray-500">Middle Name</label>
                        <p class="text-gray-900 dark:text-gray-100">{{ student()!.middleName }}</p>
                      </div>
                    }
                    <div>
                      <label class="text-sm text-gray-500">Date of Birth</label>
                      <p class="text-gray-900 dark:text-gray-100">{{ student()!.dateOfBirth | date:'mediumDate' }}</p>
                    </div>
                    <div>
                      <label class="text-sm text-gray-500">Gender</label>
                      <p class="text-gray-900 dark:text-gray-100">{{ student()!.gender }}</p>
                    </div>
                  </div>
                </div>

                <div class="space-y-4">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Contact Information</h3>
                  <div class="grid grid-cols-1 gap-4">
                    <div>
                      <label class="text-sm text-gray-500">Email (University)</label>
                      <p class="text-gray-900 dark:text-gray-100">{{ student()!.email }}</p>
                    </div>
                    @if (student()!.personalEmail) {
                      <div>
                        <label class="text-sm text-gray-500">Email (Personal)</label>
                        <p class="text-gray-900 dark:text-gray-100">{{ student()!.personalEmail }}</p>
                      </div>
                    }
                    @if (student()!.phone) {
                      <div>
                        <label class="text-sm text-gray-500">Phone</label>
                        <p class="text-gray-900 dark:text-gray-100">{{ student()!.phone }}</p>
                      </div>
                    }
                    @if (student()!.mobilePhone) {
                      <div>
                        <label class="text-sm text-gray-500">Mobile</label>
                        <p class="text-gray-900 dark:text-gray-100">{{ student()!.mobilePhone }}</p>
                      </div>
                    }
                  </div>
                </div>

                @if (student()!.addressLine1) {
                  <div class="space-y-4">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Address</h3>
                    <div>
                      <p class="text-gray-900 dark:text-gray-100">{{ student()!.addressLine1 }}</p>
                      @if (student()!.addressLine2) {
                        <p class="text-gray-900 dark:text-gray-100">{{ student()!.addressLine2 }}</p>
                      }
                      <p class="text-gray-900 dark:text-gray-100">
                        {{ student()!.city }}, {{ student()!.state }} {{ student()!.postalCode }}
                      </p>
                      <p class="text-gray-900 dark:text-gray-100">{{ student()!.country }}</p>
                    </div>
                  </div>
                }

                @if (student()!.emergencyContactName) {
                  <div class="space-y-4">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Emergency Contact</h3>
                    <div class="grid grid-cols-1 gap-2">
                      <div>
                        <label class="text-sm text-gray-500">Name</label>
                        <p class="text-gray-900 dark:text-gray-100">{{ student()!.emergencyContactName }}</p>
                      </div>
                      @if (student()!.emergencyContactPhone) {
                        <div>
                          <label class="text-sm text-gray-500">Phone</label>
                          <p class="text-gray-900 dark:text-gray-100">{{ student()!.emergencyContactPhone }}</p>
                        </div>
                      }
                      @if (student()!.emergencyContactRelationship) {
                        <div>
                          <label class="text-sm text-gray-500">Relationship</label>
                          <p class="text-gray-900 dark:text-gray-100">{{ student()!.emergencyContactRelationship }}</p>
                        </div>
                      }
                    </div>
                  </div>
                }
              </div>
            </mat-tab>

            <!-- Academic Information Tab -->
            <mat-tab label="Academic">
              <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-4">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Program Information</h3>
                  <div class="grid grid-cols-1 gap-4">
                    <div>
                      <label class="text-sm text-gray-500">Program</label>
                      <p class="text-gray-900 dark:text-gray-100">{{ student()!.programName || 'Not assigned' }}</p>
                    </div>
                    <div>
                      <label class="text-sm text-gray-500">Department</label>
                      <p class="text-gray-900 dark:text-gray-100">{{ student()!.departmentName || 'N/A' }}</p>
                    </div>
                    <div>
                      <label class="text-sm text-gray-500">Advisor</label>
                      <p class="text-gray-900 dark:text-gray-100">{{ student()!.advisorName || 'Not assigned' }}</p>
                    </div>
                    <div>
                      <label class="text-sm text-gray-500">Student Type</label>
                      <p class="text-gray-900 dark:text-gray-100">{{ student()!.type }}</p>
                    </div>
                  </div>
                </div>

                <div class="space-y-4">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Academic Progress</h3>
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="text-sm text-gray-500">Cumulative GPA</label>
                      <p class="text-gray-900 dark:text-gray-100 font-semibold">
                        {{ student()!.cumulativeGpa | number:'1.2-2' }}
                      </p>
                    </div>
                    <div>
                      <label class="text-sm text-gray-500">Academic Standing</label>
                      <span
                        class="px-2 py-1 rounded-full text-xs font-medium"
                        [class]="getStandingClass(student()!.academicStanding)"
                      >
                        {{ formatStanding(student()!.academicStanding) }}
                      </span>
                    </div>
                    <div>
                      <label class="text-sm text-gray-500">Credits Earned</label>
                      <p class="text-gray-900 dark:text-gray-100">{{ student()!.totalCreditsEarned }}</p>
                    </div>
                    <div>
                      <label class="text-sm text-gray-500">Credits Attempted</label>
                      <p class="text-gray-900 dark:text-gray-100">{{ student()!.totalCreditsAttempted }}</p>
                    </div>
                  </div>
                </div>

                <div class="space-y-4">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Important Dates</h3>
                  <div class="grid grid-cols-1 gap-4">
                    <div>
                      <label class="text-sm text-gray-500">Admission Date</label>
                      <p class="text-gray-900 dark:text-gray-100">{{ student()!.admissionDate | date:'mediumDate' }}</p>
                    </div>
                    @if (student()!.expectedGraduationDate) {
                      <div>
                        <label class="text-sm text-gray-500">Expected Graduation</label>
                        <p class="text-gray-900 dark:text-gray-100">{{ student()!.expectedGraduationDate | date:'mediumDate' }}</p>
                      </div>
                    }
                    @if (student()!.graduationDate) {
                      <div>
                        <label class="text-sm text-gray-500">Graduation Date</label>
                        <p class="text-gray-900 dark:text-gray-100">{{ student()!.graduationDate | date:'mediumDate' }}</p>
                      </div>
                    }
                  </div>
                </div>

                <div class="space-y-4">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Quick Actions</h3>
                  <div class="flex flex-wrap gap-2">
                    <a mat-stroked-button [routerLink]="['/enrollments']" [queryParams]="{studentId: student()!.id}">
                      <mat-icon>assignment</mat-icon>
                      View Enrollments
                    </a>
                    <a mat-stroked-button [routerLink]="['/grades']" [queryParams]="{studentId: student()!.id}">
                      <mat-icon>grade</mat-icon>
                      View Grades
                    </a>
                  </div>
                </div>
              </div>
            </mat-tab>

            <!-- Financial Tab -->
            <mat-tab label="Financial">
              <div class="p-6 space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <mat-card class="p-4" [class.border-red-300]="student()!.accountBalance > 0">
                    <div class="text-sm text-gray-500">Current Balance</div>
                    <div class="text-2xl font-bold" [class]="student()!.accountBalance > 0 ? 'text-red-600' : 'text-green-600'">
                      {{ student()!.accountBalance | currency }}
                    </div>
                  </mat-card>
                  <mat-card class="p-4" [class.border-red-300]="student()!.hasFinancialHold">
                    <div class="text-sm text-gray-500">Financial Hold</div>
                    <div class="flex items-center gap-2">
                      @if (student()!.hasFinancialHold) {
                        <mat-icon class="text-red-500">warning</mat-icon>
                        <span class="text-red-600 font-semibold">Active Hold</span>
                      } @else {
                        <mat-icon class="text-green-500">check_circle</mat-icon>
                        <span class="text-green-600">No Hold</span>
                      }
                    </div>
                  </mat-card>
                  <mat-card class="p-4" [class.border-red-300]="student()!.hasAcademicHold">
                    <div class="text-sm text-gray-500">Academic Hold</div>
                    <div class="flex items-center gap-2">
                      @if (student()!.hasAcademicHold) {
                        <mat-icon class="text-red-500">warning</mat-icon>
                        <span class="text-red-600 font-semibold">Active Hold</span>
                      } @else {
                        <mat-icon class="text-green-500">check_circle</mat-icon>
                        <span class="text-green-600">No Hold</span>
                      }
                    </div>
                  </mat-card>
                </div>

                <div class="flex gap-2">
                  <a mat-stroked-button [routerLink]="['/billing']" [queryParams]="{studentId: student()!.id}">
                    <mat-icon>receipt</mat-icon>
                    View Billing History
                  </a>
                </div>
              </div>
            </mat-tab>
          </mat-tab-group>
        </mat-card>

        <!-- Audit Information -->
        <mat-card class="p-4">
          <div class="flex items-center justify-between text-sm text-gray-500">
            <span>Created: {{ student()!.createdAt | date:'medium' }}</span>
            @if (student()!.modifiedAt) {
              <span>Last Modified: {{ student()!.modifiedAt | date:'medium' }}</span>
            }
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
export class StudentDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly studentService = inject(StudentService);
  private readonly notificationService = inject(NotificationService);

  student = signal<StudentDetail | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadStudent();
  }

  loadStudent(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('Student ID not provided');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    this.studentService.getStudent(id).subscribe({
      next: (student) => {
        this.student.set(student);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load student');
        this.isLoading.set(false);
      }
    });
  }

  confirmDelete(): void {
    const s = this.student();
    if (!s) return;

    if (confirm(`Are you sure you want to delete ${s.fullName}? This action cannot be undone.`)) {
      this.studentService.deleteStudent(s.id).subscribe({
        next: () => {
          this.notificationService.showSuccess(`${s.fullName} has been deleted`);
          this.router.navigate(['/students']);
        },
        error: (err) => {
          this.notificationService.showError(err.error?.message || 'Failed to delete student');
        }
      });
    }
  }

  getStatusClass(status: StudentStatus): string {
    switch (status) {
      case 'Admitted':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'Active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      case 'Graduated':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Suspended':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'Withdrawn':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'OnLeave':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  }

  getStandingClass(standing: AcademicStanding): string {
    switch (standing) {
      case 'GoodStanding':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'AcademicWarning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Probation':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'Dismissed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  }

  formatStanding(standing: AcademicStanding): string {
    switch (standing) {
      case 'GoodStanding': return 'Good Standing';
      case 'AcademicWarning': return 'Academic Warning';
      case 'Probation': return 'Probation';
      case 'Dismissed': return 'Dismissed';
      default: return standing;
    }
  }

  getGpaClass(gpa: number): string {
    if (gpa >= 3.5) return 'text-green-600 dark:text-green-400';
    if (gpa >= 3.0) return 'text-blue-600 dark:text-blue-400';
    if (gpa >= 2.0) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  }

  getHoldTooltip(): string {
    const s = this.student();
    if (!s) return '';
    const holds = [];
    if (s.hasFinancialHold) holds.push('Financial Hold');
    if (s.hasAcademicHold) holds.push('Academic Hold');
    return holds.join(', ');
  }
}
