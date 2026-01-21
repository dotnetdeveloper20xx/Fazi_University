import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import {
  ApiResponse,
  StudentAccount,
  TuitionCalculation,
  AddChargeRequest,
  ProcessPaymentRequest
} from '../../../models';

@Injectable({
  providedIn: 'root'
})
export class BillingService {
  private readonly api = inject(ApiService);
  private readonly endpoint = 'billing';

  /**
   * Get a student's account information
   */
  getStudentAccount(studentId: string): Observable<StudentAccount> {
    return this.api.get<ApiResponse<StudentAccount>>(
      `${this.endpoint}/student/${studentId}`
    ).pipe(map(response => response.data));
  }

  /**
   * Calculate tuition for a student's enrollments in a term
   */
  calculateTuition(studentId: string, termId: string): Observable<TuitionCalculation> {
    return this.api.get<ApiResponse<TuitionCalculation>>(
      `${this.endpoint}/student/${studentId}/tuition/${termId}`
    ).pipe(map(response => response.data));
  }

  /**
   * Add a charge to a student's account
   */
  addCharge(request: AddChargeRequest): Observable<void> {
    return this.api.post<ApiResponse<void>>(
      `${this.endpoint}/charge`,
      request
    ).pipe(map(() => void 0));
  }

  /**
   * Process a payment for a student's account
   */
  processPayment(request: ProcessPaymentRequest): Observable<string> {
    return this.api.post<ApiResponse<string>>(
      `${this.endpoint}/payment`,
      request
    ).pipe(map(response => response.data));
  }
}
