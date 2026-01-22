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
    <div class="billing-container">
      <!-- Main Layout -->
      <div class="main-layout">
        <!-- Left Sidebar: Student Selector -->
        <aside class="student-sidebar" [class.collapsed]="sidebarCollapsed()">
          <div class="sidebar-header">
            <div class="sidebar-title" *ngIf="!sidebarCollapsed()">
              <mat-icon>people</mat-icon>
              <span>Students</span>
            </div>
            <button mat-icon-button (click)="toggleSidebar()" class="collapse-btn">
              <mat-icon>{{ sidebarCollapsed() ? 'chevron_right' : 'chevron_left' }}</mat-icon>
            </button>
          </div>

          <div class="sidebar-content" *ngIf="!sidebarCollapsed()">
            <!-- Search Students -->
            <div class="student-search">
              <mat-form-field appearance="outline" class="w-full filter-field">
                <mat-icon matPrefix class="search-icon">search</mat-icon>
                <input
                  matInput
                  [(ngModel)]="studentSearch"
                  placeholder="Search students..."
                >
              </mat-form-field>
            </div>

            <!-- Student List -->
            <div class="student-list">
              @if (isLoadingStudents()) {
                <div class="loading-students">
                  <mat-spinner diameter="24"></mat-spinner>
                </div>
              } @else {
                @for (student of filteredStudents(); track student.id) {
                  <div
                    class="student-item"
                    [class.selected]="student.id === selectedStudentId"
                    (click)="selectStudent(student.id)"
                  >
                    <div class="student-avatar">
                      {{ getInitials(student.fullName) }}
                    </div>
                    <div class="student-details">
                      <div class="student-name">{{ student.fullName }}</div>
                      <div class="student-id">{{ student.studentId }}</div>
                    </div>
                  </div>
                } @empty {
                  <div class="no-students">No students found</div>
                }
              }
            </div>
          </div>
        </aside>

        <!-- Main Content Area -->
        <main class="content-area">
          <!-- Page Header -->
          <header class="page-header">
            <div class="header-info">
              <h1 class="page-title">Billing Management</h1>
              <p class="page-subtitle">
                @if (getSelectedStudent(); as student) {
                  {{ student.fullName }} - {{ student.studentId }}
                } @else {
                  Select a student to view billing
                }
              </p>
            </div>
            <div class="header-actions">
              <button mat-stroked-button routerLink="/billing/calculator">
                <mat-icon>calculate</mat-icon>
                Calculator
              </button>
            </div>
          </header>

          @if (!selectedStudentId) {
            <!-- Empty State -->
            <div class="main-card">
              <div class="empty-state">
                <mat-icon>account_balance_wallet</mat-icon>
                <h3>Select a Student</h3>
                <p>Choose a student from the left panel to view and manage their billing account.</p>
              </div>
            </div>
          } @else if (isLoading()) {
            <div class="main-card">
              <div class="loading-state">
                <mat-spinner diameter="48"></mat-spinner>
                <p>Loading account...</p>
              </div>
            </div>
          } @else if (error()) {
            <div class="main-card">
              <div class="error-state">
                <mat-icon>error_outline</mat-icon>
                <h3>Error Loading Account</h3>
                <p>{{ error() }}</p>
                <button mat-flat-button color="primary" (click)="loadAccount()">
                  <mat-icon>refresh</mat-icon>
                  Try Again
                </button>
              </div>
            </div>
          } @else if (account()) {
            <!-- Account Summary Cards -->
            <div class="summary-cards">
              <div class="summary-card balance-card" [class.positive]="account()!.accountBalance > 0" [class.negative]="account()!.accountBalance < 0" [class.zero]="account()!.accountBalance === 0">
                <div class="card-icon">
                  <mat-icon>account_balance</mat-icon>
                </div>
                <div class="card-content">
                  <span class="card-label">Account Balance</span>
                  <span class="card-value">{{ account()!.accountBalance | currency }}</span>
                </div>
              </div>

              <div class="summary-card status-card" [class]="'status-' + account()!.accountStatus.toLowerCase().replace(' ', '-')">
                <div class="card-icon">
                  <mat-icon>{{ getStatusIcon(account()!.accountStatus) }}</mat-icon>
                </div>
                <div class="card-content">
                  <span class="card-label">Account Status</span>
                  <span class="card-value">{{ account()!.accountStatus }}</span>
                </div>
              </div>

              <div class="summary-card hold-card" [class.has-hold]="account()!.hasFinancialHold">
                <div class="card-icon">
                  <mat-icon>{{ account()!.hasFinancialHold ? 'lock' : 'lock_open' }}</mat-icon>
                </div>
                <div class="card-content">
                  <span class="card-label">Financial Hold</span>
                  <span class="card-value">{{ account()!.hasFinancialHold ? 'Active' : 'None' }}</span>
                </div>
              </div>

              <div class="summary-card actions-card">
                <button mat-stroked-button (click)="showAddChargeDialog()" class="action-btn">
                  <mat-icon>add_circle</mat-icon>
                  Add Charge
                </button>
                <button mat-flat-button color="primary" (click)="showPaymentDialog()" class="action-btn">
                  <mat-icon>payment</mat-icon>
                  Payment
                </button>
              </div>
            </div>

            <!-- Charge/Payment Forms -->
            @if (showChargeForm()) {
              <div class="form-card">
                <div class="form-header">
                  <h3>Add New Charge</h3>
                  <button mat-icon-button (click)="cancelCharge()">
                    <mat-icon>close</mat-icon>
                  </button>
                </div>
                <div class="form-body">
                  <div class="form-grid">
                    <mat-form-field appearance="outline" class="form-field">
                      <mat-label>Charge Type</mat-label>
                      <mat-select [(ngModel)]="newCharge.chargeType">
                        @for (type of chargeTypes; track type) {
                          <mat-option [value]="type">{{ type }}</mat-option>
                        }
                      </mat-select>
                    </mat-form-field>
                    <mat-form-field appearance="outline" class="form-field">
                      <mat-label>Amount</mat-label>
                      <span matTextPrefix>$&nbsp;</span>
                      <input matInput type="number" [(ngModel)]="newCharge.amount" min="0" step="0.01">
                    </mat-form-field>
                    <mat-form-field appearance="outline" class="form-field full-width">
                      <mat-label>Description</mat-label>
                      <input matInput [(ngModel)]="newCharge.description">
                    </mat-form-field>
                  </div>
                  <div class="form-actions">
                    <button mat-stroked-button (click)="cancelCharge()">Cancel</button>
                    <button mat-flat-button color="primary" (click)="submitCharge()" [disabled]="isSubmitting()">
                      @if (isSubmitting()) {
                        <mat-spinner diameter="20"></mat-spinner>
                      }
                      Add Charge
                    </button>
                  </div>
                </div>
              </div>
            }

            @if (showPaymentForm()) {
              <div class="form-card">
                <div class="form-header">
                  <h3>Process Payment</h3>
                  <button mat-icon-button (click)="cancelPayment()">
                    <mat-icon>close</mat-icon>
                  </button>
                </div>
                <div class="form-body">
                  <div class="form-grid">
                    <mat-form-field appearance="outline" class="form-field">
                      <mat-label>Payment Method</mat-label>
                      <mat-select [(ngModel)]="newPayment.paymentMethod">
                        @for (method of paymentMethods; track method) {
                          <mat-option [value]="method">{{ method }}</mat-option>
                        }
                      </mat-select>
                    </mat-form-field>
                    <mat-form-field appearance="outline" class="form-field">
                      <mat-label>Amount</mat-label>
                      <span matTextPrefix>$&nbsp;</span>
                      <input matInput type="number" [(ngModel)]="newPayment.amount" min="0" step="0.01">
                    </mat-form-field>
                    <mat-form-field appearance="outline" class="form-field">
                      <mat-label>Reference Number</mat-label>
                      <input matInput [(ngModel)]="newPayment.referenceNumber">
                    </mat-form-field>
                    <mat-form-field appearance="outline" class="form-field">
                      <mat-label>Notes</mat-label>
                      <input matInput [(ngModel)]="newPayment.notes">
                    </mat-form-field>
                  </div>
                  <div class="form-actions">
                    <button mat-stroked-button (click)="cancelPayment()">Cancel</button>
                    <button mat-flat-button color="primary" (click)="submitPayment()" [disabled]="isSubmitting()">
                      @if (isSubmitting()) {
                        <mat-spinner diameter="20"></mat-spinner>
                      }
                      Process Payment
                    </button>
                  </div>
                </div>
              </div>
            }

            <!-- Transactions Tables -->
            <div class="transactions-grid">
              <!-- Recent Charges -->
              <div class="table-card">
                <div class="table-header">
                  <h3>
                    <mat-icon>receipt_long</mat-icon>
                    Recent Charges
                  </h3>
                  <span class="item-count">{{ account()!.recentCharges.length }} items</span>
                </div>
                @if (account()!.recentCharges.length === 0) {
                  <div class="table-empty">
                    <mat-icon>receipt_long</mat-icon>
                    <p>No recent charges</p>
                  </div>
                } @else {
                  <div class="table-container">
                    <table mat-table [dataSource]="account()!.recentCharges">
                      <ng-container matColumnDef="date">
                        <th mat-header-cell *matHeaderCellDef>Date</th>
                        <td mat-cell *matCellDef="let row">
                          <span class="date-text">{{ row.chargeDate | date:'MMM d' }}</span>
                        </td>
                      </ng-container>
                      <ng-container matColumnDef="description">
                        <th mat-header-cell *matHeaderCellDef>Description</th>
                        <td mat-cell *matCellDef="let row">
                          <div class="charge-info">
                            <span class="charge-desc">{{ row.description }}</span>
                            <span class="charge-meta">{{ row.chargeType }} - {{ row.termName }}</span>
                          </div>
                        </td>
                      </ng-container>
                      <ng-container matColumnDef="amount">
                        <th mat-header-cell *matHeaderCellDef>Amount</th>
                        <td mat-cell *matCellDef="let row">
                          <span class="amount charge">{{ row.amount | currency }}</span>
                        </td>
                      </ng-container>
                      <tr mat-header-row *matHeaderRowDef="chargeColumns"></tr>
                      <tr mat-row *matRowDef="let row; columns: chargeColumns;"></tr>
                    </table>
                  </div>
                }
              </div>

              <!-- Recent Payments -->
              <div class="table-card">
                <div class="table-header">
                  <h3>
                    <mat-icon>payments</mat-icon>
                    Recent Payments
                  </h3>
                  <span class="item-count">{{ account()!.recentPayments.length }} items</span>
                </div>
                @if (account()!.recentPayments.length === 0) {
                  <div class="table-empty">
                    <mat-icon>payments</mat-icon>
                    <p>No recent payments</p>
                  </div>
                } @else {
                  <div class="table-container">
                    <table mat-table [dataSource]="account()!.recentPayments">
                      <ng-container matColumnDef="date">
                        <th mat-header-cell *matHeaderCellDef>Date</th>
                        <td mat-cell *matCellDef="let row">
                          <span class="date-text">{{ row.paymentDate | date:'MMM d' }}</span>
                        </td>
                      </ng-container>
                      <ng-container matColumnDef="method">
                        <th mat-header-cell *matHeaderCellDef>Method</th>
                        <td mat-cell *matCellDef="let row">
                          <div class="payment-info">
                            <span class="payment-method">{{ row.paymentMethod }}</span>
                            @if (row.referenceNumber) {
                              <span class="payment-ref">Ref: {{ row.referenceNumber }}</span>
                            }
                          </div>
                        </td>
                      </ng-container>
                      <ng-container matColumnDef="status">
                        <th mat-header-cell *matHeaderCellDef>Status</th>
                        <td mat-cell *matCellDef="let row">
                          <span class="status-badge" [class]="getPaymentStatusClass(row.status)">
                            {{ row.status }}
                          </span>
                        </td>
                      </ng-container>
                      <ng-container matColumnDef="amount">
                        <th mat-header-cell *matHeaderCellDef>Amount</th>
                        <td mat-cell *matCellDef="let row">
                          <span class="amount payment">{{ row.amount | currency }}</span>
                        </td>
                      </ng-container>
                      <tr mat-header-row *matHeaderRowDef="paymentColumns"></tr>
                      <tr mat-row *matRowDef="let row; columns: paymentColumns;"></tr>
                    </table>
                  </div>
                }
              </div>
            </div>
          }
        </main>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .billing-container {
      height: calc(100vh - 140px);
      display: flex;
      flex-direction: column;
    }

    .main-layout {
      display: flex;
      gap: 24px;
      flex: 1;
      min-height: 0;
    }

    /* Student Sidebar */
    .student-sidebar {
      width: 300px;
      min-width: 300px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      display: flex;
      flex-direction: column;
      transition: all 0.3s ease;
      overflow: hidden;
    }

    .student-sidebar.collapsed {
      width: 56px;
      min-width: 56px;
    }

    .sidebar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      border-bottom: 1px solid #e5e7eb;
    }

    .sidebar-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      color: #374151;
    }

    .sidebar-title mat-icon {
      color: #6366f1;
    }

    .collapse-btn {
      color: #6b7280;
    }

    .sidebar-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .student-search {
      padding: 12px 16px;
      border-bottom: 1px solid #e5e7eb;
    }

    .filter-field {
      width: 100%;
    }

    .filter-field .mat-mdc-form-field-subscript-wrapper {
      display: none;
    }

    .search-icon {
      color: #9ca3af;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .student-list {
      flex: 1;
      overflow-y: auto;
      padding: 8px;
    }

    .loading-students {
      display: flex;
      justify-content: center;
      padding: 24px;
    }

    .student-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      border-radius: 8px;
      cursor: pointer;
      margin-bottom: 4px;
      transition: all 0.15s ease;
      border: 2px solid transparent;
    }

    .student-item:hover {
      background: #f3f4f6;
    }

    .student-item.selected {
      background: #eef2ff;
      border-color: #6366f1;
    }

    .student-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 600;
      flex-shrink: 0;
    }

    .student-details {
      flex: 1;
      min-width: 0;
    }

    .student-name {
      font-size: 14px;
      font-weight: 500;
      color: #111827;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .student-id {
      font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
      font-size: 12px;
      color: #6b7280;
    }

    .no-students {
      text-align: center;
      padding: 24px;
      color: #9ca3af;
    }

    /* Content Area */
    .content-area {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 16px;
      overflow-y: auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .page-title {
      font-size: 24px;
      font-weight: 700;
      color: #111827;
      margin: 0;
    }

    .page-subtitle {
      font-size: 14px;
      color: #6b7280;
      margin: 4px 0 0 0;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    /* Main Card */
    .main-card {
      flex: 1;
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      display: flex;
      flex-direction: column;
    }

    /* Summary Cards */
    .summary-cards {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }

    .summary-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .card-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .card-icon mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
      color: white;
    }

    .balance-card .card-icon { background: linear-gradient(135deg, #6366f1, #8b5cf6); }
    .balance-card.positive .card-icon { background: linear-gradient(135deg, #ef4444, #dc2626); }
    .balance-card.negative .card-icon { background: linear-gradient(135deg, #10b981, #059669); }
    .balance-card.zero .card-icon { background: linear-gradient(135deg, #6b7280, #4b5563); }

    .status-card .card-icon { background: linear-gradient(135deg, #10b981, #059669); }
    .status-card.status-past-due .card-icon { background: linear-gradient(135deg, #f97316, #ea580c); }
    .status-card.status-collections .card-icon { background: linear-gradient(135deg, #ef4444, #dc2626); }

    .hold-card .card-icon { background: linear-gradient(135deg, #10b981, #059669); }
    .hold-card.has-hold .card-icon { background: linear-gradient(135deg, #ef4444, #dc2626); }

    .card-content {
      flex: 1;
    }

    .card-label {
      display: block;
      font-size: 12px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }

    .card-value {
      font-size: 20px;
      font-weight: 700;
      color: #111827;
    }

    .balance-card.positive .card-value { color: #dc2626; }
    .balance-card.negative .card-value { color: #059669; }

    .actions-card {
      display: flex;
      flex-direction: column;
      gap: 8px;
      justify-content: center;
    }

    .action-btn {
      width: 100%;
    }

    /* Form Card */
    .form-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .form-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid #e5e7eb;
    }

    .form-header h3 {
      font-size: 16px;
      font-weight: 600;
      color: #111827;
      margin: 0;
    }

    .form-body {
      padding: 20px;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }

    .form-field {
      width: 100%;
    }

    .form-field.full-width {
      grid-column: span 2;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #e5e7eb;
    }

    /* Transactions Grid */
    .transactions-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }

    .table-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid #e5e7eb;
    }

    .table-header h3 {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
      font-weight: 600;
      color: #111827;
      margin: 0;
    }

    .table-header h3 mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: #6366f1;
    }

    .item-count {
      font-size: 13px;
      color: #6b7280;
    }

    .table-container {
      overflow-x: auto;
    }

    .table-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;
      text-align: center;
    }

    .table-empty mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #d1d5db;
      margin-bottom: 8px;
    }

    .table-empty p {
      color: #9ca3af;
      margin: 0;
    }

    table {
      width: 100%;
    }

    .mat-mdc-header-row {
      background: #f9fafb;
    }

    .mat-mdc-header-cell {
      font-weight: 600;
      color: #374151;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .date-text {
      font-size: 13px;
      color: #6b7280;
    }

    .charge-info,
    .payment-info {
      display: flex;
      flex-direction: column;
    }

    .charge-desc,
    .payment-method {
      font-size: 14px;
      color: #111827;
    }

    .charge-meta,
    .payment-ref {
      font-size: 12px;
      color: #6b7280;
    }

    .amount {
      font-weight: 600;
      font-size: 14px;
    }

    .amount.charge {
      color: #dc2626;
    }

    .amount.payment {
      color: #059669;
    }

    .status-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }

    .status-badge.completed,
    .status-badge.posted {
      background: #d1fae5;
      color: #065f46;
    }

    .status-badge.pending {
      background: #fef3c7;
      color: #92400e;
    }

    .status-badge.failed,
    .status-badge.declined {
      background: #fee2e2;
      color: #991b1b;
    }

    .status-badge.refunded {
      background: #dbeafe;
      color: #1e40af;
    }

    /* States */
    .loading-state,
    .error-state,
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px 24px;
      text-align: center;
    }

    .loading-state p {
      margin-top: 16px;
      color: #6b7280;
    }

    .error-state mat-icon,
    .empty-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
    }

    .error-state mat-icon {
      color: #ef4444;
    }

    .empty-state mat-icon {
      color: #9ca3af;
    }

    .error-state h3,
    .empty-state h3 {
      font-size: 18px;
      font-weight: 600;
      color: #111827;
      margin: 0 0 8px 0;
    }

    .error-state p,
    .empty-state p {
      color: #6b7280;
      margin: 0;
    }

    /* Dark mode */
    @media (prefers-color-scheme: dark) {
      .student-sidebar,
      .main-card,
      .summary-card,
      .form-card,
      .table-card {
        background: #1f2937;
      }

      .sidebar-header,
      .student-search,
      .table-header,
      .form-header {
        border-color: #374151;
      }

      .sidebar-title,
      .page-title,
      .card-value,
      .table-header h3,
      .form-header h3,
      .charge-desc,
      .payment-method {
        color: #f9fafb;
      }

      .student-item:hover {
        background: #374151;
      }

      .student-item.selected {
        background: #312e81;
      }

      .student-name {
        color: #f9fafb;
      }

      .mat-mdc-header-row {
        background: #111827;
      }
    }

    /* Responsive */
    @media (max-width: 1200px) {
      .summary-cards {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 1024px) {
      .student-sidebar {
        display: none;
      }

      .main-layout {
        gap: 0;
      }

      .transactions-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .summary-cards {
        grid-template-columns: 1fr;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }

      .form-field.full-width {
        grid-column: span 1;
      }
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
  sidebarCollapsed = signal(false);

  showChargeForm = signal(false);
  showPaymentForm = signal(false);

  selectedStudentId: string = '';
  studentSearch: string = '';

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

  toggleSidebar(): void {
    this.sidebarCollapsed.update(v => !v);
  }

  getInitials(name: string): string {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  filteredStudents(): StudentListItem[] {
    if (!this.studentSearch) return this.students();
    const search = this.studentSearch.toLowerCase();
    return this.students().filter(s =>
      s.fullName.toLowerCase().includes(search) ||
      s.studentId.toLowerCase().includes(search)
    );
  }

  getSelectedStudent(): StudentListItem | undefined {
    return this.students().find(s => s.id === this.selectedStudentId);
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'Current':
      case 'Paid in Full':
        return 'check_circle';
      case 'Past Due':
        return 'warning';
      case 'Collections':
        return 'error';
      default:
        return 'info';
    }
  }

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

  selectStudent(studentId: string): void {
    this.selectedStudentId = studentId;
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

  getPaymentStatusClass(status: string): string {
    switch (status) {
      case 'Completed':
      case 'Posted':
        return 'completed';
      case 'Pending':
        return 'pending';
      case 'Failed':
      case 'Declined':
        return 'failed';
      case 'Refunded':
        return 'refunded';
      default:
        return '';
    }
  }
}
