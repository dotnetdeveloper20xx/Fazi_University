import { Routes } from '@angular/router';

export const SCHEDULING_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./scheduling-calendar/scheduling-calendar.component').then(m => m.SchedulingCalendarComponent) }
];
