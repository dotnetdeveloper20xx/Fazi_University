import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { AuthService } from '../../core/auth/auth.service';
import { DashboardService } from './services/dashboard.service';
import { DashboardSummary, RecentActivity } from '../../models';
import { fadeIn, slideUp, staggeredList } from '../../shared/animations';

interface DashboardStat {
  label: string;
  value: string;
  icon: string;
  bgColor: string;
  iconColor: string;
  change?: number;
  route?: string;
}

interface ActivityDisplay {
  id: string;
  title: string;
  description: string;
  icon: string;
  bgColor: string;
  iconColor: string;
  time: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    NgxChartsModule
  ],
  animations: [fadeIn, slideUp, staggeredList],
  template: `
    <div class="space-y-6" @fadeIn>
      <!-- Welcome section -->
      <div class="bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl p-6 text-white slide-up">
        <h1 class="text-2xl font-bold mb-2">
          Welcome back, {{ authService.currentUser()?.firstName }}!
        </h1>
        <p class="text-primary-100">
          Here's what's happening in your university today.
        </p>
      </div>

      <!-- Quick stats -->
      @if (isLoading()) {
        <div class="flex items-center justify-center p-12">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" [@staggeredList]="dashboardStats().length">
          @for (stat of dashboardStats(); track stat.label) {
            <mat-card class="hover-lift cursor-pointer" [routerLink]="stat.route">
              <mat-card-content class="p-6">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-gray-500 dark:text-gray-400 text-sm">{{ stat.label }}</p>
                    <p class="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                      {{ stat.value }}
                    </p>
                    @if (stat.change !== undefined) {
                      <p class="text-sm mt-2" [class]="stat.change >= 0 ? 'text-green-600' : 'text-red-600'">
                        {{ stat.change >= 0 ? '+' : '' }}{{ stat.change }}% from last term
                      </p>
                    }
                  </div>
                  <div class="w-12 h-12 rounded-full flex items-center justify-center"
                       [class]="stat.bgColor">
                    <mat-icon [class]="stat.iconColor">{{ stat.icon }}</mat-icon>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          }
        </div>

        <!-- Quick Actions -->
        <mat-card>
          <mat-card-header>
            <mat-card-title>Quick Actions</mat-card-title>
          </mat-card-header>
          <mat-card-content class="p-6">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              @for (action of quickActions(); track action.label) {
                <a
                  [routerLink]="action.route"
                  class="flex flex-col items-center justify-center p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all hover-lift-sm"
                >
                  <mat-icon class="text-primary-600 dark:text-primary-400 mb-2">{{ action.icon }}</mat-icon>
                  <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ action.label }}</span>
                </a>
              }
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Additional Stats for Admin -->
        @if (authService.isAdmin() && summary()) {
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Financial Overview -->
            <mat-card>
              <mat-card-header>
                <mat-card-title>Financial Overview</mat-card-title>
              </mat-card-header>
              <mat-card-content class="p-6">
                <div class="grid grid-cols-2 gap-4">
                  <div class="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p class="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
                    <p class="text-xl font-bold text-green-600">
                      {{ summary()!.totalRevenue | currency }}
                    </p>
                  </div>
                  <div class="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <p class="text-sm text-gray-500 dark:text-gray-400">Outstanding Balance</p>
                    <p class="text-xl font-bold text-red-600">
                      {{ summary()!.outstandingBalance | currency }}
                    </p>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>

            <!-- Academic Overview -->
            <mat-card>
              <mat-card-header>
                <mat-card-title>Academic Overview</mat-card-title>
              </mat-card-header>
              <mat-card-content class="p-6">
                <div class="grid grid-cols-2 gap-4">
                  <div class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p class="text-sm text-gray-500 dark:text-gray-400">Active Terms</p>
                    <p class="text-xl font-bold text-blue-600">{{ summary()!.activeTerms }}</p>
                  </div>
                  <div class="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <p class="text-sm text-gray-500 dark:text-gray-400">Average GPA</p>
                    <p class="text-xl font-bold text-purple-600">
                      {{ summary()!.averageGpa | number:'1.2-2' }}
                    </p>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </div>

          <!-- Charts Section -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Grade Distribution Chart -->
            <mat-card>
              <mat-card-header>
                <mat-card-title>Grade Distribution</mat-card-title>
              </mat-card-header>
              <mat-card-content class="p-4">
                <div class="h-64">
                  <ngx-charts-bar-vertical
                    [results]="gradeDistributionData()"
                    [xAxis]="true"
                    [yAxis]="true"
                    [showXAxisLabel]="true"
                    [showYAxisLabel]="true"
                    xAxisLabel="Grade"
                    yAxisLabel="Students"
                    [gradient]="true"
                    [scheme]="colorScheme">
                  </ngx-charts-bar-vertical>
                </div>
              </mat-card-content>
            </mat-card>

            <!-- Enrollment Status Chart -->
            <mat-card>
              <mat-card-header>
                <mat-card-title>Enrollment Status</mat-card-title>
              </mat-card-header>
              <mat-card-content class="p-4">
                <div class="h-64">
                  <ngx-charts-pie-chart
                    [results]="enrollmentStatusData()"
                    [labels]="true"
                    [doughnut]="true"
                    [scheme]="colorScheme">
                  </ngx-charts-pie-chart>
                </div>
              </mat-card-content>
            </mat-card>
          </div>

          <!-- Enrollment Trend Chart -->
          <mat-card>
            <mat-card-header>
              <mat-card-title>Enrollment Trends (Last 6 Terms)</mat-card-title>
            </mat-card-header>
            <mat-card-content class="p-4">
              <div class="h-72">
                <ngx-charts-line-chart
                  [results]="enrollmentTrendData()"
                  [xAxis]="true"
                  [yAxis]="true"
                  [showXAxisLabel]="true"
                  [showYAxisLabel]="true"
                  xAxisLabel="Term"
                  yAxisLabel="Enrollments"
                  [autoScale]="true"
                  [scheme]="colorScheme">
                </ngx-charts-line-chart>
              </div>
            </mat-card-content>
          </mat-card>
        }

        <!-- Upcoming Deadlines -->
        @if (upcomingDeadlines().length > 0) {
          <mat-card>
            <mat-card-header>
              <mat-card-title>Upcoming Deadlines</mat-card-title>
            </mat-card-header>
            <mat-card-content class="p-6">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                @for (deadline of upcomingDeadlines(); track deadline.description) {
                  <div class="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div class="flex items-center gap-2 mb-2">
                      <mat-icon class="text-orange-500">event</mat-icon>
                      <span class="font-medium text-gray-900 dark:text-gray-100">
                        {{ deadline.deadlineType }}
                      </span>
                    </div>
                    <p class="text-sm text-gray-600 dark:text-gray-400">{{ deadline.description }}</p>
                    <p class="text-xs text-gray-400 mt-2">
                      {{ deadline.deadline | date:'mediumDate' }}
                      @if (deadline.termName) {
                        <span> • {{ deadline.termName }}</span>
                      }
                    </p>
                  </div>
                }
              </div>
            </mat-card-content>
          </mat-card>
        }
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class DashboardComponent implements OnInit {
  readonly authService = inject(AuthService);
  private readonly dashboardService = inject(DashboardService);

  isLoading = signal(false);
  summary = signal<DashboardSummary | null>(null);

  // Chart configuration - using built-in scheme name
  colorScheme = 'cool';

  ngOnInit(): void {
    this.loadDashboardData();
  }

  // Chart data computed signals
  gradeDistributionData = computed(() => {
    const data = this.summary();
    if (!data?.gradeDistribution) {
      // Default sample data
      return [
        { name: 'A', value: 245 },
        { name: 'B', value: 412 },
        { name: 'C', value: 328 },
        { name: 'D', value: 156 },
        { name: 'F', value: 89 },
        { name: 'W', value: 67 }
      ];
    }
    return data.gradeDistribution.map(g => ({ name: g.grade, value: g.count }));
  });

  enrollmentStatusData = computed(() => {
    const data = this.summary();
    if (!data?.enrollmentsByStatus) {
      // Default sample data
      return [
        { name: 'Enrolled', value: 3200 },
        { name: 'Completed', value: 1850 },
        { name: 'Withdrawn', value: 245 },
        { name: 'Waitlisted', value: 120 }
      ];
    }
    return data.enrollmentsByStatus.map(e => ({ name: e.status, value: e.count }));
  });

  enrollmentTrendData = computed(() => {
    const data = this.summary();
    if (!data?.enrollmentTrend) {
      // Default sample data
      return [{
        name: 'Enrollments',
        series: [
          { name: 'Fall 2024', value: 4200 },
          { name: 'Spring 2025', value: 4450 },
          { name: 'Summer 2025', value: 1850 },
          { name: 'Fall 2025', value: 4680 },
          { name: 'Spring 2026', value: 4890 },
          { name: 'Summer 2026', value: 2100 }
        ]
      }];
    }
    return [{
      name: 'Enrollments',
      series: data.enrollmentTrend.map(t => ({ name: t.term, value: t.count }))
    }];
  });

  loadDashboardData(): void {
    this.isLoading.set(true);

    this.dashboardService.getDashboardSummary().subscribe({
      next: (data) => {
        this.summary.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        // Fallback to empty/default values on error
        this.isLoading.set(false);
      }
    });
  }

  dashboardStats = computed((): DashboardStat[] => {
    const isAdmin = this.authService.isAdmin();
    const isFaculty = this.authService.isFaculty();
    const isStudent = this.authService.isStudent();
    const data = this.summary();

    if (isAdmin && data) {
      return [
        {
          label: 'Total Students',
          value: data.totalStudents.toLocaleString(),
          icon: 'school',
          bgColor: 'bg-blue-100',
          iconColor: 'text-blue-600',
          route: '/students'
        },
        {
          label: 'Active Courses',
          value: data.totalCourses.toLocaleString(),
          icon: 'menu_book',
          bgColor: 'bg-green-100',
          iconColor: 'text-green-600',
          route: '/courses'
        },
        {
          label: 'Total Enrollments',
          value: data.totalEnrollments.toLocaleString(),
          icon: 'assignment',
          bgColor: 'bg-purple-100',
          iconColor: 'text-purple-600',
          route: '/enrollments'
        },
        {
          label: 'Average GPA',
          value: data.averageGpa.toFixed(2),
          icon: 'grade',
          bgColor: 'bg-orange-100',
          iconColor: 'text-orange-600',
          route: '/grades'
        },
      ];
    }

    if (isAdmin) {
      // Default stats while loading
      return [
        { label: 'Total Students', value: '-', icon: 'school', bgColor: 'bg-blue-100', iconColor: 'text-blue-600', route: '/students' },
        { label: 'Active Courses', value: '-', icon: 'menu_book', bgColor: 'bg-green-100', iconColor: 'text-green-600', route: '/courses' },
        { label: 'Total Enrollments', value: '-', icon: 'assignment', bgColor: 'bg-purple-100', iconColor: 'text-purple-600', route: '/enrollments' },
        { label: 'Average GPA', value: '-', icon: 'grade', bgColor: 'bg-orange-100', iconColor: 'text-orange-600', route: '/grades' },
      ];
    }

    if (isFaculty) {
      return [
        { label: 'My Courses', value: '4', icon: 'menu_book', bgColor: 'bg-blue-100', iconColor: 'text-blue-600', route: '/courses' },
        { label: 'Students', value: '124', icon: 'school', bgColor: 'bg-green-100', iconColor: 'text-green-600', route: '/enrollments' },
        { label: 'Pending Grades', value: '18', icon: 'grade', bgColor: 'bg-orange-100', iconColor: 'text-orange-600', route: '/grades' },
        { label: 'Office Hours', value: '6', icon: 'schedule', bgColor: 'bg-purple-100', iconColor: 'text-purple-600', route: '/scheduling' },
      ];
    }

    if (isStudent) {
      return [
        { label: 'Enrolled Courses', value: '5', icon: 'menu_book', bgColor: 'bg-blue-100', iconColor: 'text-blue-600', route: '/enrollments' },
        { label: 'Current GPA', value: '3.75', icon: 'grade', bgColor: 'bg-green-100', iconColor: 'text-green-600', route: '/grades' },
        { label: 'Credits Earned', value: '68', icon: 'school', bgColor: 'bg-purple-100', iconColor: 'text-purple-600', route: '/grades' },
        { label: 'Account Balance', value: '$1,250', icon: 'payments', bgColor: 'bg-orange-100', iconColor: 'text-orange-600', route: '/billing' },
      ];
    }

    return [];
  });

  quickActions = computed(() => {
    const isAdmin = this.authService.isAdmin();
    const isFaculty = this.authService.isFaculty();
    const isStudent = this.authService.isStudent();

    if (isAdmin) {
      return [
        { label: 'Add Student', icon: 'person_add', route: '/students/new' },
        { label: 'Create Course', icon: 'add_circle', route: '/courses/new' },
        { label: 'View Reports', icon: 'assessment', route: '/reports' },
        { label: 'System Settings', icon: 'settings', route: '/settings' },
      ];
    }

    if (isFaculty) {
      return [
        { label: 'Enter Grades', icon: 'grade', route: '/grades' },
        { label: 'View Roster', icon: 'people', route: '/enrollments' },
        { label: 'Schedule', icon: 'event', route: '/scheduling' },
        { label: 'Messages', icon: 'mail', route: '/notifications' },
      ];
    }

    if (isStudent) {
      return [
        { label: 'Register Classes', icon: 'add_circle', route: '/enrollments' },
        { label: 'View Grades', icon: 'grade', route: '/grades' },
        { label: 'Pay Balance', icon: 'payment', route: '/billing' },
        { label: 'Documents', icon: 'folder', route: '/documents' },
      ];
    }

    return [];
  });

  recentActivities = computed((): ActivityDisplay[] => {
    const data = this.summary();
    if (!data?.recentActivities?.length) {
      return [];
    }

    return data.recentActivities.map((activity, index) => ({
      id: activity.entityId || `activity-${index}`,
      title: this.getActivityTitle(activity.activityType),
      description: activity.description,
      icon: this.getActivityIcon(activity.activityType),
      bgColor: this.getActivityBgColor(activity.activityType),
      iconColor: this.getActivityIconColor(activity.activityType),
      time: this.getRelativeTime(activity.timestamp)
    }));
  });

  upcomingDeadlines = computed(() => {
    const data = this.summary();
    return data?.upcomingDeadlines || [];
  });

  private getActivityTitle(activityType: string): string {
    const titles: Record<string, string> = {
      'Enrollment': 'New Enrollment',
      'GradeSubmitted': 'Grade Submitted',
      'Payment': 'Payment Received',
      'StudentCreated': 'New Student',
      'CourseCreated': 'New Course',
      'default': activityType
    };
    return titles[activityType] || titles['default'];
  }

  private getActivityIcon(activityType: string): string {
    const icons: Record<string, string> = {
      'Enrollment': 'assignment',
      'GradeSubmitted': 'grade',
      'Payment': 'payments',
      'StudentCreated': 'person_add',
      'CourseCreated': 'menu_book',
      'default': 'info'
    };
    return icons[activityType] || icons['default'];
  }

  private getActivityBgColor(activityType: string): string {
    const colors: Record<string, string> = {
      'Enrollment': 'bg-blue-100',
      'GradeSubmitted': 'bg-green-100',
      'Payment': 'bg-purple-100',
      'StudentCreated': 'bg-teal-100',
      'CourseCreated': 'bg-orange-100',
      'default': 'bg-gray-100'
    };
    return colors[activityType] || colors['default'];
  }

  private getActivityIconColor(activityType: string): string {
    const colors: Record<string, string> = {
      'Enrollment': 'text-blue-600',
      'GradeSubmitted': 'text-green-600',
      'Payment': 'text-purple-600',
      'StudentCreated': 'text-teal-600',
      'CourseCreated': 'text-orange-600',
      'default': 'text-gray-600'
    };
    return colors[activityType] || colors['default'];
  }

  private getRelativeTime(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  }
}
