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
  enrollmentId: string;
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
    <div class="grade-list-container">
      <!-- Main Layout -->
      <div class="main-layout">
        <!-- Left Sidebar: Section Selector -->
        <aside class="section-sidebar" [class.collapsed]="sidebarCollapsed()">
          <div class="sidebar-header">
            <div class="sidebar-title" *ngIf="!sidebarCollapsed()">
              <mat-icon>school</mat-icon>
              <span>Sections</span>
            </div>
            <button mat-icon-button (click)="toggleSidebar()" class="collapse-btn">
              <mat-icon>{{ sidebarCollapsed() ? 'chevron_right' : 'chevron_left' }}</mat-icon>
            </button>
          </div>

          <div class="sidebar-content" *ngIf="!sidebarCollapsed()">
            <!-- Search Sections -->
            <div class="section-search">
              <mat-form-field appearance="outline" class="w-full filter-field">
                <mat-icon matPrefix class="search-icon">search</mat-icon>
                <input
                  matInput
                  [(ngModel)]="sectionSearch"
                  placeholder="Search sections..."
                >
              </mat-form-field>
            </div>

            <!-- Section List -->
            <div class="section-list">
              @if (isLoadingSections()) {
                <div class="loading-sections">
                  <mat-spinner diameter="24"></mat-spinner>
                </div>
              } @else {
                @for (section of filteredSections(); track section.id) {
                  <div
                    class="section-item"
                    [class.selected]="section.id === selectedSectionId"
                    (click)="selectSection(section.id)"
                  >
                    <div class="section-code">{{ section.courseCode }}</div>
                    <div class="section-name">{{ section.courseName }}</div>
                    <div class="section-meta">
                      <span class="section-number">Section {{ section.sectionNumber }}</span>
                      <span class="enrollment-count">{{ section.currentEnrollment }}/{{ section.maxEnrollment }}</span>
                    </div>
                  </div>
                } @empty {
                  <div class="no-sections">No sections found</div>
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
              <h1 class="page-title">Grade Management</h1>
              <p class="page-subtitle">
                @if (selectedSection()) {
                  {{ selectedSection()!.courseCode }} - Section {{ selectedSection()!.sectionNumber }}
                } @else {
                  Select a section to manage grades
                }
              </p>
            </div>
            <div class="header-actions">
              <button mat-stroked-button routerLink="/grades/transcript">
                <mat-icon>assignment</mat-icon>
                Transcripts
              </button>
            </div>
          </header>

          <!-- Section Info Bar -->
          @if (selectedSection()) {
            <div class="section-info-bar">
              <div class="info-item">
                <mat-icon>person</mat-icon>
                <span class="info-label">Instructor:</span>
                <span class="info-value">{{ selectedSection()!.instructorName || 'TBA' }}</span>
              </div>
              <div class="info-item">
                <mat-icon>people</mat-icon>
                <span class="info-label">Enrolled:</span>
                <span class="info-value">{{ selectedSection()!.currentEnrollment }}/{{ selectedSection()!.maxEnrollment }}</span>
              </div>
              <div class="info-item">
                <mat-icon>schedule</mat-icon>
                <span class="info-label">Term:</span>
                <span class="info-value">{{ selectedSection()!.termName || 'N/A' }}</span>
              </div>
            </div>
          }

          <!-- Grade Statistics -->
          @if (enrollments().length > 0) {
            <div class="grade-stats">
              <div class="stat-card grade-a">
                <span class="stat-value">{{ getGradeCount(['A+', 'A', 'A-']) }}</span>
                <span class="stat-label">A</span>
              </div>
              <div class="stat-card grade-b">
                <span class="stat-value">{{ getGradeCount(['B+', 'B', 'B-']) }}</span>
                <span class="stat-label">B</span>
              </div>
              <div class="stat-card grade-c">
                <span class="stat-value">{{ getGradeCount(['C+', 'C', 'C-']) }}</span>
                <span class="stat-label">C</span>
              </div>
              <div class="stat-card grade-d">
                <span class="stat-value">{{ getGradeCount(['D+', 'D', 'D-']) }}</span>
                <span class="stat-label">D</span>
              </div>
              <div class="stat-card grade-f">
                <span class="stat-value">{{ getGradeCount(['F']) }}</span>
                <span class="stat-label">F</span>
              </div>
              <div class="stat-card ungraded">
                <span class="stat-value">{{ getUngradedCount() }}</span>
                <span class="stat-label">Pending</span>
              </div>
            </div>
          }

          <!-- Main Content Card -->
          <div class="table-card">
            @if (!selectedSectionId) {
              <div class="empty-state">
                <mat-icon>school</mat-icon>
                <h3>Select a Course Section</h3>
                <p>Choose a course section from the left panel to view and manage student grades.</p>
              </div>
            } @else if (isLoadingEnrollments()) {
              <div class="loading-state">
                <mat-spinner diameter="48"></mat-spinner>
                <p>Loading enrollments...</p>
              </div>
            } @else if (enrollments().length === 0) {
              <div class="empty-state">
                <mat-icon>person_off</mat-icon>
                <h3>No Students Enrolled</h3>
                <p>There are no students enrolled in this section.</p>
              </div>
            } @else {
              <!-- Table Actions -->
              <div class="table-header">
                <div class="table-title">
                  <h3>Student Grades</h3>
                  <span class="student-count">{{ enrollments().length }} students</span>
                </div>
                <div class="table-actions">
                  @if (hasUnsavedChanges()) {
                    <button mat-stroked-button color="warn" (click)="resetChanges()">
                      <mat-icon>undo</mat-icon>
                      Reset
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
                      <mat-spinner diameter="20"></mat-spinner>
                    } @else {
                      <mat-icon>check_circle</mat-icon>
                    }
                    Finalize All
                  </button>
                </div>
              </div>

              <!-- Grade Table -->
              <div class="table-container">
                <table mat-table [dataSource]="enrollments()">
                  <!-- Student Column -->
                  <ng-container matColumnDef="student">
                    <th mat-header-cell *matHeaderCellDef>Student</th>
                    <td mat-cell *matCellDef="let row">
                      <div class="student-cell">
                        <div class="student-avatar">
                          {{ getInitials(row.studentName) }}
                        </div>
                        <div class="student-info">
                          <a [routerLink]="['/students', row.studentId]" class="student-name">
                            {{ row.studentName }}
                          </a>
                          <span class="student-id">{{ row.studentId_Display }}</span>
                        </div>
                      </div>
                    </td>
                  </ng-container>

                  <!-- Status Column -->
                  <ng-container matColumnDef="status">
                    <th mat-header-cell *matHeaderCellDef>Status</th>
                    <td mat-cell *matCellDef="let row">
                      <span class="status-badge" [class]="getStatusClass(row.status)">
                        {{ row.status }}
                      </span>
                    </td>
                  </ng-container>

                  <!-- Attendance Column -->
                  <ng-container matColumnDef="attendance">
                    <th mat-header-cell *matHeaderCellDef>Attendance</th>
                    <td mat-cell *matCellDef="let row">
                      @if (row.attendancePercentage !== null && row.attendancePercentage !== undefined) {
                        <div class="attendance-cell">
                          <div class="attendance-bar">
                            <div class="attendance-fill" [style.width.%]="row.attendancePercentage" [class]="getAttendanceBarClass(row.attendancePercentage)"></div>
                          </div>
                          <span class="attendance-value" [class]="getAttendanceClass(row.attendancePercentage)">
                            {{ row.attendancePercentage }}%
                          </span>
                        </div>
                      } @else {
                        <span class="no-data">--</span>
                      }
                    </td>
                  </ng-container>

                  <!-- Current Grade Column -->
                  <ng-container matColumnDef="currentGrade">
                    <th mat-header-cell *matHeaderCellDef>Current</th>
                    <td mat-cell *matCellDef="let row">
                      @if (row.grade) {
                        <div class="current-grade-cell">
                          <span class="grade-letter" [class]="getGradeTextClass(row.grade)">{{ row.grade }}</span>
                          @if (row.numericGrade !== null) {
                            <span class="grade-percent">{{ row.numericGrade | number:'1.0-0' }}%</span>
                          }
                          @if (row.isGradeFinalized) {
                            <mat-icon class="finalized-icon" matTooltip="Grade finalized">verified</mat-icon>
                          }
                        </div>
                      } @else {
                        <span class="no-grade">Not graded</span>
                      }
                    </td>
                  </ng-container>

                  <!-- Grade Entry Column -->
                  <ng-container matColumnDef="gradeEntry">
                    <th mat-header-cell *matHeaderCellDef>Enter Grade</th>
                    <td mat-cell *matCellDef="let row">
                      @if (row.status === 'Enrolled' && !row.isGradeFinalized) {
                        <div class="grade-entry-cell">
                          <mat-form-field appearance="outline" class="grade-select">
                            <mat-select [(ngModel)]="row.newGrade" placeholder="Grade">
                              <mat-option [value]="null">--</mat-option>
                              @for (grade of validGrades; track grade) {
                                <mat-option [value]="grade">{{ grade }}</mat-option>
                              }
                            </mat-select>
                          </mat-form-field>
                          <mat-form-field appearance="outline" class="percent-input">
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
                        <span class="finalized-text">Finalized</span>
                      } @else {
                        <span class="status-text">{{ row.status }}</span>
                      }
                    </td>
                  </ng-container>

                  <!-- Actions Column -->
                  <ng-container matColumnDef="actions">
                    <th mat-header-cell *matHeaderCellDef></th>
                    <td mat-cell *matCellDef="let row">
                      <div class="action-buttons">
                        @if (row.status === 'Enrolled' && !row.isGradeFinalized && row.newGrade) {
                          <button
                            mat-icon-button
                            color="primary"
                            (click)="submitGrade(row)"
                            [disabled]="row.isSaving"
                            matTooltip="Save grade"
                            class="save-btn"
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
                          matTooltip="View enrollment"
                          class="view-btn"
                        >
                          <mat-icon>open_in_new</mat-icon>
                        </button>
                      </div>
                    </td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="grade-row"></tr>
                </table>
              </div>
            }
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .grade-list-container {
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

    /* Section Sidebar */
    .section-sidebar {
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

    .section-sidebar.collapsed {
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

    .section-search {
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

    .section-list {
      flex: 1;
      overflow-y: auto;
      padding: 8px;
    }

    .loading-sections {
      display: flex;
      justify-content: center;
      padding: 24px;
    }

    .section-item {
      padding: 12px;
      border-radius: 8px;
      cursor: pointer;
      margin-bottom: 4px;
      transition: all 0.15s ease;
      border: 2px solid transparent;
    }

    .section-item:hover {
      background: #f3f4f6;
    }

    .section-item.selected {
      background: #eef2ff;
      border-color: #6366f1;
    }

    .section-code {
      font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
      font-weight: 600;
      color: #6366f1;
      font-size: 13px;
    }

    .section-name {
      font-size: 14px;
      color: #111827;
      font-weight: 500;
      margin-top: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .section-meta {
      display: flex;
      justify-content: space-between;
      margin-top: 4px;
      font-size: 12px;
      color: #6b7280;
    }

    .no-sections {
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

    /* Section Info Bar */
    .section-info-bar {
      display: flex;
      gap: 24px;
      padding: 12px 16px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
    }

    .info-item mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #9ca3af;
    }

    .info-label {
      color: #6b7280;
    }

    .info-value {
      font-weight: 500;
      color: #111827;
    }

    /* Grade Stats */
    .grade-stats {
      display: flex;
      gap: 12px;
    }

    .stat-card {
      flex: 1;
      padding: 12px 16px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
      display: flex;
      flex-direction: column;
      align-items: center;
      border-left: 4px solid;
    }

    .stat-card.grade-a { border-color: #10b981; }
    .stat-card.grade-b { border-color: #3b82f6; }
    .stat-card.grade-c { border-color: #f59e0b; }
    .stat-card.grade-d { border-color: #f97316; }
    .stat-card.grade-f { border-color: #ef4444; }
    .stat-card.ungraded { border-color: #9ca3af; }

    .stat-value {
      font-size: 24px;
      font-weight: 700;
      color: #111827;
    }

    .stat-label {
      font-size: 12px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Table Card */
    .table-card {
      flex: 1;
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid #e5e7eb;
    }

    .table-title h3 {
      font-size: 16px;
      font-weight: 600;
      color: #111827;
      margin: 0;
    }

    .student-count {
      font-size: 13px;
      color: #6b7280;
      margin-left: 8px;
    }

    .table-actions {
      display: flex;
      gap: 8px;
    }

    .table-container {
      flex: 1;
      overflow: auto;
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

    .grade-row {
      transition: background-color 0.15s ease;
    }

    .grade-row:hover {
      background-color: #f9fafb;
    }

    /* Student Cell */
    .student-cell {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 0;
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

    .student-info {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .student-name {
      font-weight: 500;
      color: #6366f1;
      font-size: 14px;
      text-decoration: none;
    }

    .student-name:hover {
      text-decoration: underline;
    }

    .student-id {
      font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
      font-size: 12px;
      color: #6b7280;
    }

    /* Status Badge */
    .status-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }

    .status-badge.enrolled { background: #d1fae5; color: #065f46; }
    .status-badge.completed { background: #dbeafe; color: #1e40af; }
    .status-badge.dropped { background: #ffedd5; color: #9a3412; }
    .status-badge.withdrawn { background: #fee2e2; color: #991b1b; }

    /* Attendance Cell */
    .attendance-cell {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .attendance-bar {
      width: 60px;
      height: 6px;
      background: #e5e7eb;
      border-radius: 3px;
      overflow: hidden;
    }

    .attendance-fill {
      height: 100%;
      border-radius: 3px;
      transition: width 0.3s ease;
    }

    .attendance-fill.high { background: #10b981; }
    .attendance-fill.medium { background: #f59e0b; }
    .attendance-fill.low { background: #ef4444; }

    .attendance-value {
      font-size: 13px;
      font-weight: 500;
      min-width: 40px;
    }

    .attendance-value.high { color: #059669; }
    .attendance-value.medium { color: #d97706; }
    .attendance-value.low { color: #dc2626; }

    /* Current Grade Cell */
    .current-grade-cell {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .grade-letter {
      font-size: 18px;
      font-weight: 700;
    }

    .grade-letter.grade-a { color: #059669; }
    .grade-letter.grade-b { color: #2563eb; }
    .grade-letter.grade-c { color: #d97706; }
    .grade-letter.grade-d { color: #ea580c; }
    .grade-letter.grade-f { color: #dc2626; }
    .grade-letter.grade-other { color: #6b7280; }

    .grade-percent {
      font-size: 12px;
      color: #6b7280;
    }

    .finalized-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: #10b981;
    }

    .no-grade {
      color: #9ca3af;
      font-style: italic;
      font-size: 13px;
    }

    .no-data {
      color: #d1d5db;
    }

    /* Grade Entry Cell */
    .grade-entry-cell {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .grade-select {
      width: 80px;
    }

    .percent-input {
      width: 70px;
    }

    .grade-entry-cell .mat-mdc-form-field-subscript-wrapper {
      display: none;
    }

    .finalized-text,
    .status-text {
      font-size: 13px;
      color: #9ca3af;
      font-style: italic;
    }

    /* Action Buttons */
    .action-buttons {
      display: flex;
      gap: 4px;
    }

    .save-btn {
      color: #10b981 !important;
    }

    .view-btn {
      opacity: 0.6;
    }

    .grade-row:hover .view-btn {
      opacity: 1;
    }

    /* States */
    .loading-state,
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

    .empty-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #9ca3af;
      margin-bottom: 16px;
    }

    .empty-state h3 {
      font-size: 18px;
      font-weight: 600;
      color: #111827;
      margin: 0 0 8px 0;
    }

    .empty-state p {
      color: #6b7280;
      margin: 0;
    }

    /* Dark mode */
    @media (prefers-color-scheme: dark) {
      .section-sidebar,
      .table-card,
      .section-info-bar,
      .stat-card {
        background: #1f2937;
      }

      .sidebar-header,
      .section-search,
      .table-header {
        border-color: #374151;
      }

      .sidebar-title {
        color: #f3f4f6;
      }

      .section-item:hover {
        background: #374151;
      }

      .section-item.selected {
        background: #312e81;
      }

      .section-name,
      .page-title,
      .info-value,
      .stat-value,
      .table-title h3 {
        color: #f9fafb;
      }

      .mat-mdc-header-row {
        background: #111827;
      }

      .grade-row:hover {
        background-color: #374151;
      }
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .section-sidebar {
        display: none;
      }

      .main-layout {
        gap: 0;
      }

      .grade-stats {
        flex-wrap: wrap;
      }

      .stat-card {
        flex: 0 0 calc(33.333% - 8px);
      }
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
  sidebarCollapsed = signal(false);

  selectedSectionId: string = '';
  sectionSearch: string = '';
  validGrades = VALID_LETTER_GRADES;

  displayedColumns = ['student', 'status', 'attendance', 'currentGrade', 'gradeEntry', 'actions'];

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

  filteredSections(): CourseSectionListItem[] {
    if (!this.sectionSearch) return this.sections();
    const search = this.sectionSearch.toLowerCase();
    return this.sections().filter(s =>
      s.courseCode.toLowerCase().includes(search) ||
      s.courseName.toLowerCase().includes(search) ||
      s.sectionNumber.toLowerCase().includes(search)
    );
  }

  ngOnInit(): void {
    this.loadSections();
  }

  loadSections(): void {
    this.isLoadingSections.set(true);

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

  selectSection(sectionId: string): void {
    this.selectedSectionId = sectionId;
    const section = this.sections().find(s => s.id === sectionId);
    this.selectedSection.set(section || null);
    this.loadEnrollments();
  }

  loadEnrollments(): void {
    if (!this.selectedSectionId) return;

    this.isLoadingEnrollments.set(true);

    this.enrollmentService.getSectionEnrollments(this.selectedSectionId, undefined, true).subscribe({
      next: (enrollments) => {
        const gradeEntries: GradeEntry[] = enrollments.map(e => ({
          ...e,
          enrollmentId: e.id,
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
        this.loadEnrollments();
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
    return enrolled.some(e => e.grade);
  }

  getGradeCount(grades: string[]): number {
    return this.enrollments().filter(e => e.grade && grades.includes(e.grade)).length;
  }

  getUngradedCount(): number {
    return this.enrollments().filter(e => e.status === 'Enrolled' && !e.grade).length;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Enrolled': return 'enrolled';
      case 'Completed': return 'completed';
      case 'Dropped': return 'dropped';
      case 'Withdrawn': return 'withdrawn';
      default: return '';
    }
  }

  getGradeTextClass(grade: string): string {
    if (['A', 'A+', 'A-'].includes(grade)) return 'grade-a';
    if (['B', 'B+', 'B-'].includes(grade)) return 'grade-b';
    if (['C', 'C+', 'C-'].includes(grade)) return 'grade-c';
    if (['D', 'D+', 'D-'].includes(grade)) return 'grade-d';
    if (['F', 'W', 'WF'].includes(grade)) return 'grade-f';
    return 'grade-other';
  }

  getAttendanceClass(attendance: number): string {
    if (attendance >= 90) return 'high';
    if (attendance >= 75) return 'medium';
    return 'low';
  }

  getAttendanceBarClass(attendance: number): string {
    if (attendance >= 90) return 'high';
    if (attendance >= 75) return 'medium';
    return 'low';
  }
}
