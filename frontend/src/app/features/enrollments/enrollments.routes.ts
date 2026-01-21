import { Routes } from '@angular/router';

export const ENROLLMENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./enrollment-list/enrollment-list.component').then(m => m.EnrollmentListComponent)
  },
  {
    path: 'new',
    loadComponent: () => import('./enroll-student/enroll-student.component').then(m => m.EnrollStudentComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./enrollment-detail/enrollment-detail.component').then(m => m.EnrollmentDetailComponent)
  }
];
