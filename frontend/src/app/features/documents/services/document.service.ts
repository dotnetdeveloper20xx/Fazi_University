import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { environment } from '../../../../environments/environment';
import {
  ApiResponse,
  PagedResponse,
  PaginationParams,
  StudentDocument,
  StudentDocumentListItem,
  DocumentUploadResult,
  DocumentStatistics,
  DocumentFilter
} from '../../../models';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private readonly api = inject(ApiService);
  private readonly http = inject(HttpClient);
  private readonly endpoint = 'documents';

  /**
   * Get documents for a student with pagination and filtering
   */
  getStudentDocuments(
    studentId: string,
    pagination: PaginationParams = {},
    filter: DocumentFilter = {}
  ): Observable<ApiResponse<PagedResponse<StudentDocumentListItem>>> {
    const params: Record<string, any> = {
      pageNumber: pagination.pageNumber ?? 1,
      pageSize: pagination.pageSize ?? 10
    };

    if (filter.type) params['type'] = filter.type;
    if (filter.isVerified !== undefined) params['isVerified'] = filter.isVerified;
    if (filter.includeExpired !== undefined) params['includeExpired'] = filter.includeExpired;

    return this.api.get<ApiResponse<PagedResponse<StudentDocumentListItem>>>(
      `${this.endpoint}/student/${studentId}`,
      params
    );
  }

  /**
   * Get a document by ID
   */
  getDocument(documentId: string): Observable<StudentDocument> {
    return this.api.get<ApiResponse<StudentDocument>>(
      `${this.endpoint}/${documentId}`
    ).pipe(map(response => response.data));
  }

  /**
   * Upload a document for a student
   */
  uploadDocument(
    studentId: string,
    file: File,
    name: string,
    type: string = 'Other',
    description?: string,
    expirationDate?: string
  ): Observable<DocumentUploadResult> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append('name', name);
    formData.append('type', type);
    if (description) formData.append('description', description);
    if (expirationDate) formData.append('expirationDate', expirationDate);

    return this.http.post<ApiResponse<DocumentUploadResult>>(
      `${environment.apiUrl}/${this.endpoint}/student/${studentId}`,
      formData
    ).pipe(map(response => response.data));
  }

  /**
   * Verify or unverify a document
   */
  verifyDocument(documentId: string, isVerified: boolean): Observable<void> {
    return this.http.put<ApiResponse<string>>(
      `${environment.apiUrl}/${this.endpoint}/${documentId}/verify`,
      { isVerified }
    ).pipe(map(() => void 0));
  }

  /**
   * Delete a document
   */
  deleteDocument(documentId: string): Observable<void> {
    return this.api.delete<ApiResponse<string>>(
      `${this.endpoint}/${documentId}`
    ).pipe(map(() => void 0));
  }

  /**
   * Get document statistics
   */
  getStatistics(studentId?: string): Observable<DocumentStatistics> {
    const params: Record<string, any> = {};
    if (studentId) params['studentId'] = studentId;

    return this.api.get<ApiResponse<DocumentStatistics>>(
      `${this.endpoint}/statistics`,
      params
    ).pipe(map(response => response.data));
  }

  /**
   * Download a document file
   */
  downloadDocument(path: string): Observable<Blob> {
    return this.http.get(
      `${environment.apiUrl}/${this.endpoint}/download`,
      {
        params: { path },
        responseType: 'blob'
      }
    );
  }
}
