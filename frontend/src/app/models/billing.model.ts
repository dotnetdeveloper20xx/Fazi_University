// Student Account DTO matching backend StudentAccountDto
export interface StudentAccount {
  studentId: string;
  studentId_Display: string;
  studentName: string;
  accountBalance: number;
  hasFinancialHold: boolean;
  accountStatus: string;
  recentCharges: Charge[];
  recentPayments: Payment[];
}

// Charge DTO matching backend ChargeDto
export interface Charge {
  description: string;
  amount: number;
  chargeDate: string;
  chargeType: string;
  termName: string;
}

// Payment DTO matching backend PaymentDto
export interface Payment {
  paymentId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  referenceNumber?: string;
  status: string;
}

// Tuition Calculation DTO matching backend TuitionCalculationDto
export interface TuitionCalculation {
  studentId: string;
  termId: string;
  termName: string;
  totalCredits: number;
  tuitionPerCredit: number;
  tuitionAmount: number;
  fees: number;
  totalAmount: number;
  lineItems: TuitionLineItem[];
}

// Tuition Line Item DTO matching backend TuitionLineItemDto
export interface TuitionLineItem {
  courseCode: string;
  courseName: string;
  creditHours: number;
  tuitionRate: number;
  amount: number;
}

// Add Charge Request matching backend AddChargeCommand
export interface AddChargeRequest {
  studentId: string;
  amount: number;
  description: string;
  chargeType: string;
  termId?: string;
}

// Process Payment Request matching backend ProcessPaymentCommand
export interface ProcessPaymentRequest {
  studentId: string;
  amount: number;
  paymentMethod: string;
  referenceNumber?: string;
  notes?: string;
}

// Charge types for dropdown
export const CHARGE_TYPES = [
  'Tuition',
  'Lab Fee',
  'Technology Fee',
  'Library Fee',
  'Student Activity Fee',
  'Health Fee',
  'Parking Fee',
  'Late Registration Fee',
  'Drop/Add Fee',
  'Transcript Fee',
  'Graduation Fee',
  'Other'
];

// Payment methods for dropdown
export const PAYMENT_METHODS = [
  'Credit Card',
  'Debit Card',
  'Bank Transfer',
  'Check',
  'Cash',
  'Financial Aid',
  'Scholarship',
  'Third Party'
];

// Account status types
export type AccountStatus = 'Current' | 'Past Due' | 'Collections' | 'Paid in Full';
