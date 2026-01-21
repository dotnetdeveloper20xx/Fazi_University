import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-scheduling-calendar',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `<div class="space-y-6"><h1 class="text-2xl font-bold">Scheduling</h1><mat-card class="p-6"><p class="text-gray-500">Room scheduling coming soon...</p></mat-card></div>`,
})
export class SchedulingCalendarComponent {}
