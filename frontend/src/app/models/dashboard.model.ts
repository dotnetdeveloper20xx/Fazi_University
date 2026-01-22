// Dashboard Summary
export interface DashboardSummary {
  totalStudents: number;
  totalCourses: number;
  totalEnrollments: number;
  activeTerms: number;
  totalRevenue: number;
  outstandingBalance: number;
  averageGpa: number;
  recentActivities: RecentActivity[];
  upcomingDeadlines: UpcomingDeadline[];
  // Chart data
  gradeDistribution?: GradeDistributionItem[];
  enrollmentsByStatus?: EnrollmentStatusItem[];
  enrollmentTrend?: EnrollmentTrendItem[];
}

export interface GradeDistributionItem {
  grade: string;
  count: number;
}

export interface EnrollmentStatusItem {
  status: string;
  count: number;
}

export interface EnrollmentTrendItem {
  term: string;
  count: number;
}

export interface RecentActivity {
  timestamp: string;
  activityType: string;
  description: string;
  entityId?: string;
}

export interface UpcomingDeadline {
  deadline: string;
  deadlineType: string;
  description: string;
  termId?: string;
  termName?: string;
}

// Student Statistics
export interface StudentStatistics {
  totalStudents: number;
  activeStudents: number;
  graduatedStudents: number;
  suspendedStudents: number;
  withdrawnStudents: number;
  averageGpa: number;
  byProgram: StudentsByProgram[];
  byAcademicStanding: StudentsByStanding[];
  byType: StudentsByType[];
}

export interface StudentsByProgram {
  programId: string;
  programName: string;
  studentCount: number;
  averageGpa: number;
}

export interface StudentsByStanding {
  academicStanding: string;
  studentCount: number;
  percentage: number;
}

export interface StudentsByType {
  studentType: string;
  studentCount: number;
  percentage: number;
}

// Enrollment Statistics
export interface EnrollmentStatistics {
  totalEnrollments: number;
  activeEnrollments: number;
  droppedEnrollments: number;
  withdrawnEnrollments: number;
  completedEnrollments: number;
  waitlistedStudents: number;
  averageEnrollmentsPerStudent: number;
  averageEnrollmentsPerSection: number;
  enrollmentsByTerm: EnrollmentByTerm[];
  enrollmentsByDepartment: EnrollmentByDepartment[];
}

export interface EnrollmentByTerm {
  termId: string;
  termName: string;
  totalEnrollments: number;
  uniqueStudents: number;
}

export interface EnrollmentByDepartment {
  departmentId: string;
  departmentName: string;
  totalEnrollments: number;
  totalSections: number;
}

// Course Statistics
export interface CourseStatistics {
  totalCourses: number;
  activeCourses: number;
  totalSections: number;
  openSections: number;
  fullSections: number;
  cancelledSections: number;
  averageEnrollmentRate: number;
  mostPopularCourses: CoursePopularity[];
  leastPopularCourses: CoursePopularity[];
}

export interface CoursePopularity {
  courseId: string;
  courseCode: string;
  courseName: string;
  totalEnrollments: number;
  totalSections: number;
  fillRate: number;
}

// Financial Summary
export interface FinancialSummary {
  totalCharges: number;
  totalPayments: number;
  outstandingBalance: number;
  studentsWithBalance: number;
  studentsWithFinancialHold: number;
  averageBalance: number;
  byTerm: FinancialByTerm[];
}

export interface FinancialByTerm {
  termId: string;
  termName: string;
  totalTuition: number;
  totalFees: number;
  totalCollected: number;
}
