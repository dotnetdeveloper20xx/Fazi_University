// Enrollment List Item - matches backend EnrollmentListDto
export interface EnrollmentListItem {
  id: string;
  studentId_Display: string;
  studentName: string;
  courseCode: string;
  courseName: string;
  sectionNumber: string;
  termName: string;
  status: EnrollmentStatus;
  enrollmentDate: string;
  grade?: string;
  isGradeFinalized: boolean;
}

// Enrollment Detail - matches backend EnrollmentDto
export interface EnrollmentDetail {
  id: string;
  studentId: string;
  studentId_Display: string;
  studentName: string;
  courseSectionId: string;
  courseCode: string;
  courseName: string;
  sectionNumber: string;
  termName: string;
  status: EnrollmentStatus;
  enrollmentDate: string;
  dropDate?: string;
  withdrawalDate?: string;
  grade?: string;
  gradePoints?: number;
  numericGrade?: number;
  isGradeFinalized: boolean;
  attendancePercentage?: number;
  notes?: string;
  creditHours: number;
  instructorName?: string;
  schedule?: string;
}

// Student Enrollment - matches backend StudentEnrollmentDto
export interface StudentEnrollment {
  id: string;
  courseSectionId: string;
  courseCode: string;
  courseName: string;
  sectionNumber: string;
  creditHours: number;
  instructorName?: string;
  schedule?: string;
  room?: string;
  building?: string;
  termName: string;
  status: EnrollmentStatus;
  enrollmentDate: string;
  grade?: string;
  gradePoints?: number;
  isGradeFinalized: boolean;
}

// Section Enrollment - matches backend SectionEnrollmentDto
export interface SectionEnrollment {
  id: string;
  studentId: string;
  studentId_Display: string;
  studentName: string;
  studentEmail: string;
  programName: string;
  status: EnrollmentStatus;
  enrollmentDate: string;
  grade?: string;
  numericGrade?: number;
  isGradeFinalized: boolean;
  attendancePercentage?: number;
}

// Course Section List Item - matches backend CourseSectionListDto
export interface CourseSectionListItem {
  id: string;
  courseCode: string;
  courseName: string;
  sectionNumber: string;
  instructorName?: string;
  maxEnrollment: number;
  currentEnrollment: number;
  availableSeats: number;
  schedule?: string;
  room?: string;
  isOpen: boolean;
  isCancelled: boolean;
  termName?: string;
}

// Course Section Detail - matches backend CourseSectionDto
export interface CourseSectionDetail {
  id: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  termId: string;
  termName: string;
  sectionNumber: string;
  instructorId?: string;
  instructorName?: string;
  maxEnrollment: number;
  currentEnrollment: number;
  waitlistCapacity: number;
  waitlistCount: number;
  room?: string;
  building?: string;
  schedule?: string;
  startTime?: string;
  endTime?: string;
  daysOfWeek?: string;
  isOpen: boolean;
  isCancelled: boolean;
  availableSeats: number;
  createdAt: string;
}

// Enroll Student Request - matches backend EnrollStudentCommand
export interface EnrollStudentRequest {
  studentId: string;
  courseSectionId: string;
  notes?: string;
}

// Drop/Withdraw Request
export interface DropEnrollmentRequest {
  reason?: string;
}

export interface WithdrawEnrollmentRequest {
  reason?: string;
}

// Enrollment Status
export type EnrollmentStatus = 'Enrolled' | 'Dropped' | 'Withdrawn' | 'Completed' | 'Waitlisted' | 'Failed';

// Enrollment List Filter
export interface EnrollmentListFilter {
  studentId?: string;
  courseSectionId?: string;
  courseId?: string;
  termId?: string;
  status?: EnrollmentStatus;
  isGradeFinalized?: boolean;
}

// Course Section List Filter
export interface CourseSectionListFilter {
  courseId?: string;
  termId?: string;
  instructorId?: string;
  isOpen?: boolean;
  hasAvailableSeats?: boolean;
}
