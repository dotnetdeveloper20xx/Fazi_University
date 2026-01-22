import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { DocumentService } from '../services/document.service';
import { StudentService } from '../../students/services/student.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/auth/auth.service';
import {
  StudentDocumentListItem,
  StudentDocument,
  DocumentStatistics,
  StudentListItem,
  DOCUMENT_TYPES
} from '../../../models';

@Component({
  selector: 'app-document-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTooltipModule,
    MatCheckboxModule,
    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  template: `
    <div class="documents-layout">
      <!-- Collapsible Filter Sidebar -->
      <aside class="filter-sidebar" [class.collapsed]="sidebarCollapsed()">
        <div class="sidebar-header">
          <h2 class="sidebar-title" *ngIf="!sidebarCollapsed()">
            <mat-icon>filter_list</mat-icon>
            Filters
          </h2>
          <button mat-icon-button (click)="toggleSidebar()" class="collapse-btn">
            <mat-icon>{{ sidebarCollapsed() ? 'chevron_right' : 'chevron_left' }}</mat-icon>
          </button>
        </div>

        <div class="sidebar-content" *ngIf="!sidebarCollapsed()">
          <!-- Student Search -->
          <div class="filter-section">
            <label class="filter-label">Search Students</label>
            <mat-form-field appearance="outline" class="filter-field">
              <mat-icon matPrefix>search</mat-icon>
              <input matInput
                     [(ngModel)]="studentSearch"
                     placeholder="Name or ID..."
                     (input)="filterStudents()">
              @if (studentSearch) {
                <button matSuffix mat-icon-button (click)="studentSearch = ''; filterStudents()">
                  <mat-icon>close</mat-icon>
                </button>
              }
            </mat-form-field>
          </div>

          <!-- Student List -->
          <div class="filter-section student-list-section">
            <label class="filter-label">Select Student</label>
            <div class="student-list">
              @for (student of filteredStudents(); track student.id) {
                <div class="student-item"
                     [class.selected]="selectedStudentId === student.id"
                     (click)="selectStudent(student.id)">
                  <div class="student-avatar">
                    {{ getInitials(student.fullName) }}
                  </div>
                  <div class="student-info">
                    <span class="student-name">{{ student.fullName }}</span>
                    <span class="student-id">{{ student.studentId }}</span>
                  </div>
                  @if (selectedStudentId === student.id) {
                    <mat-icon class="selected-icon">check_circle</mat-icon>
                  }
                </div>
              } @empty {
                <div class="empty-students">
                  <mat-icon>person_search</mat-icon>
                  <span>No students found</span>
                </div>
              }
            </div>
          </div>

          @if (selectedStudentId) {
            <!-- Document Type Filter -->
            <div class="filter-section">
              <label class="filter-label">Document Type</label>
              <mat-form-field appearance="outline" class="filter-field">
                <mat-select [(ngModel)]="filterType" (selectionChange)="loadDocuments()">
                  <mat-option value="">All Types</mat-option>
                  @for (type of documentTypes; track type) {
                    <mat-option [value]="type">{{ type }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
            </div>

            <!-- Verification Status -->
            <div class="filter-section">
              <label class="filter-label">Verification Status</label>
              <mat-form-field appearance="outline" class="filter-field">
                <mat-select [(ngModel)]="filterVerified" (selectionChange)="loadDocuments()">
                  <mat-option [value]="null">All Status</mat-option>
                  <mat-option [value]="true">Verified</mat-option>
                  <mat-option [value]="false">Pending</mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <!-- Include Expired -->
            <div class="filter-section">
              <mat-checkbox [(ngModel)]="includeExpired" (change)="loadDocuments()" color="primary">
                Include Expired Documents
              </mat-checkbox>
            </div>

            <!-- Clear Filters -->
            @if (hasActiveFilters()) {
              <button mat-stroked-button class="clear-filters-btn" (click)="clearFilters()">
                <mat-icon>clear_all</mat-icon>
                Clear Filters
              </button>
            }
          }
        </div>
      </aside>

      <!-- Main Content Area -->
      <main class="main-content">
        <!-- Page Header -->
        <div class="page-header">
          <div class="header-info">
            <h1 class="page-title">Document Management</h1>
            <p class="page-subtitle">Upload, view, and manage student documents</p>
          </div>
          @if (selectedStudentId) {
            <button mat-flat-button color="primary" (click)="showUploadForm = true" class="upload-btn">
              <mat-icon>upload_file</mat-icon>
              Upload Document
            </button>
          }
        </div>

        <!-- Active Filters Display -->
        @if (hasActiveFilters() && selectedStudentId) {
          <div class="active-filters">
            <span class="active-filters-label">Active Filters:</span>
            @if (filterType) {
              <span class="filter-chip">
                Type: {{ filterType }}
                <button mat-icon-button (click)="filterType = ''; loadDocuments()">
                  <mat-icon>close</mat-icon>
                </button>
              </span>
            }
            @if (filterVerified !== null) {
              <span class="filter-chip">
                {{ filterVerified ? 'Verified' : 'Pending' }}
                <button mat-icon-button (click)="filterVerified = null; loadDocuments()">
                  <mat-icon>close</mat-icon>
                </button>
              </span>
            }
            @if (!includeExpired) {
              <span class="filter-chip">
                Excluding Expired
                <button mat-icon-button (click)="includeExpired = true; loadDocuments()">
                  <mat-icon>close</mat-icon>
                </button>
              </span>
            }
          </div>
        }

        <!-- Statistics Cards -->
        @if (statistics()) {
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon total">
                <mat-icon>folder</mat-icon>
              </div>
              <div class="stat-info">
                <span class="stat-value">{{ statistics()!.totalDocuments }}</span>
                <span class="stat-label">Total Documents</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon verified">
                <mat-icon>verified</mat-icon>
              </div>
              <div class="stat-info">
                <span class="stat-value">{{ statistics()!.verifiedDocuments }}</span>
                <span class="stat-label">Verified</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon pending">
                <mat-icon>pending</mat-icon>
              </div>
              <div class="stat-info">
                <span class="stat-value">{{ statistics()!.pendingVerification }}</span>
                <span class="stat-label">Pending Verification</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon storage">
                <mat-icon>cloud</mat-icon>
              </div>
              <div class="stat-info">
                <span class="stat-value">{{ statistics()!.totalStorageFormatted }}</span>
                <span class="stat-label">Storage Used</span>
              </div>
            </div>
          </div>
        }

        <!-- Upload Form Panel -->
        @if (showUploadForm && selectedStudentId) {
          <div class="upload-panel">
            <div class="upload-panel-header">
              <h3>
                <mat-icon>upload_file</mat-icon>
                Upload New Document
              </h3>
              <button mat-icon-button (click)="cancelUpload()">
                <mat-icon>close</mat-icon>
              </button>
            </div>
            <div class="upload-form-grid">
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Document Name</mat-label>
                <input matInput [(ngModel)]="uploadForm.name" placeholder="Enter document name" required>
              </mat-form-field>

              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Document Type</mat-label>
                <mat-select [(ngModel)]="uploadForm.type" required>
                  @for (type of documentTypes; track type) {
                    <mat-option [value]="type">{{ type }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="form-field span-2">
                <mat-label>Description (Optional)</mat-label>
                <textarea matInput [(ngModel)]="uploadForm.description" rows="2"
                          placeholder="Add a description..."></textarea>
              </mat-form-field>

              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Expiration Date</mat-label>
                <input matInput [matDatepicker]="expirationPicker" [(ngModel)]="uploadForm.expirationDate">
                <mat-datepicker-toggle matIconSuffix [for]="expirationPicker"></mat-datepicker-toggle>
                <mat-datepicker #expirationPicker></mat-datepicker>
                <mat-hint>Optional</mat-hint>
              </mat-form-field>

              <div class="file-upload-area">
                <input type="file" #fileInput (change)="onFileSelected($event)" class="hidden-input">
                <div class="file-drop-zone" (click)="fileInput.click()"
                     [class.has-file]="selectedFile">
                  @if (selectedFile) {
                    <mat-icon class="file-icon">description</mat-icon>
                    <span class="file-name">{{ selectedFile.name }}</span>
                    <span class="file-size">{{ formatFileSize(selectedFile.size) }}</span>
                    <button mat-icon-button (click)="selectedFile = null; $event.stopPropagation()">
                      <mat-icon>close</mat-icon>
                    </button>
                  } @else {
                    <mat-icon class="upload-icon">cloud_upload</mat-icon>
                    <span class="drop-text">Click to select a file</span>
                    <span class="drop-hint">or drag and drop</span>
                  }
                </div>
              </div>
            </div>
            <div class="upload-actions">
              <button mat-stroked-button (click)="cancelUpload()">Cancel</button>
              <button mat-flat-button color="primary" (click)="uploadDocument()"
                      [disabled]="!selectedFile || !uploadForm.name || isUploading()">
                @if (isUploading()) {
                  <mat-spinner diameter="18" class="btn-spinner"></mat-spinner>
                }
                <mat-icon>cloud_upload</mat-icon>
                Upload Document
              </button>
            </div>
          </div>
        }

        <!-- Content Area -->
        @if (!selectedStudentId) {
          <div class="empty-state-card">
            <div class="empty-state-content">
              <div class="empty-icon">
                <mat-icon>person_search</mat-icon>
              </div>
              <h3>Select a Student</h3>
              <p>Choose a student from the sidebar to view and manage their documents.</p>
            </div>
          </div>
        } @else if (isLoading()) {
          <div class="loading-state">
            <mat-spinner diameter="48"></mat-spinner>
            <span>Loading documents...</span>
          </div>
        } @else if (documents().length === 0) {
          <div class="empty-state-card">
            <div class="empty-state-content">
              <div class="empty-icon">
                <mat-icon>folder_open</mat-icon>
              </div>
              <h3>No Documents Found</h3>
              <p>This student has no documents matching your filters.</p>
              <button mat-flat-button color="primary" (click)="showUploadForm = true">
                <mat-icon>upload_file</mat-icon>
                Upload First Document
              </button>
            </div>
          </div>
        } @else {
          <!-- Documents Table Card -->
          <div class="table-card">
            <div class="table-header">
              <div class="table-title">
                <mat-icon>description</mat-icon>
                <span>Documents</span>
                <span class="count-badge">{{ totalCount() }}</span>
              </div>
            </div>

            <div class="table-container">
              <table mat-table [dataSource]="documents()">
                <!-- Document Info Column -->
                <ng-container matColumnDef="document">
                  <th mat-header-cell *matHeaderCellDef>Document</th>
                  <td mat-cell *matCellDef="let doc">
                    <div class="document-cell">
                      <div class="doc-icon" [class]="getTypeIconClass(doc.type)">
                        <mat-icon>{{ getTypeIcon(doc.type) }}</mat-icon>
                      </div>
                      <div class="doc-info">
                        <span class="doc-name">{{ doc.name }}</span>
                        <span class="doc-filename">{{ doc.originalFileName }}</span>
                      </div>
                    </div>
                  </td>
                </ng-container>

                <!-- Type Column -->
                <ng-container matColumnDef="type">
                  <th mat-header-cell *matHeaderCellDef>Type</th>
                  <td mat-cell *matCellDef="let doc">
                    <span class="type-badge" [class]="getTypeClass(doc.type)">
                      {{ doc.type }}
                    </span>
                  </td>
                </ng-container>

                <!-- Size Column -->
                <ng-container matColumnDef="size">
                  <th mat-header-cell *matHeaderCellDef>Size</th>
                  <td mat-cell *matCellDef="let doc">
                    <span class="size-text">{{ doc.fileSizeFormatted }}</span>
                  </td>
                </ng-container>

                <!-- Status Column -->
                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>Status</th>
                  <td mat-cell *matCellDef="let doc">
                    <div class="status-cell">
                      <span class="status-badge" [class]="doc.isVerified ? 'verified' : 'pending'">
                        <span class="status-dot"></span>
                        {{ doc.isVerified ? 'Verified' : 'Pending' }}
                      </span>
                      @if (doc.isExpired) {
                        <span class="expired-badge" matTooltip="This document has expired">
                          <mat-icon>warning</mat-icon>
                          Expired
                        </span>
                      }
                    </div>
                  </td>
                </ng-container>

                <!-- Expiration Column -->
                <ng-container matColumnDef="expiration">
                  <th mat-header-cell *matHeaderCellDef>Expiration</th>
                  <td mat-cell *matCellDef="let doc">
                    @if (doc.expirationDate) {
                      <span class="expiration-date" [class.expired]="doc.isExpired">
                        {{ doc.expirationDate | date:'MMM d, yyyy' }}
                      </span>
                    } @else {
                      <span class="no-expiration">No Expiration</span>
                    }
                  </td>
                </ng-container>

                <!-- Uploaded Column -->
                <ng-container matColumnDef="uploaded">
                  <th mat-header-cell *matHeaderCellDef>Uploaded</th>
                  <td mat-cell *matCellDef="let doc">
                    <span class="date-text">{{ doc.createdAt | date:'MMM d, yyyy' }}</span>
                  </td>
                </ng-container>

                <!-- Actions Column -->
                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Actions</th>
                  <td mat-cell *matCellDef="let doc">
                    <div class="action-buttons">
                      <button mat-icon-button (click)="viewDocument(doc)"
                              matTooltip="View Details" class="action-view">
                        <mat-icon>visibility</mat-icon>
                      </button>
                      @if (isAdmin()) {
                        <button mat-icon-button (click)="toggleVerification(doc)"
                                [matTooltip]="doc.isVerified ? 'Remove Verification' : 'Verify Document'"
                                [class]="doc.isVerified ? 'action-unverify' : 'action-verify'">
                          <mat-icon>{{ doc.isVerified ? 'unpublished' : 'verified' }}</mat-icon>
                        </button>
                      }
                      <button mat-icon-button (click)="confirmDelete(doc)"
                              matTooltip="Delete Document" class="action-delete">
                        <mat-icon>delete</mat-icon>
                      </button>
                    </div>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="table-row"></tr>
              </table>
            </div>

            <mat-paginator
              [length]="totalCount()"
              [pageSize]="pageSize"
              [pageIndex]="pageIndex"
              [pageSizeOptions]="[10, 25, 50]"
              (page)="onPageChange($event)"
              showFirstLastButtons>
            </mat-paginator>
          </div>
        }
      </main>

      <!-- Document Detail Modal -->
      @if (selectedDocument()) {
        <div class="modal-overlay" (click)="selectedDocument.set(null)">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div class="modal-title-area">
                <div class="modal-doc-icon" [class]="getTypeIconClass(selectedDocument()!.type)">
                  <mat-icon>{{ getTypeIcon(selectedDocument()!.type) }}</mat-icon>
                </div>
                <div>
                  <h2>{{ selectedDocument()!.name }}</h2>
                  <span class="modal-subtitle">{{ selectedDocument()!.type }}</span>
                </div>
              </div>
              <button mat-icon-button (click)="selectedDocument.set(null)">
                <mat-icon>close</mat-icon>
              </button>
            </div>

            <div class="modal-body">
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="detail-label">Student</span>
                  <span class="detail-value">{{ selectedDocument()!.studentName }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Student ID</span>
                  <span class="detail-value mono">{{ selectedDocument()!.studentNumber }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">File Name</span>
                  <span class="detail-value">{{ selectedDocument()!.originalFileName }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">File Size</span>
                  <span class="detail-value">{{ selectedDocument()!.fileSizeFormatted }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Content Type</span>
                  <span class="detail-value">{{ selectedDocument()!.contentType }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Uploaded</span>
                  <span class="detail-value">{{ selectedDocument()!.createdAt | date:'medium' }}</span>
                </div>
                @if (selectedDocument()!.expirationDate) {
                  <div class="detail-item">
                    <span class="detail-label">Expires</span>
                    <span class="detail-value" [class.expired-text]="selectedDocument()!.isExpired">
                      {{ selectedDocument()!.expirationDate | date:'mediumDate' }}
                      @if (selectedDocument()!.isExpired) {
                        <mat-icon class="inline-warning">warning</mat-icon>
                      }
                    </span>
                  </div>
                }
                <div class="detail-item">
                  <span class="detail-label">Verification Status</span>
                  <span class="detail-value">
                    <span class="status-badge" [class]="selectedDocument()!.isVerified ? 'verified' : 'pending'">
                      <span class="status-dot"></span>
                      {{ selectedDocument()!.isVerified ? 'Verified' : 'Pending Verification' }}
                    </span>
                  </span>
                </div>
                @if (selectedDocument()!.isVerified && selectedDocument()!.verifiedByName) {
                  <div class="detail-item">
                    <span class="detail-label">Verified By</span>
                    <span class="detail-value">{{ selectedDocument()!.verifiedByName }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Verified At</span>
                    <span class="detail-value">{{ selectedDocument()!.verifiedAt | date:'medium' }}</span>
                  </div>
                }
              </div>
              @if (selectedDocument()!.description) {
                <div class="description-section">
                  <span class="detail-label">Description</span>
                  <p class="description-text">{{ selectedDocument()!.description }}</p>
                </div>
              }
            </div>

            <div class="modal-footer">
              <button mat-stroked-button (click)="selectedDocument.set(null)">Close</button>
              @if (selectedDocument()!.downloadUrl) {
                <button mat-flat-button color="primary" (click)="downloadDocument(selectedDocument()!)">
                  <mat-icon>download</mat-icon>
                  Download
                </button>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .documents-layout {
      display: flex;
      gap: 24px;
      min-height: calc(100vh - 200px);
    }

    /* ===== FILTER SIDEBAR ===== */
    .filter-sidebar {
      width: 300px;
      flex-shrink: 0;
      background: white;
      border-radius: 16px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.05);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transition: width 0.3s ease;
    }

    .filter-sidebar.collapsed {
      width: 56px;
    }

    .sidebar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      border-bottom: 1px solid #e5e7eb;
      background: #f8fafc;
    }

    .sidebar-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      font-weight: 600;
      color: #374151;
      margin: 0;
    }

    .sidebar-title mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: #6b7280;
    }

    .collapse-btn {
      width: 32px;
      height: 32px;
    }

    .sidebar-content {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .filter-section {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .filter-label {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #6b7280;
    }

    .filter-field {
      width: 100%;
    }

    .filter-field ::ng-deep .mat-mdc-form-field-subscript-wrapper {
      display: none;
    }

    /* Student List */
    .student-list-section {
      flex: 1;
      min-height: 200px;
    }

    .student-list {
      display: flex;
      flex-direction: column;
      gap: 4px;
      max-height: 280px;
      overflow-y: auto;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 4px;
    }

    .student-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .student-item:hover {
      background: #f3f4f6;
    }

    .student-item.selected {
      background: #dbeafe;
      border: 1px solid #3b82f6;
    }

    .student-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 600;
      flex-shrink: 0;
    }

    .student-info {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
    }

    .student-name {
      font-size: 13px;
      font-weight: 500;
      color: #1f2937;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .student-id {
      font-size: 11px;
      font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
      color: #6b7280;
    }

    .selected-icon {
      color: #3b82f6;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .empty-students {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 24px;
      color: #9ca3af;
    }

    .empty-students mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .clear-filters-btn {
      width: 100%;
      margin-top: 8px;
    }

    /* ===== MAIN CONTENT ===== */
    .main-content {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
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

    .upload-btn {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* Active Filters */
    .active-filters {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .active-filters-label {
      font-size: 13px;
      color: #6b7280;
    }

    .filter-chip {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px 4px 12px;
      background: #dbeafe;
      color: #1d4ed8;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
    }

    .filter-chip button {
      width: 18px;
      height: 18px;
      line-height: 18px;
    }

    .filter-chip mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }

    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-icon mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
      color: white;
    }

    .stat-icon.total { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); }
    .stat-icon.verified { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }
    .stat-icon.pending { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }
    .stat-icon.storage { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); }

    .stat-info {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-size: 24px;
      font-weight: 700;
      color: #111827;
    }

    .stat-label {
      font-size: 13px;
      color: #6b7280;
    }

    /* Upload Panel */
    .upload-panel {
      background: white;
      border-radius: 16px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.05);
      overflow: hidden;
    }

    .upload-panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      background: #f8fafc;
      border-bottom: 1px solid #e5e7eb;
    }

    .upload-panel-header h3 {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
      font-weight: 600;
      color: #111827;
      margin: 0;
    }

    .upload-form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      padding: 20px;
    }

    .form-field {
      width: 100%;
    }

    .span-2 {
      grid-column: span 2;
    }

    .file-upload-area {
      grid-column: span 2;
    }

    .hidden-input {
      display: none;
    }

    .file-drop-zone {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 32px;
      border: 2px dashed #d1d5db;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .file-drop-zone:hover {
      border-color: #3b82f6;
      background: #f8fafc;
    }

    .file-drop-zone.has-file {
      border-style: solid;
      border-color: #10b981;
      background: #f0fdf4;
      flex-direction: row;
    }

    .upload-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #9ca3af;
    }

    .file-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #10b981;
    }

    .drop-text {
      font-size: 14px;
      font-weight: 500;
      color: #374151;
    }

    .drop-hint {
      font-size: 12px;
      color: #9ca3af;
    }

    .file-name {
      font-size: 14px;
      font-weight: 500;
      color: #111827;
      flex: 1;
    }

    .file-size {
      font-size: 12px;
      color: #6b7280;
    }

    .upload-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 16px 20px;
      border-top: 1px solid #e5e7eb;
      background: #f8fafc;
    }

    .btn-spinner {
      display: inline-block;
      margin-right: 8px;
    }

    /* Empty States */
    .empty-state-card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
      padding: 64px 32px;
    }

    .empty-state-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .empty-icon {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: #f3f4f6;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 20px;
    }

    .empty-icon mat-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      color: #9ca3af;
    }

    .empty-state-content h3 {
      font-size: 18px;
      font-weight: 600;
      color: #111827;
      margin: 0 0 8px 0;
    }

    .empty-state-content p {
      font-size: 14px;
      color: #6b7280;
      margin: 0 0 20px 0;
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
      padding: 64px;
      color: #6b7280;
    }

    /* Table Card */
    .table-card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.05);
      overflow: hidden;
    }

    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid #e5e7eb;
    }

    .table-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
      font-weight: 600;
      color: #111827;
    }

    .table-title mat-icon {
      color: #6b7280;
    }

    .count-badge {
      background: #e5e7eb;
      color: #374151;
      padding: 2px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }

    .table-container {
      overflow-x: auto;
    }

    table {
      width: 100%;
    }

    th.mat-mdc-header-cell {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #6b7280;
      background: #f9fafb;
      padding: 14px 16px;
    }

    td.mat-mdc-cell {
      padding: 16px;
      border-bottom: 1px solid #f3f4f6;
    }

    .table-row:hover {
      background: #f9fafb;
    }

    /* Document Cell */
    .document-cell {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .doc-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .doc-icon mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: white;
    }

    .doc-icon.transcript { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); }
    .doc-icon.id-card { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); }
    .doc-icon.passport { background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); }
    .doc-icon.birth-certificate { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }
    .doc-icon.medical { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); }
    .doc-icon.financial { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }
    .doc-icon.scholarship { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); }
    .doc-icon.photo { background: linear-gradient(135deg, #ec4899 0%, #db2777 100%); }
    .doc-icon.default { background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); }

    .doc-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .doc-name {
      font-size: 14px;
      font-weight: 500;
      color: #111827;
    }

    .doc-filename {
      font-size: 12px;
      color: #6b7280;
    }

    /* Type Badge */
    .type-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 500;
    }

    .type-badge.transcript { background: #dbeafe; color: #1d4ed8; }
    .type-badge.id-card { background: #ede9fe; color: #7c3aed; }
    .type-badge.passport { background: #e0e7ff; color: #4f46e5; }
    .type-badge.birth-certificate { background: #d1fae5; color: #059669; }
    .type-badge.medical { background: #fee2e2; color: #dc2626; }
    .type-badge.financial { background: #fef3c7; color: #d97706; }
    .type-badge.scholarship { background: #ffedd5; color: #ea580c; }
    .type-badge.photo { background: #fce7f3; color: #db2777; }
    .type-badge.default { background: #f3f4f6; color: #4b5563; }

    .size-text {
      font-size: 13px;
      color: #6b7280;
      font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
    }

    /* Status Cell */
    .status-cell {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
    }

    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
    }

    .status-badge.verified {
      background: #d1fae5;
      color: #059669;
    }

    .status-badge.verified .status-dot {
      background: #10b981;
    }

    .status-badge.pending {
      background: #fef3c7;
      color: #d97706;
    }

    .status-badge.pending .status-dot {
      background: #f59e0b;
    }

    .expired-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 8px;
      background: #fee2e2;
      color: #dc2626;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 500;
    }

    .expired-badge mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }

    .expiration-date {
      font-size: 13px;
      color: #374151;
    }

    .expiration-date.expired {
      color: #dc2626;
      font-weight: 500;
    }

    .no-expiration {
      font-size: 13px;
      color: #9ca3af;
    }

    .date-text {
      font-size: 13px;
      color: #6b7280;
    }

    /* Action Buttons */
    .action-buttons {
      display: flex;
      gap: 4px;
    }

    .action-view {
      color: #3b82f6;
    }

    .action-verify {
      color: #10b981;
    }

    .action-unverify {
      color: #f59e0b;
    }

    .action-delete {
      color: #ef4444;
    }

    /* Modal */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 24px;
    }

    .modal-content {
      background: white;
      border-radius: 16px;
      width: 100%;
      max-width: 600px;
      max-height: 90vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 20px 24px;
      border-bottom: 1px solid #e5e7eb;
    }

    .modal-title-area {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .modal-doc-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .modal-doc-icon mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
      color: white;
    }

    .modal-header h2 {
      font-size: 18px;
      font-weight: 600;
      color: #111827;
      margin: 0;
    }

    .modal-subtitle {
      font-size: 14px;
      color: #6b7280;
    }

    .modal-body {
      padding: 24px;
      overflow-y: auto;
    }

    .detail-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }

    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .detail-label {
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #6b7280;
    }

    .detail-value {
      font-size: 14px;
      color: #111827;
    }

    .detail-value.mono {
      font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
    }

    .expired-text {
      color: #dc2626;
    }

    .inline-warning {
      font-size: 16px;
      width: 16px;
      height: 16px;
      vertical-align: middle;
      color: #dc2626;
    }

    .description-section {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
    }

    .description-text {
      font-size: 14px;
      color: #374151;
      margin: 8px 0 0 0;
      line-height: 1.6;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 16px 24px;
      border-top: 1px solid #e5e7eb;
      background: #f9fafb;
    }

    /* Responsive */
    @media (max-width: 1200px) {
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 1024px) {
      .filter-sidebar {
        position: fixed;
        left: 0;
        top: 64px;
        bottom: 0;
        z-index: 100;
        border-radius: 0;
      }

      .filter-sidebar.collapsed {
        width: 0;
        padding: 0;
      }

      .main-content {
        width: 100%;
      }
    }

    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        align-items: stretch;
      }

      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .upload-form-grid {
        grid-template-columns: 1fr;
      }

      .span-2, .file-upload-area {
        grid-column: span 1;
      }

      .detail-grid {
        grid-template-columns: 1fr;
      }
    }

    /* Dark Mode */
    @media (prefers-color-scheme: dark) {
      .filter-sidebar {
        background: #1f2937;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
      }

      .sidebar-header {
        background: #111827;
        border-color: #374151;
      }

      .sidebar-title, .filter-label {
        color: #d1d5db;
      }

      .student-list {
        border-color: #374151;
      }

      .student-item:hover {
        background: #374151;
      }

      .student-item.selected {
        background: #1e3a5f;
        border-color: #3b82f6;
      }

      .student-name {
        color: #f3f4f6;
      }

      .page-title {
        color: #f3f4f6;
      }

      .stat-card, .table-card, .upload-panel, .empty-state-card, .modal-content {
        background: #1f2937;
      }

      .stat-value, .table-title, .doc-name, .detail-value {
        color: #f3f4f6;
      }

      th.mat-mdc-header-cell {
        background: #111827;
        color: #9ca3af;
      }

      td.mat-mdc-cell {
        border-color: #374151;
      }

      .table-row:hover {
        background: #374151;
      }

      .upload-panel-header, .table-header, .modal-header, .modal-footer {
        background: #111827;
        border-color: #374151;
      }

      .file-drop-zone {
        border-color: #4b5563;
      }

      .file-drop-zone:hover {
        background: #374151;
      }
    }
  `]
})
export class DocumentListComponent implements OnInit {
  private readonly documentService = inject(DocumentService);
  private readonly studentService = inject(StudentService);
  private readonly notification = inject(NotificationService);
  private readonly authService = inject(AuthService);

