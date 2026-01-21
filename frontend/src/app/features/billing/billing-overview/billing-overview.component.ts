import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { BillingService } from '../services/billing.service';
import { StudentService } from '../../students/services/student.service';
import { NotificationService } from '../../../core/services/notification.service';
import {
  StudentAccount,
  StudentListItem,
  Charge,
  Payment,
  CHARGE_TYPES,
  PAYMENT_METHODS
} from '../../../models';

@Component({
  selector: 'app-billing-overview',
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
    MatTableModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDividerModule,
    MatDialogModule
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Billing Management</h1>
          <p class="text-gray-500 dark:text-gray-400">Manage student accounts, charges, and payments</p>
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
          <mat-hint>Select a student to view their billing account</mat-hint>
        </mat-form-field>
      </mat-card>

      @if (isLoadingStudents()) {
        <div class="flex items-center justify-center p-12">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else if (!selectedStudentId) {
        <mat-card class="p-12">
          <div class="text-center">
            <mat-icon class="text-5xl text-gray-400 mb-4">account_balance_wallet</mat-icon>
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Select a Student</h3>
            <p class="text-gray-500">Choose a student above to view and manage their billing account.</p>
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
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Error Loading Account</h3>
            <p class="text-gray-500 mb-4">{{ error() }}</p>
            <button mat-flat-button color="primary" (click)="loadAccount()">
              <mat-icon>refresh</mat-icon>
              Try Again
            </button>
          </div>
        </mat-card>
      } @else if (account()) {
        <!-- Account Summary -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <mat-card class="p-4">
            <div class="text-sm text-gray-500">Account Balance</div>
            <div class="text-3xl font-bold" [class]="getBalanceClass(account()!.accountBalance)">
              {{ account()!.accountBalance | currency }}
            </div>
          </mat-card>
          <mat-card class="p-4">
            <div class="text-sm text-gray-500">Account Status</div>
            <div class="text-xl font-semibold" [class]="getStatusClass(account()!.accountStatus)">
              {{ account()!.accountStatus }}
            </div>
          </mat-card>
          <mat-card class="p-4">
            <div class="text-sm text-gray-500">Financial Hold</div>
            <div class="text-xl font-semibold" [class]="account()!.hasFinancialHold ? 'text-red-600' : 'text-green-600'">
              {{ account()!.hasFinancialHold ? 'Yes - Hold Active' : 'No Hold' }}
            </div>
          </mat-card>
          <mat-card class="p-4 flex flex-col justify-between">
            <div class="text-sm text-gray-500 mb-2">Quick Actions</div>
            <div class="flex gap-2">
              <button mat-stroked-button color="primary" (click)="showAddChargeDialog()">
                <mat-icon>add</mat-icon>
                Add Charge
              </button>
              <button mat-flat-button color="primary" (click)="showPaymentDialog()">
                <mat-icon>payment</mat-icon>
                Payment
              </button>
            </div>
          </mat-card>
        </div>

        <!-- Recent Charges & Payments -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Recent Charges -->
          <mat-card class="overflow-hidden">
            <div class="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Charges</h3>
            </div>
            @if (account()!.recentCharges.length === 0) {
              <div class="p-8 text-center">
                <mat-icon class="text-4xl text-gray-400 mb-2">receipt_long</mat-icon>
                <p class="text-gray-500">No recent charges</p>
              </div>
            } @else {
              <div class="overflow-x-auto">
                <table mat-table [dataSource]="account()!.recentCharges" class="w-full">
                  <ng-container matColumnDef="date">
                    <th mat-header-cell *matHeaderCellDef>Date</th>
                    <td mat-cell *matCellDef="let row">{{ row.chargeDate | date:'shortDate' }}</td>
                  </ng-container>
                  <ng-container matColumnDef="description">
                    <th mat-header-cell *matHeaderCellDef>Description</th>
                    <td mat-cell *matCellDef="let row">
                      <div>{{ row.description }}</div>
                      <div class="text-xs text-gray-500">{{ row.chargeType }} - {{ row.termName }}</div>
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="amount">
                    <th mat-header-cell *matHeaderCellDef class="text-right">Amount</th>
                    <td mat-cell *matCellDef="let row" class="text-right font-medium text-red-600">
                      {{ row.amount | currency }}
                    </td>
                  </ng-container>
                  <tr mat-header-row *matHeaderRowDef="chargeColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: chargeColumns;"></tr>
                </table>
              </div>
            }
          </mat-card>

          <!-- Recent Payments -->
          <mat-card class="overflow-hidden">
            <div class="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Payments</h3>
            </div>
            @if (account()!.recentPayments.length === 0) {
              <div class="p-8 text-center">
                <mat-icon class="text-4xl text-gray-400 mb-2">payments</mat-icon>
                <p class="text-gray-500">No recent payments</p>
              </div>
            } @else {
              <div class="overflow-x-auto">
                <table mat-table [dataSource]="account()!.recentPayments" class="w-full">
                  <ng-container matColumnDef="date">
                    <th mat-header-cell *matHeaderCellDef>Date</th>
                    <td mat-cell *matCellDef="let row">{{ row.paymentDate | date:'shortDate' }}</td>
                  </ng-container>
                  <ng-container matColumnDef="method">
                    <th mat-header-cell *matHeaderCellDef>Method</th>
                    <td mat-cell *matCellDef="let row">
                      <div>{{ row.paymentMethod }}</div>
                      @if (row.referenceNumber) {
                        <div class="text-xs text-gray-500">Ref: {{ row.referenceNumber }}</div>
                      }
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="status">
                    <th mat-header-cell *matHeaderCellDef>Status</th>
                    <td mat-cell *matCellDef="let row">
                      <span class="px-2 py-0.5 rounded-full text-xs font-medium"
                            [class]="getPaymentStatusClass(row.status)">
                        {{ row.status }}
                      </span>
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="amount">
                    <th mat-header-cell *matHeaderCellDef class="text-right">Amount</th>
                    <td mat-cell *matCellDef="let row" class="text-right font-medium text-green-600">
                      {{ row.amount | currency }}
                    </td>
                  </ng-container>
                  <tr mat-header-row *matHeaderRowDef="paymentColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: paymentColumns;"></tr>
                </table>
              </div>
            }
          </mat-card>
        </div>

        <!-- Add Charge Form (Inline) -->
        @if (showChargeForm()) {
          <mat-card class="p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Add New Charge</h3>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <mat-form-field appearance="outline">
                <mat-label>Charge Type</mat-label>
                <mat-select [(ngModel)]="newCharge.chargeType">
                  @for (type of chargeTypes; track type) {
                    <mat-option [value]="type">{{ type }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Amount</mat-label>
                <input matInput type="number" [(ngModel)]="newCharge.amount" min="0" step="0.01">
                <span matTextPrefix>$&nbsp;</span>
              </mat-form-field>
              <mat-form-field appearance="outline" class="md:col-span-2">
                <mat-label>Description</mat-label>
                <input matInput [(ngModel)]="newCharge.description">
              </mat-form-field>
            </div>
            <div class="flex justify-end gap-2 mt-4">
              <button mat-stroked-button (click)="cancelCharge()">Cancel</button>
              <button mat-flat-button color="primary" (click)="submitCharge()" [disabled]="isSubmitting()">
                @if (isSubmitting()) {
                  <mat-spinner diameter="20" class="inline-block mr-2"></mat-spinner>
                }
                Add Charge
              </button>
            </div>
          </mat-card>
        }

        <!-- Payment Form (Inline) -->
        @if (showPaymentForm()) {
          <mat-card class="p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Process Payment</h3>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <mat-form-field appearance="outline">
                <mat-label>Payment Method</mat-label>
                <mat-select [(ngModel)]="newPayment.paymentMethod">
                  @for (method of paymentMethods; track method) {
                    <mat-option [value]="method">{{ method }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Amount</mat-label>
                <input matInput type="number" [(ngModel)]="newPayment.amount" min="0" step="0.01">
                <span matTextPrefix>$&nbsp;</span>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Reference Number</mat-label>
                <input matInput [(ngModel)]="newPayment.referenceNumber">
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Notes</mat-label>
                <input matInput [(ngModel)]="newPayment.notes">
              </mat-form-field>
            </div>
            <div class="flex justify-end gap-2 mt-4">
              <button mat-stroked-button (click)="cancelPayment()">Cancel</button>
              <button mat-flat-button color="primary" (click)="submitPayment()" [disabled]="isSubmitting()">
                @if (isSubmitting()) {
                  <mat-spinner diameter="20" class="inline-block mr-2"></mat-spinner>
                }
                Process Payment
              </button>
            </div>
          </mat-card>
        }
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class BillingOverviewComponent implements OnInit {
  private readonly billingService = inject(BillingService);
  private readonly studentService = inject(StudentService);
  private readonly notificationService = inject(NotificationService);

  students = signal<StudentListItem[]>([]);
  account = signal<StudentAccount | null>(null);

  isLoadingStudents = signal(false);
  isLoading = signal(false);
  isSubmitting = signal(false);
  error = signal<string | null>(null);

  showChargeForm = signal(false);
  showPaymentForm = signal(false);

  selectedStudentId: string = '';

  chargeTypes = CHARGE_TYPES;
  paymentMethods = PAYMENT_METHODS;

  chargeColumns = ['date', 'description', 'amount'];
  paymentColumns = ['date', 'method', 'status', 'amount'];

  newCharge = {
    chargeType: '',
    amount: 0,
    description: ''
  };

  newPayment = {
    paymentMethod: '',
    amount: 0,
    referenceNumber: '',
    notes: ''
  };

  ngOnInit(): void {
    this.loadStudents();
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
      this.account.set(null);
      return;
    }
    this.loadAccount();
  }

  loadAccount(): void {
    if (!this.selectedStudentId) return;

    this.isLoading.set(true);
    this.error.set(null);
    this.showChargeForm.set(false);
    this.showPaymentForm.set(false);

    this.billingService.getStudentAccount(this.selectedStudentId).subscribe({
      next: (account) => {
        this.account.set(account);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load account');
        this.isLoading.set(false);
      }
    });
  }

  showAddChargeDialog(): void {
    this.showPaymentForm.set(false);
    this.showChargeForm.set(true);
    this.newCharge = { chargeType: '', amount: 0, description: '' };
  }

  showPaymentDialog(): void {
    this.showChargeForm.set(false);
    this.showPaymentForm.set(true);
    // Pre-fill amount with current balance if positive
    const balance = this.account()?.accountBalance || 0;
    this.newPayment = {
      paymentMethod: '',
      amount: balance > 0 ? balance : 0,
      referenceNumber: '',
      notes: ''
    };
  }

  cancelCharge(): void {
    this.showChargeForm.set(false);
  }

  cancelPayment(): void {
    this.showPaymentForm.set(false);
  }

  submitCharge(): void {
    if (!this.newCharge.chargeType || !this.newCharge.amount || !this.newCharge.description) {
      this.notificationService.showError('Please fill in all charge fields');
      return;
    }

    this.isSubmitting.set(true);

    this.billingService.addCharge({
      studentId: this.selectedStudentId,
      chargeType: this.newCharge.chargeType,
      amount: this.newCharge.amount,
      description: this.newCharge.description
    }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.showChargeForm.set(false);
        this.notificationService.showSuccess('Charge added successfully');
        this.loadAccount();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.notificationService.showError(err.error?.message || 'Failed to add charge');
      }
    });
  }

  submitPayment(): void {
    if (!this.newPayment.paymentMethod || !this.newPayment.amount) {
      this.notificationService.showError('Please fill in payment method and amount');
      return;
    }

    this.isSubmitting.set(true);

    this.billingService.processPayment({
      studentId: this.selectedStudentId,
      paymentMethod: this.newPayment.paymentMethod,
      amount: this.newPayment.amount,
      referenceNumber: this.newPayment.referenceNumber || undefined,
      notes: this.newPayment.notes || undefined
    }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.showPaymentForm.set(false);
        this.notificationService.showSuccess('Payment processed successfully');
        this.loadAccount();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.notificationService.showError(err.error?.message || 'Failed to process payment');
      }
    });
  }

  getBalanceClass(balance: number): string {
    if (balance > 0) return 'text-red-600';
    if (balance < 0) return 'text-green-600';
    return 'text-gray-900 dark:text-gray-100';
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Current':
      case 'Paid in Full':
        return 'text-green-600';
      case 'Past Due':
        return 'text-orange-600';
      case 'Collections':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  }

  getPaymentStatusClass(status: string): string {
    switch (status) {
      case 'Completed':
      case 'Posted':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Failed':
      case 'Declined':
        return 'bg-red-100 text-red-800';
      case 'Refunded':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
}
