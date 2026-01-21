import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import {
  ApiResponse,
  Transcript,
  GpaSummary,
  SubmitGradeRequest
} from '../../../models';

@Injectable({
  providedIn: 'root'
})
export class GradeService {
  private readonly api = inject(ApiService);
  private readonly endpoint = 'grades';

  /**
   * Submit a grade for an enrollment
   */
  submitGrade(request: SubmitGradeRequest): Observable<void> {
    return this.api.post<ApiResponse<void>>(this.endpoint, request).pipe(
      map(() => void 0)
    );
  }

  /**
   * Finalize all grades for a course section
   * Returns the number of grades finalized
   */
  finalizeGrades(sectionId: string): Observable<number> {
    return this.api.post<ApiResponse<number>>(
      `${this.endpoint}/section/${sectionId}/finalize`,
      {}
    ).pipe(map(response => response.data));
  }

  /**
   * Get a student's transcript
   */
  getStudentTranscript(studentId: string): Observable<Transcript> {
    return this.api.get<ApiResponse<Transcript>>(
      `${this.endpoint}/student/${studentId}/transcript`
    ).pipe(map(response => response.data));
  }

  /**
   * Get a student's GPA summary
   */
  getStudentGpa(studentId: string): Observable<GpaSummary> {
    return this.api.get<ApiResponse<GpaSummary>>(
      `${this.endpoint}/student/${studentId}/gpa`
    ).pipe(map(response => response.data));
  }
}
