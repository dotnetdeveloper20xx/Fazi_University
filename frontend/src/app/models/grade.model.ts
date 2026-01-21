// Grade information DTO matching backend GradeDto
export interface GradeInfo {
  enrollmentId: string;
  courseCode: string;
  courseName: string;
  sectionNumber: string;
  creditHours: number;
  termName: string;
  grade?: string;
  gradePoints?: number;
  numericGrade?: number;
  isGradeFinalized: boolean;
  gradeSubmittedAt?: string;
  gradeSubmittedBy?: string;
}

// Student transcript DTO matching backend TranscriptDto
export interface Transcript {
  studentId: string;
  studentId_Display: string;
  studentName: string;
  programName: string;
  cumulativeGpa: number;
  totalCreditsAttempted: number;
  totalCreditsEarned: number;
  totalGradePoints: number;
  terms: TranscriptTerm[];
}

// Transcript term details matching backend TranscriptTermDto
export interface TranscriptTerm {
  termId: string;
  termName: string;
  termGpa: number;
  creditsAttempted: number;
  creditsEarned: number;
  courses: TranscriptCourse[];
}

// Transcript course details matching backend TranscriptCourseDto
export interface TranscriptCourse {
  courseCode: string;
  courseName: string;
  creditHours: number;
  grade?: string;
  gradePoints?: number;
  qualityPoints?: number;
}

// GPA Summary DTO matching backend GpaSummaryDto
export interface GpaSummary {
  studentId: string;
  studentId_Display: string;
  studentName: string;
  cumulativeGpa: number;
  totalCreditsAttempted: number;
  totalCreditsEarned: number;
  currentTermGpa?: number;
  currentTermCredits?: number;
  academicStanding: string;
}

// Submit grade request matching backend SubmitGradeCommand
export interface SubmitGradeRequest {
  enrollmentId: string;
  grade: string;
  numericGrade?: number;
  notes?: string;
}

// For displaying grades in a section (combined with enrollment data)
export interface SectionGradeEntry {
  enrollmentId: string;
  studentId: string;
  studentId_Display: string;
  studentName: string;
  grade?: string;
  numericGrade?: number;
  gradePoints?: number;
  isGradeFinalized: boolean;
  attendancePercentage?: number;
}

// Grade scale constants
export const GRADE_SCALE: { [key: string]: number } = {
  'A+': 4.0,
  'A': 4.0,
  'A-': 3.7,
  'B+': 3.3,
  'B': 3.0,
  'B-': 2.7,
  'C+': 2.3,
  'C': 2.0,
  'C-': 1.7,
  'D+': 1.3,
  'D': 1.0,
  'D-': 0.7,
  'F': 0.0,
  'W': -1,  // Withdrawn - not counted in GPA
  'WF': 0.0, // Withdrawal Failing - counted as F
  'I': -1,  // Incomplete - not counted in GPA
  'P': -1,  // Pass - not counted in GPA
  'NP': -1, // No Pass - not counted in GPA
};

export const VALID_LETTER_GRADES = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F', 'W', 'WF', 'I', 'P', 'NP'];

// Note: AcademicStanding type is defined in student.model.ts
