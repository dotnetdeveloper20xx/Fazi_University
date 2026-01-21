import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import {
  ApiResponse,
  DashboardSummary,
  StudentStatistics,
  EnrollmentStatistics,
  CourseStatistics,
  FinancialSummary
} from '../../../models';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly api = inject(ApiService);
  private readonly endpoint = 'reports';

  /**
   * Get dashboard summary with key metrics
   */
  getDashboardSummary(): Observable<DashboardSummary> {
    return this.api.get<ApiResponse<DashboardSummary>>(`${this.endpoint}/dashboard`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get student statistics
   */
  getStudentStatistics(departmentId?: string, programId?: string): Observable<StudentStatistics> {
    const params: Record<string, string> = {};
    if (departmentId) params['departmentId'] = departmentId;
    if (programId) params['programId'] = programId;

    return this.api.get<ApiResponse<StudentStatistics>>(`${this.endpoint}/students`, params).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get enrollment statistics
   */
  getEnrollmentStatistics(termId?: string, departmentId?: string): Observable<EnrollmentStatistics> {
    const params: Record<string, string> = {};
    if (termId) params['termId'] = termId;
    if (departmentId) params['departmentId'] = departmentId;

    return this.api.get<ApiResponse<EnrollmentStatistics>>(`${this.endpoint}/enrollments`, params).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get course statistics
   */
  getCourseStatistics(termId?: string, departmentId?: string): Observable<CourseStatistics> {
    const params: Record<string, string> = {};
    if (termId) params['termId'] = termId;
    if (departmentId) params['departmentId'] = departmentId;

    return this.api.get<ApiResponse<CourseStatistics>>(`${this.endpoint}/courses`, params).pipe(
      map(response => response.data)
    );
  }

  /**
   * Get financial summary
   */
  getFinancialSummary(): Observable<FinancialSummary> {
    return this.api.get<ApiResponse<FinancialSummary>>(`${this.endpoint}/financial`).pipe(
      map(response => response.data)
    );
  }
}