  // UI State
  sidebarCollapsed = signal(false);

  // Data
  students = signal<StudentListItem[]>([]);
  filteredStudents = signal<StudentListItem[]>([]);
  documents = signal<StudentDocumentListItem[]>([]);
  statistics = signal<DocumentStatistics | null>(null);
  selectedDocument = signal<StudentDocument | null>(null);

  // State
  isLoading = signal(false);
  isUploading = signal(false);
  totalCount = signal(0);

  // Selection and Filters
  selectedStudentId = '';
  studentSearch = '';
  filterType = '';
  filterVerified: boolean | null = null;
  includeExpired = true;

  // Pagination
  pageIndex = 0;
  pageSize = 10;

  // Upload Form
  showUploadForm = false;
  selectedFile: File | null = null;
  uploadForm = {
    name: '',
    type: 'Other',
    description: '',
    expirationDate: ''
  };

  // Constants
  documentTypes = DOCUMENT_TYPES;
  displayedColumns = ['document', 'type', 'size', 'status', 'expiration', 'uploaded', 'actions'];

  ngOnInit(): void {
    this.loadStudents();
    this.loadStatistics();
  }

  toggleSidebar(): void {
    this.sidebarCollapsed.update(v => !v);
  }

  loadStudents(): void {
    this.studentService.getStudents({ pageNumber: 1, pageSize: 500 }).subscribe({
      next: (response) => {
        this.students.set(response.data.items);
        this.filteredStudents.set(response.data.items);
      },
      error: () => {
        this.notification.showError('Failed to load students');
      }
    });
  }

