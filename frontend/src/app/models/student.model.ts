// Student list item (for tables)
export interface StudentListItem {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  status: StudentStatus;
  type: StudentType;
  programName?: string;
  departmentName?: string;
  cumulativeGpa: number;
  academicStanding: AcademicStanding;
  hasFinancialHold: boolean;
  hasAcademicHold: boolean;
  createdAt: string;
}

// Student detail (full information)
export interface StudentDetail {
  id: string;
  studentId: string;
  userId?: string;

  // Personal Information
  firstName: string;
  middleName: string;
  lastName: string;
  fullName: string;
  dateOfBirth: string;
  gender: Gender;
  nationalId?: string;
  passportNumber?: string;

  // Contact Information
  email: string;
  personalEmail?: string;
  phone?: string;
  mobilePhone?: string;

  // Address
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;

  // Academic Information
  status: StudentStatus;
  type: StudentType;
  admissionDate: string;
  graduationDate?: string;
  expectedGraduationDate?: string;

  // Program Information
  programId?: string;
  programName?: string;
  departmentId?: string;
  departmentName?: string;
  advisorId?: string;
  advisorName?: string;

  // Academic Standing
  cumulativeGpa: number;
  totalCreditsEarned: number;
  totalCreditsAttempted: number;
  academicStanding: AcademicStanding;

  // Emergency Contact
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;

  // Financial
  hasFinancialHold: boolean;
  hasAcademicHold: boolean;
  accountBalance: number;

  // Audit
  createdAt: string;
  modifiedAt?: string;
}

export type Gender = 'Male' | 'Female' | 'Other' | 'PreferNotToSay';

export type StudentStatus = 'Admitted' | 'Active' | 'Inactive' | 'Graduated' | 'Suspended' | 'Withdrawn' | 'OnLeave';

export type StudentType = 'FullTime' | 'PartTime' | 'Online' | 'Exchange' | 'NonDegree';

export type AcademicStanding = 'GoodStanding' | 'Probation' | 'AcademicWarning' | 'Dismissed';

export interface CreateStudentRequest {
  // Personal Information
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender;
  nationalId?: string;
  passportNumber?: string;

  // Contact Information
  email: string;
  personalEmail?: string;
  phone?: string;
  mobilePhone?: string;

  // Address
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;

  // Academic Information
  type?: StudentType;
  programId?: string;
  departmentId?: string;
  advisorId?: string;
  expectedGraduationDate?: string;

  // Emergency Contact
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;

  // Create user account?
  createUserAccount?: boolean;
}

export interface UpdateStudentRequest extends CreateStudentRequest {
  id: string;
  status?: StudentStatus;
}

export interface StudentListFilter {
  status?: StudentStatus;
  type?: StudentType;
  academicStanding?: AcademicStanding;
  programId?: string;
  departmentId?: string;
  hasHold?: boolean;
  searchTerm?: string;
}
