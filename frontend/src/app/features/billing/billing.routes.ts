import { Routes } from '@angular/router';

export const BILLING_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./billing-overview/billing-overview.component').then(m => m.BillingOverviewComponent)
  },
  {
    path: 'tuition',
    loadComponent: () => import('./tuition-calculator/tuition-calculator.component').then(m => m.TuitionCalculatorComponent)
  }
];
