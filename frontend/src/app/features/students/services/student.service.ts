import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import {
  ApiResponse,
  PagedResponse,
  PaginationParams,
  StudentListItem,
  StudentDetail,
  CreateStudentRequest,
  UpdateStudentRequest,
  StudentListFilter
} from '../../../models';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private readonly api = inject(ApiService);
  private readonly endpoint = 'students';

  /**
   * Get paginated list of students with optional filtering
   */
  getStudents(
    pagination: PaginationParams = {},
    filter: StudentListFilter = {}
  ): Observable<ApiResponse<PagedResponse<StudentListItem>>> {
    const params: Record<string, any> = {
      pageNumber: pagination.pageNumber ?? 1,
      pageSize: pagination.pageSize ?? 10,
      sortBy: pagination.sortBy ?? 'CreatedAt',
      sortDescending: pagination.sortDirection === 'desc' ? true : (pagination.sortDirection === 'asc' ? false : true)
    };

    // Add search term
    if (pagination.searchTerm) {
      params['searchTerm'] = pagination.searchTerm;
    }

    // Add filters
    if (filter.status) {
      params['status'] = filter.status;
    }
    if (filter.type) {
      params['type'] = filter.type;
    }
    if (filter.academicStanding) {
      params['academicStanding'] = filter.academicStanding;
    }
    if (filter.programId) {
      params['programId'] = filter.programId;
    }
    if (filter.departmentId) {
      params['departmentId'] = filter.departmentId;
    }
    if (filter.hasHold !== undefined) {
      params['hasHold'] = filter.hasHold;
    }

    return this.api.get<ApiResponse<PagedResponse<StudentListItem>>>(this.endpoint, params);
  }

  /**
   * Get student by ID
   */
  getStudent(id: string): Observable<StudentDetail> {
    return this.api.get<ApiResponse<StudentDetail>>(`${this.endpoint}/${id}`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Create a new student
   */
  createStudent(student: CreateStudentRequest): Observable<string> {
    return this.api.post<ApiResponse<string>>(`${this.endpoint}`, student).pipe(
      map(response => response.data)
    );
  }

  /**
   * Update an existing student
   */
  updateStudent(id: string, student: UpdateStudentRequest): Observable<void> {
    return this.api.put<ApiResponse<void>>(`${this.endpoint}/${id}`, { ...student, id }).pipe(
      map(() => void 0)
    );
  }

  /**
   * Delete a student (soft delete)
   */
  deleteStudent(id: string): Observable<void> {
    return this.api.delete<ApiResponse<void>>(`${this.endpoint}/${id}`).pipe(
      map(() => void 0)
    );
  }
}