  filterStudents(): void {
    const search = this.studentSearch.toLowerCase();
    if (!search) {
      this.filteredStudents.set(this.students());
      return;
    }
    const filtered = this.students().filter(s =>
      s.fullName.toLowerCase().includes(search) ||
      s.studentId.toLowerCase().includes(search)
    );
    this.filteredStudents.set(filtered);
  }

  selectStudent(studentId: string): void {
    this.selectedStudentId = studentId;
    this.pageIndex = 0;
    this.loadDocuments();
    this.loadStatistics();
  }

  loadStatistics(): void {
    this.documentService.getStatistics(this.selectedStudentId || undefined).subscribe({
      next: (stats) => {
        this.statistics.set(stats);
      },
      error: () => {
        // Silent fail for statistics
      }
    });
  }

  loadDocuments(): void {
    if (!this.selectedStudentId) return;

    this.isLoading.set(true);
    this.documentService.getStudentDocuments(
      this.selectedStudentId,
      { pageNumber: this.pageIndex + 1, pageSize: this.pageSize },
      {
        type: this.filterType || undefined,
        isVerified: this.filterVerified ?? undefined,
        includeExpired: this.includeExpired
      }
    ).subscribe({
      next: (response) => {
        this.documents.set(response.data.items);
        this.totalCount.set(response.data.totalCount);
        this.isLoading.set(false);
      },
      error: () => {
        this.notification.showError('Failed to load documents');
        this.isLoading.set(false);
      }
    });
  }

