import { Routes } from '@angular/router';

export const SCHEDULING_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'calendar',
    pathMatch: 'full'
  },
  {
    path: 'calendar',
    loadComponent: () => import('./scheduling-calendar/scheduling-calendar.component').then(m => m.SchedulingCalendarComponent)
  },
  {
    path: 'rooms',
    loadComponent: () => import('./room-list/room-list.component').then(m => m.RoomListComponent)
  }
];
