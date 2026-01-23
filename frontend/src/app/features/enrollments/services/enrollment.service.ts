import { Injectable, inject } from '@angular/core';
import { Observable, map, tap, catchError, of } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import {
  ApiResponse,
  PagedResponse,
  PaginationParams,
  EnrollmentListItem,
  EnrollmentDetail,
  StudentEnrollment,
  SectionEnrollment,
  EnrollStudentRequest,
  DropEnrollmentRequest,
  WithdrawEnrollmentRequest,
  EnrollmentListFilter,
  CourseSectionListItem,
  CourseSectionListFilter
} from '../../../models';

@Injectable({
  providedIn: 'root'
})
export class EnrollmentService {
  private readonly api = inject(ApiService);
  private readonly endpoint = 'enrollments';

  /**
   * Get paginated list of enrollments with optional filtering
   */
  getEnrollments(
    pagination: PaginationParams = {},
    filter: EnrollmentListFilter = {}
  ): Observable<ApiResponse<PagedResponse<EnrollmentListItem>>> {
    const params: Record<string, any> = {
      pageNumber: pagination.pageNumber ?? 1,
      pageSize: pagination.pageSize ?? 10,
      sortBy: pagination.sortBy ?? 'EnrollmentDate',
      sortDescending: pagination.sortDirection === 'asc' ? false : true
    };

    if (pagination.searchTerm) {
      params['searchTerm'] = pagination.searchTerm;
    }

    if (filter.studentId) params['studentId'] = filter.studentId;
    if (filter.courseSectionId) params['courseSectionId'] = filter.courseSectionId;
    if (filter.courseId) params['courseId'] = filter.courseId;
    if (filter.termId) params['termId'] = filter.termId;
    if (filter.status) params['status'] = filter.status;
    if (filter.isGradeFinalized !== undefined) params['isGradeFinalized'] = filter.isGradeFinalized;

    return this.api.get<ApiResponse<PagedResponse<EnrollmentListItem>>>(this.endpoint, params).pipe(
      tap(response => console.log('Enrollments API response:', response)),
      catchError(err => {
        console.error('Enrollments API error:', err);
        return of({
          succeeded: false,
          data: {
            items: [] as EnrollmentListItem[],
            totalCount: 0,
            pageNumber: 1,
            pageSize: 10,
            totalPages: 0,
            hasPreviousPage: false,
            hasNextPage: false
          },
          errors: [err.message || 'Failed to load enrollments']
        } as ApiResponse<PagedResponse<EnrollmentListItem>>);
      })
    );
  }

  /**
   * Get enrollment by ID
   */
  getEnrollment(id: string): Observable<EnrollmentDetail> {
    return this.api.get<ApiResponse<EnrollmentDetail>>(`${this.endpoint}/${id}`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get all enrollments for a student
   */
  getStudentEnrollments(
    studentId: string,
    termId?: string,
    status?: string,
    includeAll: boolean = false
  ): Observable<StudentEnrollment[]> {
    const params: Record<string, any> = { includeAll };
    if (termId) params['termId'] = termId;
    if (status) params['status'] = status;

    return this.api.get<ApiResponse<StudentEnrollment[]>>(
      `${this.endpoint}/student/${studentId}`,
      params
    ).pipe(map(response => response.data));
  }

  /**
   * Get all enrollments for a course section
   */
  getSectionEnrollments(
    sectionId: string,
    status?: string,
    includeAll: boolean = false
  ): Observable<SectionEnrollment[]> {
    const params: Record<string, any> = { includeAll };
    if (status) params['status'] = status;

    return this.api.get<ApiResponse<SectionEnrollment[]>>(
      `${this.endpoint}/section/${sectionId}`,
      params
    ).pipe(map(response => response.data));
  }

  /**
   * Enroll a student in a course section
   */
  enrollStudent(request: EnrollStudentRequest): Observable<string> {
    return this.api.post<ApiResponse<string>>(this.endpoint, request).pipe(
      map(response => response.data)
    );
  }

  /**
   * Drop an enrollment (before add/drop deadline)
   */
  dropEnrollment(id: string, request?: DropEnrollmentRequest): Observable<void> {
    return this.api.post<ApiResponse<void>>(`${this.endpoint}/${id}/drop`, request || {}).pipe(
      map(() => void 0)
    );
  }

  /**
   * Withdraw from an enrollment (after add/drop deadline)
   */
  withdrawEnrollment(id: string, request?: WithdrawEnrollmentRequest): Observable<void> {
    return this.api.post<ApiResponse<void>>(`${this.endpoint}/${id}/withdraw`, request || {}).pipe(
      map(() => void 0)
    );
  }

  /**
   * Get available course sections for enrollment
   */
  getCourseSections(
    pagination: PaginationParams = {},
    filter: CourseSectionListFilter = {}
  ): Observable<ApiResponse<PagedResponse<CourseSectionListItem>>> {
    const params: Record<string, any> = {
      pageNumber: pagination.pageNumber ?? 1,
      pageSize: pagination.pageSize ?? 10,
      sortBy: pagination.sortBy ?? 'CourseCode',
      sortDescending: pagination.sortDirection === 'desc' ? true : false
    };

    if (pagination.searchTerm) params['searchTerm'] = pagination.searchTerm;
    if (filter.courseId) params['courseId'] = filter.courseId;
    if (filter.termId) params['termId'] = filter.termId;
    if (filter.instructorId) params['instructorId'] = filter.instructorId;
    if (filter.isOpen !== undefined) params['isOpen'] = filter.isOpen;
    if (filter.hasAvailableSeats !== undefined) params['hasAvailableSeats'] = filter.hasAvailableSeats;

    return this.api.get<ApiResponse<PagedResponse<CourseSectionListItem>>>('coursesections', params);
  }

  /**
   * Get all available sections with seats for dropdown
   */
  getAvailableSections(): Observable<CourseSectionListItem[]> {
    const params = {
      pageNumber: 1,
      pageSize: 500,
      sortBy: 'CourseCode',
      sortDescending: false,
      isOpen: true,
      hasAvailableSeats: true
    };

    return this.api.get<ApiResponse<PagedResponse<CourseSectionListItem>>>('coursesections', params).pipe(
      map(response => response.data.items)
    );
  }
}
