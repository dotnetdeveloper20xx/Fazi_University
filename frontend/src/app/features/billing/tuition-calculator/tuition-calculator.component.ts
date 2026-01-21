import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { BillingService } from '../services/billing.service';
import { StudentService } from '../../students/services/student.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ApiService } from '../../../core/services/api.service';
import { TuitionCalculation, StudentListItem, ApiResponse } from '../../../models';

interface Term {
  id: string;
  name: string;
}

@Component({
  selector: 'app-tuition-calculator',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatDividerModule
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center gap-4">
        <button mat-icon-button routerLink="/billing">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Tuition Calculator</h1>
          <p class="text-gray-500 dark:text-gray-400">Calculate tuition costs for a student's enrollments</p>
        </div>
      </div>

      <!-- Selection Form -->
      <mat-card class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <mat-form-field appearance="outline">
            <mat-label>Student</mat-label>
            <mat-select [(ngModel)]="selectedStudentId">
              <mat-select-trigger>
                @if (getSelectedStudent(); as student) {
                  <span class="font-mono text-sm text-gray-500">{{ student.studentId }}</span>
                  <span class="mx-2">-</span>
                  <span>{{ student.fullName }}</span>
                }
              </mat-select-trigger>
              @for (student of students(); track student.id) {
                <mat-option [value]="student.id">
                  <span class="font-mono text-sm text-gray-500">{{ student.studentId }}</span>
                  <span class="mx-2">-</span>
                  <span>{{ student.fullName }}</span>
                </mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Term</mat-label>
            <mat-select [(ngModel)]="selectedTermId">
              @for (term of terms(); track term.id) {
                <mat-option [value]="term.id">{{ term.name }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <div class="flex items-center">
            <button
              mat-flat-button
              color="primary"
              (click)="calculateTuition()"
              [disabled]="!selectedStudentId || !selectedTermId || isCalculating()"
            >
              @if (isCalculating()) {
                <mat-spinner diameter="20" class="inline-block mr-2"></mat-spinner>
              }
              <mat-icon>calculate</mat-icon>
              Calculate
            </button>
          </div>
        </div>
      </mat-card>

      @if (isCalculating()) {
        <div class="flex items-center justify-center p-12">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else if (error()) {
        <mat-card class="p-8">
          <div class="text-center">
            <mat-icon class="text-5xl text-red-500 mb-4">error_outline</mat-icon>
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Calculation Error</h3>
            <p class="text-gray-500">{{ error() }}</p>
          </div>
        </mat-card>
      } @else if (calculation()) {
        <!-- Tuition Summary -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <mat-card class="p-4">
            <div class="text-sm text-gray-500">Term</div>
            <div class="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {{ calculation()!.termName }}
            </div>
          </mat-card>
          <mat-card class="p-4">
            <div class="text-sm text-gray-500">Total Credits</div>
            <div class="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {{ calculation()!.totalCredits }}
            </div>
          </mat-card>
          <mat-card class="p-4">
            <div class="text-sm text-gray-500">Rate Per Credit</div>
            <div class="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {{ calculation()!.tuitionPerCredit | currency }}
            </div>
          </mat-card>
          <mat-card class="p-4 bg-primary-50 dark:bg-primary-900">
            <div class="text-sm text-primary-600 dark:text-primary-300">Total Due</div>
            <div class="text-3xl font-bold text-primary-700 dark:text-primary-200">
              {{ calculation()!.totalAmount | currency }}
            </div>
          </mat-card>
        </div>

        <!-- Line Items -->
        <mat-card class="overflow-hidden">
          <div class="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Tuition Breakdown</h3>
          </div>

          @if (calculation()!.lineItems.length === 0) {
            <div class="p-8 text-center">
              <mat-icon class="text-4xl text-gray-400 mb-2">school</mat-icon>
              <p class="text-gray-500">No courses enrolled for this term</p>
            </div>
          } @else {
            <div class="overflow-x-auto">
              <table mat-table [dataSource]="calculation()!.lineItems" class="w-full">
                <ng-container matColumnDef="courseCode">
                  <th mat-header-cell *matHeaderCellDef>Course</th>
                  <td mat-cell *matCellDef="let row">
                    <span class="font-mono">{{ row.courseCode }}</span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="courseName">
                  <th mat-header-cell *matHeaderCellDef>Title</th>
                  <td mat-cell *matCellDef="let row">{{ row.courseName }}</td>
                </ng-container>

                <ng-container matColumnDef="creditHours">
                  <th mat-header-cell *matHeaderCellDef class="text-center">Credits</th>
                  <td mat-cell *matCellDef="let row" class="text-center">{{ row.creditHours }}</td>
                </ng-container>

                <ng-container matColumnDef="tuitionRate">
                  <th mat-header-cell *matHeaderCellDef class="text-right">Rate</th>
                  <td mat-cell *matCellDef="let row" class="text-right">{{ row.tuitionRate | currency }}</td>
                </ng-container>

                <ng-container matColumnDef="amount">
                  <th mat-header-cell *matHeaderCellDef class="text-right">Amount</th>
                  <td mat-cell *matCellDef="let row" class="text-right font-medium">{{ row.amount | currency }}</td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
              </table>
            </div>

            <!-- Totals -->
            <div class="p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
              <div class="flex justify-between items-center mb-2">
                <span class="text-gray-600 dark:text-gray-400">Tuition Subtotal</span>
                <span class="font-medium">{{ calculation()!.tuitionAmount | currency }}</span>
              </div>
              <div class="flex justify-between items-center mb-2">
                <span class="text-gray-600 dark:text-gray-400">Fees</span>
                <span class="font-medium">{{ calculation()!.fees | currency }}</span>
              </div>
              <mat-divider class="my-2"></mat-divider>
              <div class="flex justify-between items-center">
                <span class="text-lg font-semibold text-gray-900 dark:text-gray-100">Total</span>
                <span class="text-xl font-bold text-primary-600">{{ calculation()!.totalAmount | currency }}</span>
              </div>
            </div>
          }
        </mat-card>

        <!-- Action Buttons -->
        <div class="flex justify-end gap-2">
          <button mat-stroked-button (click)="printCalculation()">
            <mat-icon>print</mat-icon>
            Print
          </button>
          <button mat-flat-button color="primary" [routerLink]="['/billing']" [queryParams]="{ studentId: selectedStudentId }">
            <mat-icon>payment</mat-icon>
            Go to Billing
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class TuitionCalculatorComponent implements OnInit {
  private readonly billingService = inject(BillingService);
  private readonly studentService = inject(StudentService);
  private readonly apiService = inject(ApiService);
  private readonly notificationService = inject(NotificationService);

  students = signal<StudentListItem[]>([]);
  terms = signal<Term[]>([]);
  calculation = signal<TuitionCalculation | null>(null);

  isCalculating = signal(false);
  error = signal<string | null>(null);

  selectedStudentId: string = '';
  selectedTermId: string = '';

  displayedColumns = ['courseCode', 'courseName', 'creditHours', 'tuitionRate', 'amount'];

  getSelectedStudent(): StudentListItem | undefined {
    return this.students().find(s => s.id === this.selectedStudentId);
  }

  ngOnInit(): void {
    this.loadStudents();
    this.loadTerms();
  }

  loadStudents(): void {
    this.studentService.getStudents({ pageNumber: 1, pageSize: 500 }, {}).subscribe({
      next: (response) => {
        this.students.set(response.data.items);
      },
      error: () => {
        this.notificationService.showError('Failed to load students');
      }
    });
  }

  loadTerms(): void {
    // Load terms from the terms API
    this.apiService.get<ApiResponse<{ items: Term[] }>>('terms', { pageNumber: 1, pageSize: 50 }).subscribe({
      next: (response) => {
        this.terms.set(response.data.items);
      },
      error: () => {
        this.notificationService.showError('Failed to load terms');
      }
    });
  }

  calculateTuition(): void {
    if (!this.selectedStudentId || !this.selectedTermId) return;

    this.isCalculating.set(true);
    this.error.set(null);
    this.calculation.set(null);

    this.billingService.calculateTuition(this.selectedStudentId, this.selectedTermId).subscribe({
      next: (calc) => {
        this.calculation.set(calc);
        this.isCalculating.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to calculate tuition');
        this.isCalculating.set(false);
      }
    });
  }

  printCalculation(): void {
    window.print();
  }
}
