import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { GradeService } from '../services/grade.service';
import { StudentService } from '../../students/services/student.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Transcript, GpaSummary, StudentListItem } from '../../../models';

@Component({
  selector: 'app-transcript',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    MatDividerModule
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center gap-4">
        <button mat-icon-button routerLink="/grades">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Student Transcripts</h1>
          <p class="text-gray-500 dark:text-gray-400">View academic records and GPA information</p>
        </div>
      </div>

      <!-- Student Selector -->
      <mat-card class="p-6">
        <h2 class="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Select Student</h2>
        <mat-form-field appearance="outline" class="w-full md:w-1/2">
          <mat-label>Student</mat-label>
          <mat-select [(ngModel)]="selectedStudentId" (selectionChange)="onStudentChange()">
            @for (student of students(); track student.id) {
              <mat-option [value]="student.id">
                <span class="font-mono text-sm text-gray-500">{{ student.studentId }}</span>
                <span class="ml-2">{{ student.fullName }}</span>
              </mat-option>
            }
          </mat-select>
          <mat-hint>Select a student to view their transcript</mat-hint>
        </mat-form-field>
      </mat-card>

      @if (isLoadingStudents()) {
        <div class="flex items-center justify-center p-12">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else if (!selectedStudentId) {
        <mat-card class="p-12">
          <div class="text-center">
            <mat-icon class="text-5xl text-gray-400 mb-4">assignment</mat-icon>
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Select a Student</h3>
            <p class="text-gray-500">Choose a student above to view their academic transcript.</p>
          </div>
        </mat-card>
      } @else if (isLoading()) {
        <div class="flex items-center justify-center p-12">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else if (error()) {
        <mat-card class="p-8">
          <div class="text-center">
            <mat-icon class="text-5xl text-red-500 mb-4">error_outline</mat-icon>
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Error Loading Transcript</h3>
            <p class="text-gray-500 mb-4">{{ error() }}</p>
            <button mat-flat-button color="primary" (click)="loadTranscript()">
              <mat-icon>refresh</mat-icon>
              Try Again
            </button>
          </div>
        </mat-card>
      } @else if (transcript()) {
        <!-- Student Info & GPA Summary -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Student Info -->
          <mat-card class="p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Student Information</h3>
            <div class="space-y-3">
              <div>
                <label class="text-sm text-gray-500">Name</label>
                <p class="font-medium text-gray-900 dark:text-gray-100">{{ transcript()!.studentName }}</p>
              </div>
              <div>
                <label class="text-sm text-gray-500">Student ID</label>
                <p class="font-mono text-gray-900 dark:text-gray-100">{{ transcript()!.studentId_Display }}</p>
              </div>
              <div>
                <label class="text-sm text-gray-500">Program</label>
                <p class="text-gray-900 dark:text-gray-100">{{ transcript()!.programName }}</p>
              </div>
            </div>
          </mat-card>

          <!-- GPA Card -->
          <mat-card class="p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">GPA Summary</h3>
            <div class="text-center mb-4">
              <div class="text-5xl font-bold" [class]="getGpaClass(transcript()!.cumulativeGpa)">
                {{ transcript()!.cumulativeGpa | number:'1.2-2' }}
              </div>
              <div class="text-sm text-gray-500">Cumulative GPA</div>
            </div>
            @if (gpaSummary()) {
              <div class="space-y-2">
                @if (gpaSummary()!.currentTermGpa !== null) {
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-500">Current Term GPA:</span>
                    <span class="font-medium">{{ gpaSummary()!.currentTermGpa | number:'1.2-2' }}</span>
                  </div>
                }
                <div class="flex justify-between text-sm">
                  <span class="text-gray-500">Academic Standing:</span>
                  <span
                    class="font-medium"
                    [class]="getStandingClass(gpaSummary()!.academicStanding)"
                  >
                    {{ gpaSummary()!.academicStanding }}
                  </span>
                </div>
              </div>
            }
          </mat-card>

          <!-- Credits Card -->
          <mat-card class="p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Credit Summary</h3>
            <div class="space-y-4">
              <div class="flex justify-between items-center">
                <span class="text-gray-500">Credits Attempted</span>
                <span class="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {{ transcript()!.totalCreditsAttempted }}
                </span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-500">Credits Earned</span>
                <span class="text-2xl font-bold text-green-600">
                  {{ transcript()!.totalCreditsEarned }}
                </span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-500">Total Grade Points</span>
                <span class="text-xl font-medium text-gray-900 dark:text-gray-100">
                  {{ transcript()!.totalGradePoints | number:'1.2-2' }}
                </span>
              </div>
            </div>
          </mat-card>
        </div>

        <!-- Transcript by Term -->
        <mat-card class="overflow-hidden">
          <div class="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Academic Record by Term</h3>
            <button mat-stroked-button (click)="printTranscript()">
              <mat-icon>print</mat-icon>
              Print Transcript
            </button>
          </div>

          @if (transcript()!.terms.length === 0) {
            <div class="p-8 text-center">
              <mat-icon class="text-5xl text-gray-400 mb-2">school</mat-icon>
              <p class="text-gray-500">No academic records found.</p>
            </div>
          } @else {
            <mat-accordion>
              @for (term of transcript()!.terms; track term.termId) {
                <mat-expansion-panel [expanded]="$first">
                  <mat-expansion-panel-header>
                    <mat-panel-title class="font-semibold">
                      {{ term.termName }}
                    </mat-panel-title>
                    <mat-panel-description class="flex items-center gap-4">
                      <span>GPA: <strong [class]="getGpaClass(term.termGpa)">{{ term.termGpa | number:'1.2-2' }}</strong></span>
                      <span>Credits: <strong>{{ term.creditsEarned }}/{{ term.creditsAttempted }}</strong></span>
                    </mat-panel-description>
                  </mat-expansion-panel-header>

                  <div class="overflow-x-auto">
                    <table class="w-full">
                      <thead>
                        <tr class="border-b border-gray-200 dark:border-gray-700">
                          <th class="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Course</th>
                          <th class="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Title</th>
                          <th class="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Credits</th>
                          <th class="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Grade</th>
                          <th class="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Points</th>
                          <th class="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Quality Points</th>
                        </tr>
                      </thead>
                      <tbody>
                        @for (course of term.courses; track course.courseCode) {
                          <tr class="border-b border-gray-100 dark:border-gray-800">
                            <td class="py-3 px-4 font-mono text-sm">{{ course.courseCode }}</td>
                            <td class="py-3 px-4">{{ course.courseName }}</td>
                            <td class="py-3 px-4 text-center">{{ course.creditHours }}</td>
                            <td class="py-3 px-4 text-center">
                              @if (course.grade) {
                                <span class="font-bold" [class]="getGradeTextClass(course.grade)">
                                  {{ course.grade }}
                                </span>
                              } @else {
                                <span class="text-gray-400">--</span>
                              }
                            </td>
                            <td class="py-3 px-4 text-center">
                              {{ course.gradePoints !== null && course.gradePoints !== undefined ? (course.gradePoints | number:'1.2-2') : '--' }}
                            </td>
                            <td class="py-3 px-4 text-center">
                              {{ course.qualityPoints !== null && course.qualityPoints !== undefined ? (course.qualityPoints | number:'1.2-2') : '--' }}
                            </td>
                          </tr>
                        }
                      </tbody>
                      <tfoot>
                        <tr class="bg-gray-50 dark:bg-gray-800 font-semibold">
                          <td colspan="2" class="py-3 px-4">Term Totals</td>
                          <td class="py-3 px-4 text-center">{{ term.creditsAttempted }}</td>
                          <td class="py-3 px-4 text-center" [class]="getGpaClass(term.termGpa)">
                            {{ term.termGpa | number:'1.2-2' }}
                          </td>
                          <td colspan="2" class="py-3 px-4"></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </mat-expansion-panel>
              }
            </mat-accordion>
          }
        </mat-card>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class TranscriptComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly gradeService = inject(GradeService);
  private readonly studentService = inject(StudentService);
  private readonly notificationService = inject(NotificationService);

  students = signal<StudentListItem[]>([]);
  transcript = signal<Transcript | null>(null);
  gpaSummary = signal<GpaSummary | null>(null);

  isLoadingStudents = signal(false);
  isLoading = signal(false);
  error = signal<string | null>(null);

  selectedStudentId: string = '';

  ngOnInit(): void {
    this.loadStudents();

    // Check for studentId in query params
    const studentId = this.route.snapshot.queryParams['studentId'];
    if (studentId) {
      this.selectedStudentId = studentId;
      this.loadTranscript();
    }
  }

  loadStudents(): void {
    this.isLoadingStudents.set(true);

    this.studentService.getStudents({ pageNumber: 1, pageSize: 500 }, {}).subscribe({
      next: (response) => {
        this.students.set(response.data.items);
        this.isLoadingStudents.set(false);
      },
      error: () => {
        this.notificationService.showError('Failed to load students');
        this.isLoadingStudents.set(false);
      }
    });
  }

  onStudentChange(): void {
    if (!this.selectedStudentId) {
      this.transcript.set(null);
      this.gpaSummary.set(null);
      return;
    }
    this.loadTranscript();
  }

  loadTranscript(): void {
    if (!this.selectedStudentId) return;

    this.isLoading.set(true);
    this.error.set(null);

    // Load both transcript and GPA summary
    this.gradeService.getStudentTranscript(this.selectedStudentId).subscribe({
      next: (transcript) => {
        this.transcript.set(transcript);
        this.loadGpaSummary();
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load transcript');
        this.isLoading.set(false);
      }
    });
  }

  loadGpaSummary(): void {
    this.gradeService.getStudentGpa(this.selectedStudentId).subscribe({
      next: (gpa) => {
        this.gpaSummary.set(gpa);
        this.isLoading.set(false);
      },
      error: () => {
        // GPA might not be available for all students
        this.isLoading.set(false);
      }
    });
  }

  printTranscript(): void {
    window.print();
  }

  getGpaClass(gpa: number): string {
    if (gpa >= 3.5) return 'text-green-600 dark:text-green-400';
    if (gpa >= 3.0) return 'text-blue-600 dark:text-blue-400';
    if (gpa >= 2.0) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  }

  getGradeTextClass(grade: string): string {
    if (['A', 'A+', 'A-'].includes(grade)) return 'text-green-600 dark:text-green-400';
    if (['B', 'B+', 'B-'].includes(grade)) return 'text-blue-600 dark:text-blue-400';
    if (['C', 'C+', 'C-'].includes(grade)) return 'text-yellow-600 dark:text-yellow-400';
    if (['D', 'D+', 'D-'].includes(grade)) return 'text-orange-600 dark:text-orange-400';
    if (['F', 'W', 'WF'].includes(grade)) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  }

  getStandingClass(standing: string): string {
    switch (standing) {
      case 'Good Standing':
      case "Dean's List":
        return 'text-green-600 dark:text-green-400';
      case 'Academic Warning':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'Academic Probation':
        return 'text-orange-600 dark:text-orange-400';
      case 'Suspended':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  }
}