  hasActiveFilters(): boolean {
    return !!this.filterType || this.filterVerified !== null || !this.includeExpired;
  }

  clearFilters(): void {
    this.filterType = '';
    this.filterVerified = null;
    this.includeExpired = true;
    this.loadDocuments();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadDocuments();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  uploadDocument(): void {
    if (!this.selectedFile || !this.uploadForm.name || !this.selectedStudentId) return;

    this.isUploading.set(true);
    this.documentService.uploadDocument(
      this.selectedStudentId,
      this.selectedFile,
      this.uploadForm.name,
      this.uploadForm.type,
      this.uploadForm.description || undefined,
      this.uploadForm.expirationDate || undefined
    ).subscribe({
      next: () => {
        this.notification.showSuccess('Document uploaded successfully');
        this.cancelUpload();
        this.loadDocuments();
        this.loadStatistics();
      },
      error: (err) => {
        this.notification.showError(err.error?.message || 'Failed to upload document');
        this.isUploading.set(false);
      }
    });
  }

  cancelUpload(): void {
    this.showUploadForm = false;
    this.selectedFile = null;
    this.uploadForm = {
      name: '',
      type: 'Other',
      description: '',
      expirationDate: ''
    };
    this.isUploading.set(false);
  }

  viewDocument(doc: StudentDocumentListItem): void {
    this.documentService.getDocument(doc.id).subscribe({
      next: (document) => {
        this.selectedDocument.set(document);
      },
      error: () => {
        this.notification.showError('Failed to load document details');
      }
    });
  }

  downloadDocument(doc: StudentDocument): void {
    if (!doc.downloadUrl) return;

    this.documentService.downloadDocument(doc.downloadUrl).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = doc.originalFileName || 'document';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.notification.showError('Failed to download document');
      }
    });
  }

  toggleVerification(doc: StudentDocumentListItem): void {
    this.documentService.verifyDocument(doc.id, !doc.isVerified).subscribe({
      next: () => {
        this.notification.showSuccess(doc.isVerified ? 'Verification removed' : 'Document verified');
        this.loadDocuments();
        this.loadStatistics();
      },
      error: () => {
        this.notification.showError('Failed to update verification status');
      }
    });
  }

  confirmDelete(doc: StudentDocumentListItem): void {
    if (confirm(`Are you sure you want to delete "${doc.name}"?`)) {
      this.documentService.deleteDocument(doc.id).subscribe({
        next: () => {
          this.notification.showSuccess('Document deleted');
          this.loadDocuments();
          this.loadStatistics();
        },
        error: () => {
          this.notification.showError('Failed to delete document');
        }
      });
    }
  }

  isAdmin(): boolean {
    return this.authService.hasRole('Administrator');
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      'Transcript': 'school',
      'ID Card': 'badge',
      'Passport': 'travel_explore',
      'Birth Certificate': 'article',
      'Medical Record': 'medical_information',
      'Financial Aid': 'account_balance',
      'Scholarship': 'emoji_events',
      'Photo': 'photo_camera'
    };
    return icons[type] || 'description';
  }

  getTypeIconClass(type: string): string {
    const classes: Record<string, string> = {
      'Transcript': 'transcript',
      'ID Card': 'id-card',
      'Passport': 'passport',
      'Birth Certificate': 'birth-certificate',
      'Medical Record': 'medical',
      'Financial Aid': 'financial',
      'Scholarship': 'scholarship',
      'Photo': 'photo'
    };
    return classes[type] || 'default';
  }

  getTypeClass(type: string): string {
    const classes: Record<string, string> = {
      'Transcript': 'transcript',
      'ID Card': 'id-card',
      'Passport': 'passport',
      'Birth Certificate': 'birth-certificate',
      'Medical Record': 'medical',
      'Financial Aid': 'financial',
      'Scholarship': 'scholarship',
      'Photo': 'photo'
    };
    return classes[type] || 'default';
  }
}
