import { Routes } from '@angular/router';

export const GRADES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./grade-list/grade-list.component').then(m => m.GradeListComponent)
  },
  {
    path: 'transcript',
    loadComponent: () => import('./transcript/transcript.component').then(m => m.TranscriptComponent)
  }
];
