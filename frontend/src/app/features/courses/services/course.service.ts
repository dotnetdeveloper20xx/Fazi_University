import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import {
  ApiResponse,
  PagedResponse,
  PaginationParams,
  CourseListItem,
  CourseDetail,
  CreateCourseRequest,
  UpdateCourseRequest,
  CourseListFilter
} from '../../../models';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private readonly api = inject(ApiService);
  private readonly endpoint = 'courses';

  /**
   * Get paginated list of courses with optional filtering
   */
  getCourses(
    pagination: PaginationParams = {},
    filter: CourseListFilter = {}
  ): Observable<ApiResponse<PagedResponse<CourseListItem>>> {
    const params: Record<string, any> = {
      pageNumber: pagination.pageNumber ?? 1,
      pageSize: pagination.pageSize ?? 10,
      sortBy: pagination.sortBy ?? 'Code',
      sortDescending: pagination.sortDirection === 'desc' ? true : (pagination.sortDirection === 'asc' ? false : false)
    };

    // Add search term
    if (pagination.searchTerm) {
      params['searchTerm'] = pagination.searchTerm;
    }

    // Add filters
    if (filter.departmentId) {
      params['departmentId'] = filter.departmentId;
    }
    if (filter.level) {
      params['level'] = filter.level;
    }
    if (filter.isActive !== undefined) {
      params['isActive'] = filter.isActive;
    }

    return this.api.get<ApiResponse<PagedResponse<CourseListItem>>>(this.endpoint, params);
  }

  /**
   * Get course by ID with prerequisites
   */
  getCourse(id: string): Observable<CourseDetail> {
    return this.api.get<ApiResponse<CourseDetail>>(`${this.endpoint}/${id}`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Create a new course
   */
  createCourse(course: CreateCourseRequest): Observable<string> {
    return this.api.post<ApiResponse<string>>(`${this.endpoint}`, course).pipe(
      map(response => response.data)
    );
  }

  /**
   * Update an existing course
   */
  updateCourse(id: string, course: UpdateCourseRequest): Observable<void> {
    return this.api.put<ApiResponse<void>>(`${this.endpoint}/${id}`, { ...course, id }).pipe(
      map(() => void 0)
    );
  }

  /**
   * Delete a course (soft delete)
   */
  deleteCourse(id: string): Observable<void> {
    return this.api.delete<ApiResponse<void>>(`${this.endpoint}/${id}`).pipe(
      map(() => void 0)
    );
  }

  /**
   * Get all courses for dropdown (no pagination)
   */
  getAllCourses(): Observable<CourseListItem[]> {
    const params = {
      pageNumber: 1,
      pageSize: 1000,
      sortBy: 'Code',
      sortDescending: false,
      isActive: true
    };

    return this.api.get<ApiResponse<PagedResponse<CourseListItem>>>(this.endpoint, params).pipe(
      map(response => response.data.items)
    );
  }

  /**
   * Get all departments for dropdown
   */
  getDepartments(): Observable<DepartmentListItem[]> {
    const params = {
      pageNumber: 1,
      pageSize: 100,
      sortBy: 'Name',
      sortDescending: false,
      isActive: true
    };

    return this.api.get<ApiResponse<PagedResponse<DepartmentListItem>>>('departments', params).pipe(
      map(response => response.data.items)
    );
  }
}

export interface DepartmentListItem {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
}
