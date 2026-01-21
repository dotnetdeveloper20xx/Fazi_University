// Course List Item - matches backend CourseListDto
export interface CourseListItem {
  id: string;
  code: string;
  name: string;
  departmentName: string;
  creditHours: number;
  level: CourseLevel;
  isActive: boolean;
  sectionCount: number;
}

// Course Detail - matches backend CourseDto
export interface CourseDetail {
  id: string;
  code: string;
  name: string;
  description?: string;
  departmentId: string;
  departmentName: string;
  creditHours: number;
  lectureHours: number;
  labHours: number;
  level: CourseLevel;
  isActive: boolean;
  prerequisites: CoursePrerequisite[];
  sectionCount: number;
  createdAt: string;
}

// Course Prerequisite - matches backend CoursePrerequisiteDto
export interface CoursePrerequisite {
  courseId: string;
  courseCode: string;
  courseName: string;
  minimumGrade?: string;
  isConcurrent: boolean;
}

// Create Course Request - matches backend CreateCourseCommand
export interface CreateCourseRequest {
  code: string;
  name: string;
  description?: string;
  departmentId: string;
  creditHours: number;
  lectureHours: number;
  labHours: number;
  level: CourseLevel;
  prerequisites?: CoursePrerequisiteInput[];
}

// Update Course Request - matches backend UpdateCourseCommand
export interface UpdateCourseRequest {
  name?: string;
  description?: string;
  creditHours?: number;
  lectureHours?: number;
  labHours?: number;
  isActive?: boolean;
}

// Course Prerequisite Input for create/edit
export interface CoursePrerequisiteInput {
  prerequisiteCourseId: string;
  minimumGrade?: string;
  isConcurrent: boolean;
}

export type CourseLevel = 'Undergraduate' | 'Graduate' | 'Doctoral' | 'Professional';

// Course List Filter
export interface CourseListFilter {
  departmentId?: string;
  level?: CourseLevel;
  isActive?: boolean;
}

export interface CourseSection {
  id: string;
  courseId: string;
  course?: CourseListItem;
  sectionNumber: string;
  termId: string;
  term?: Term;
  instructorId?: string;
  instructorName?: string;
  roomId?: string;
  roomName?: string;
  capacity: number;
  enrolledCount: number;
  waitlistCount: number;
  schedule: SectionSchedule[];
  status: SectionStatus;
  startDate: Date;
  endDate: Date;
}

export interface SectionSchedule {
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
}

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export type SectionStatus = 'Open' | 'Closed' | 'Cancelled' | 'Waitlist';

export interface Term {
  id: string;
  name: string;
  code: string;
  startDate: Date;
  endDate: Date;
  registrationStartDate: Date;
  registrationEndDate: Date;
  addDropDeadline: Date;
  withdrawalDeadline: Date;
  gradingDeadline: Date;
  isActive: boolean;
  isCurrent: boolean;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  headOfDepartmentId?: string;
  headOfDepartmentName?: string;
  isActive: boolean;
}

export interface Program {
  id: string;
  name: string;
  code: string;
  description?: string;
  departmentId: string;
  departmentName: string;
  degreeType: DegreeType;
  requiredCredits: number;
  isActive: boolean;
}

export type DegreeType = 'Certificate' | 'Associate' | 'Bachelor' | 'Master' | 'Doctorate';
