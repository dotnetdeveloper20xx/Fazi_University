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
    MatDialogModule
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Document Management</h1>
          <p class="text-gray-500 dark:text-gray-400">Upload, view, and manage student documents</p>
        </div>
      </div>

      <!-- Statistics Cards -->
      @if (statistics()) {
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <mat-card class="p-4">
            <div class="text-sm text-gray-500">Total Documents</div>
            <div class="text-2xl font-bold text-gray-900">{{ statistics()!.totalDocuments }}</div>
          </mat-card>
          <mat-card class="p-4">
            <div class="text-sm text-gray-500">Verified</div>
            <div class="text-2xl font-bold text-green-600">{{ statistics()!.verifiedDocuments }}</div>
          </mat-card>
          <mat-card class="p-4">
            <div class="text-sm text-gray-500">Pending Verification</div>
            <div class="text-2xl font-bold text-yellow-600">{{ statistics()!.pendingVerification }}</div>
          </mat-card>
          <mat-card class="p-4">
            <div class="text-sm text-gray-500">Storage Used</div>
            <div class="text-2xl font-bold text-blue-600">{{ statistics()!.totalStorageFormatted }}</div>
          </mat-card>
        </div>
      }

      <!-- Student Selector and Filters -->
      <mat-card class="p-4">
        <div class="flex flex-wrap gap-4 items-end">
          <mat-form-field appearance="outline" class="w-64">
            <mat-label>Select Student</mat-label>
            <mat-select [(ngModel)]="selectedStudentId" (selectionChange)="onStudentChange()">
              <mat-option value="">-- Select a Student --</mat-option>
              @for (student of students(); track student.id) {
                <mat-option [value]="student.id">
                  {{ student.studentId }} - {{ student.fullName }}
                </mat-option>
              }
            </mat-select>
          </mat-form-field>

          @if (selectedStudentId) {
            <mat-form-field appearance="outline" class="w-48">
              <mat-label>Document Type</mat-label>
              <mat-select [(ngModel)]="filterType" (selectionChange)="loadDocuments()">
                <mat-option value="">All Types</mat-option>
                @for (type of documentTypes; track type) {
                  <mat-option [value]="type">{{ type }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-48">
              <mat-label>Verification Status</mat-label>
              <mat-select [(ngModel)]="filterVerified" (selectionChange)="loadDocuments()">
                <mat-option [value]="null">All</mat-option>
                <mat-option [value]="true">Verified</mat-option>
                <mat-option [value]="false">Not Verified</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-checkbox [(ngModel)]="includeExpired" (change)="loadDocuments()">
              Include Expired
            </mat-checkbox>

            <button mat-flat-button color="primary" (click)="showUploadForm = true">
              <mat-icon>upload</mat-icon>
              Upload Document
            </button>
          }
        </div>
      </mat-card>

      <!-- Upload Form -->
      @if (showUploadForm && selectedStudentId) {
        <mat-card class="p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Upload New Document</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <mat-form-field appearance="outline">
              <mat-label>Document Name</mat-label>
              <input matInput [(ngModel)]="uploadForm.name" required>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Document Type</mat-label>
              <mat-select [(ngModel)]="uploadForm.type" required>
                @for (type of documentTypes; track type) {
                  <mat-option [value]="type">{{ type }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="md:col-span-2">
              <mat-label>Description (Optional)</mat-label>
              <textarea matInput [(ngModel)]="uploadForm.description" rows="2"></textarea>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Expiration Date (Optional)</mat-label>
              <input matInput type="date" [(ngModel)]="uploadForm.expirationDate">
            </mat-form-field>

            <div class="flex items-center">
              <input type="file" #fileInput (change)="onFileSelected($event)" class="hidden">
              <button mat-stroked-button type="button" (click)="fileInput.click()">
                <mat-icon>attach_file</mat-icon>
                {{ selectedFile ? selectedFile.name : 'Choose File' }}
              </button>
              @if (selectedFile) {
                <span class="ml-2 text-sm text-gray-500">{{ formatFileSize(selectedFile.size) }}</span>
              }
            </div>
          </div>

          <div class="flex justify-end gap-2 mt-4">
            <button mat-stroked-button (click)="cancelUpload()">Cancel</button>
            <button mat-flat-button color="primary" (click)="uploadDocument()"
                    [disabled]="!selectedFile || !uploadForm.name || isUploading()">
              @if (isUploading()) {
                <mat-spinner diameter="20" class="inline-block mr-2"></mat-spinner>
              }
              <mat-icon>cloud_upload</mat-icon>
              Upload
            </button>
          </div>
        </mat-card>
      }

      <!-- Documents List -->
      @if (!selectedStudentId) {
        <mat-card class="p-12">
          <div class="text-center">
            <mat-icon class="text-5xl text-gray-400 mb-4">person_search</mat-icon>
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Select a Student</h3>
            <p class="text-gray-500">Please select a student to view their documents.</p>
          </div>
        </mat-card>
      } @else if (isLoading()) {
        <div class="flex items-center justify-center p-12">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else if (documents().length === 0) {
        <mat-card class="p-12">
          <div class="text-center">
            <mat-icon class="text-5xl text-gray-400 mb-4">folder_open</mat-icon>
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Documents Found</h3>
            <p class="text-gray-500 mb-4">This student has no documents matching your filters.</p>
            <button mat-flat-button color="primary" (click)="showUploadForm = true">
              <mat-icon>upload</mat-icon>
              Upload First Document
            </button>
          </div>
        </mat-card>
      } @else {
        <mat-card class="overflow-hidden">
          <div class="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Documents ({{ totalCount() }})
            </h3>
          </div>

          <div class="overflow-x-auto">
            <table mat-table [dataSource]="documents()" class="w-full">
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef class="font-semibold">Name</th>
                <td mat-cell *matCellDef="let doc">
                  <div class="font-medium">{{ doc.name }}</div>
                  <div class="text-sm text-gray-500">{{ doc.originalFileName }}</div>
                </td>
              </ng-container>

              <ng-container matColumnDef="type">
                <th mat-header-cell *matHeaderCellDef class="font-semibold">Type</th>
                <td mat-cell *matCellDef="let doc">
                  <span class="px-2 py-0.5 rounded-full text-xs font-medium"
                        [class]="getTypeClass(doc.type)">
                    {{ doc.type }}
                  </span>
                </td>
              </ng-container>

              <ng-container matColumnDef="size">
                <th mat-header-cell *matHeaderCellDef class="font-semibold">Size</th>
                <td mat-cell *matCellDef="let doc">{{ doc.fileSizeFormatted }}</td>
              </ng-container>

              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef class="font-semibold">Status</th>
                <td mat-cell *matCellDef="let doc">
                  <div class="flex items-center gap-1">
                    @if (doc.isVerified) {
                      <mat-icon class="text-green-600 text-sm" matTooltip="Verified">verified</mat-icon>
                      <span class="text-green-600 text-sm">Verified</span>
                    } @else {
                      <mat-icon class="text-yellow-600 text-sm" matTooltip="Pending">pending</mat-icon>
                      <span class="text-yellow-600 text-sm">Pending</span>
                    }
                    @if (doc.isExpired) {
                      <mat-icon class="text-red-600 text-sm ml-2" matTooltip="Expired">warning</mat-icon>
                    }
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="expiration">
                <th mat-header-cell *matHeaderCellDef class="font-semibold">Expiration</th>
                <td mat-cell *matCellDef="let doc">
                  @if (doc.expirationDate) {
                    <span [class]="doc.isExpired ? 'text-red-600' : 'text-gray-600'">
                      {{ doc.expirationDate | date:'mediumDate' }}
                    </span>
                  } @else {
                    <span class="text-gray-400">N/A</span>
                  }
                </td>
              </ng-container>

              <ng-container matColumnDef="uploaded">
                <th mat-header-cell *matHeaderCellDef class="font-semibold">Uploaded</th>
                <td mat-cell *matCellDef="let doc">{{ doc.createdAt | date:'mediumDate' }}</td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef class="font-semibold">Actions</th>
                <td mat-cell *matCellDef="let doc">
                  <div class="flex gap-1">
                    <button mat-icon-button color="primary" (click)="viewDocument(doc)"
                            matTooltip="View Details">
                      <mat-icon>visibility</mat-icon>
                    </button>
                    @if (isAdmin()) {
                      <button mat-icon-button [color]="doc.isVerified ? 'warn' : 'primary'"
                              (click)="toggleVerification(doc)"
                              [matTooltip]="doc.isVerified ? 'Remove Verification' : 'Verify'">
                        <mat-icon>{{ doc.isVerified ? 'unpublished' : 'verified' }}</mat-icon>
                      </button>
                    }
                    <button mat-icon-button color="warn" (click)="confirmDelete(doc)"
                            matTooltip="Delete">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
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
        </mat-card>
      }

      <!-- Document Detail Modal -->
      @if (selectedDocument()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
             (click)="selectedDocument.set(null)">
          <mat-card class="w-full max-w-2xl m-4" (click)="$event.stopPropagation()">
            <mat-card-header>
              <mat-card-title>{{ selectedDocument()!.name }}</mat-card-title>
              <mat-card-subtitle>{{ selectedDocument()!.type }}</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content class="mt-4">
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span class="text-gray-500">Student:</span>
                  <span class="ml-2 font-medium">{{ selectedDocument()!.studentName }}</span>
                </div>
                <div>
                  <span class="text-gray-500">Student ID:</span>
                  <span class="ml-2 font-mono">{{ selectedDocument()!.studentNumber }}</span>
                </div>
                <div>
                  <span class="text-gray-500">File Name:</span>
                  <span class="ml-2">{{ selectedDocument()!.originalFileName }}</span>
                </div>
                <div>
                  <span class="text-gray-500">File Size:</span>
                  <span class="ml-2">{{ selectedDocument()!.fileSizeFormatted }}</span>
                </div>
                <div>
                  <span class="text-gray-500">Content Type:</span>
                  <span class="ml-2">{{ selectedDocument()!.contentType }}</span>
                </div>
                <div>
                  <span class="text-gray-500">Uploaded:</span>
                  <span class="ml-2">{{ selectedDocument()!.createdAt | date:'medium' }}</span>
                </div>
                @if (selectedDocument()!.expirationDate) {
                  <div>
                    <span class="text-gray-500">Expires:</span>
                    <span class="ml-2" [class]="selectedDocument()!.isExpired ? 'text-red-600' : ''">
                      {{ selectedDocument()!.expirationDate | date:'mediumDate' }}
                    </span>
                  </div>
                }
                <div>
                  <span class="text-gray-500">Status:</span>
                  <span class="ml-2" [class]="selectedDocument()!.isVerified ? 'text-green-600' : 'text-yellow-600'">
                    {{ selectedDocument()!.isVerified ? 'Verified' : 'Pending Verification' }}
                  </span>
                </div>
                @if (selectedDocument()!.isVerified && selectedDocument()!.verifiedByName) {
                  <div>
                    <span class="text-gray-500">Verified By:</span>
                    <span class="ml-2">{{ selectedDocument()!.verifiedByName }}</span>
                  </div>
                  <div>
                    <span class="text-gray-500">Verified At:</span>
                    <span class="ml-2">{{ selectedDocument()!.verifiedAt | date:'medium' }}</span>
                  </div>
                }
                @if (selectedDocument()!.description) {
                  <div class="col-span-2">
                    <span class="text-gray-500">Description:</span>
                    <p class="mt-1">{{ selectedDocument()!.description }}</p>
                  </div>
                }
              </div>
            </mat-card-content>
            <mat-card-actions align="end">
              <button mat-button (click)="selectedDocument.set(null)">Close</button>
              @if (selectedDocument()!.downloadUrl) {
                <button mat-flat-button color="primary" (click)="downloadDocument(selectedDocument()!)">
                  <mat-icon>download</mat-icon>
                  Download
                </button>
              }
            </mat-card-actions>
          </mat-card>
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
export class DocumentListComponent implements OnInit {
  private readonly documentService = inject(DocumentService);
  private readonly studentService = inject(StudentService);
  private readonly notification = inject(NotificationService);
  private readonly authService = inject(AuthService);

  // Data
  students = signal<StudentListItem[]>([]);
  documents = signal<StudentDocumentListItem[]>([]);
  statistics = signal<DocumentStatistics | null>(null);
  selectedDocument = signal<StudentDocument | null>(null);

  // State
  isLoading = signal(false);
  isUploading = signal(false);
  totalCount = signal(0);

  // Selection and Filters
  selectedStudentId = '';
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
  displayedColumns = ['name', 'type', 'size', 'status', 'expiration', 'uploaded', 'actions'];

  ngOnInit(): void {
    this.loadStudents();
    this.loadStatistics();
  }

  loadStudents(): void {
    this.studentService.getStudents({ pageNumber: 1, pageSize: 500 }).subscribe({
      next: (response) => {
        this.students.set(response.data.items);
      },
      error: () => {
        this.notification.showError('Failed to load students');
      }
    });
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

  onStudentChange(): void {
    this.pageIndex = 0;
    if (this.selectedStudentId) {
      this.loadDocuments();
      this.loadStatistics();
    } else {
      this.documents.set([]);
      this.totalCount.set(0);
    }
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
    return this.authService.hasRole('Admin');
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getTypeClass(type: string): string {
    const classes: Record<string, string> = {
      'Transcript': 'bg-blue-100 text-blue-800',
      'ID Card': 'bg-purple-100 text-purple-800',
      'Passport': 'bg-indigo-100 text-indigo-800',
      'Birth Certificate': 'bg-green-100 text-green-800',
      'Medical Record': 'bg-red-100 text-red-800',
      'Financial Aid': 'bg-yellow-100 text-yellow-800',
      'Scholarship': 'bg-orange-100 text-orange-800',
      'Photo': 'bg-pink-100 text-pink-800'
    };
    return classes[type] || 'bg-gray-100 text-gray-800';
  }
}
