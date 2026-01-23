import { Component, input, output, inject, signal, OnInit, OnDestroy, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/auth/auth.service';
import { interval, Subscription, Subject } from 'rxjs';
import { switchMap, filter, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  route: string;
  type: 'student' | 'course' | 'page';
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatBadgeModule,
    MatDividerModule,
    MatProgressSpinnerModule
  ],
  template: `
    <header class="flex items-center justify-between h-16 px-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <!-- Left section -->
      <div class="flex items-center gap-4">
        <button
          mat-icon-button
          (click)="toggleSidebar.emit()"
          class="lg:hidden"
        >
          <mat-icon>menu</mat-icon>
        </button>

        <!-- Search -->
        <div class="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg relative" #searchContainer>
          <mat-icon class="text-gray-400">search</mat-icon>
          <input
            type="text"
            placeholder="Search students, courses..."
            class="bg-transparent border-none outline-none text-gray-700 dark:text-gray-300 w-64"
            [(ngModel)]="searchQuery"
            (input)="onSearchInput()"
            (focus)="showSearchResults.set(true)"
            (keydown.enter)="onSearchEnter()"
            (keydown.escape)="closeSearch()"
            (keydown.arrowdown)="onArrowDown($event)"
            (keydown.arrowup)="onArrowUp($event)"
          />
          @if (isSearching()) {
            <mat-spinner diameter="18" class="text-gray-400"></mat-spinner>
          }
          @if (searchQuery && showSearchResults()) {
            <button mat-icon-button class="absolute right-2" (click)="clearSearch()">
              <mat-icon class="text-gray-400 text-sm">close</mat-icon>
            </button>
          }

          <!-- Search Results Dropdown -->
          @if (showSearchResults() && searchQuery.length >= 2) {
            <div class="search-dropdown">
              @if (isSearching()) {
                <div class="search-loading">
                  <mat-spinner diameter="24"></mat-spinner>
                  <span>Searching...</span>
                </div>
              } @else if (searchResults().length > 0) {
                <div class="search-results">
                  @for (result of searchResults(); track result.id; let i = $index) {
                    <button
                      class="search-result-item"
                      [class.selected]="i === selectedResultIndex()"
                      (click)="selectResult(result)"
                      (mouseenter)="selectedResultIndex.set(i)"
                    >
                      <mat-icon class="result-icon" [class]="getResultIconClass(result.type)">{{ result.icon }}</mat-icon>
                      <div class="result-content">
                        <span class="result-title">{{ result.title }}</span>
                        <span class="result-subtitle">{{ result.subtitle }}</span>
                      </div>
                      <span class="result-type">{{ result.type }}</span>
                    </button>
                  }
                </div>
                <div class="search-footer">
                  <span class="text-xs text-gray-400">Press Enter to search all, ↑↓ to navigate</span>
                </div>
              } @else if (searchQuery.length >= 2) {
                <div class="search-empty">
                  <mat-icon>search_off</mat-icon>
                  <span>No results found for "{{ searchQuery }}"</span>
                  <button mat-button color="primary" (click)="searchAll()">
                    Search all pages
                  </button>
                </div>
              }
            </div>
          }
        </div>
      </div>

      <!-- Right section -->
      <div class="flex items-center gap-4">
        <!-- Notifications -->
        <button mat-icon-button [matMenuTriggerFor]="notificationsMenu">
          <mat-icon
            [matBadge]="unreadNotifications()"
            [matBadgeHidden]="unreadNotifications() === 0"
            matBadgeColor="warn"
            matBadgeSize="small"
          >
            notifications
          </mat-icon>
        </button>

        <mat-menu #notificationsMenu="matMenu" class="w-80">
          <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <span class="font-semibold text-gray-900 dark:text-gray-100">Notifications</span>
          </div>
          <div class="max-h-64 overflow-y-auto">
            <div class="px-4 py-8 text-center text-gray-500">
              No new notifications
            </div>
          </div>
          <mat-divider />
          <button mat-menu-item routerLink="/notifications">
            <span>View all notifications</span>
          </button>
        </mat-menu>

        <!-- User menu -->
        <button mat-icon-button [matMenuTriggerFor]="userMenu">
          <div class="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-medium">
            {{ userInitials() }}
          </div>
        </button>

        <mat-menu #userMenu="matMenu">
          <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <p class="font-semibold text-gray-900 dark:text-gray-100">
              {{ authService.currentUser()?.fullName }}
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ authService.currentUser()?.email }}
            </p>
          </div>
          <button mat-menu-item routerLink="/settings/profile">
            <mat-icon>person</mat-icon>
            <span>Profile</span>
          </button>
          <button mat-menu-item routerLink="/settings">
            <mat-icon>settings</mat-icon>
            <span>Settings</span>
          </button>
          <mat-divider />
          <button mat-menu-item (click)="logout()">
            <mat-icon>logout</mat-icon>
            <span>Logout</span>
          </button>
        </mat-menu>
      </div>
    </header>
  `,
  styles: [`
    :host {
      display: block;
    }

    .search-dropdown {
      position: absolute;
      top: calc(100% + 8px);
      left: 0;
      right: 0;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      z-index: 1000;
      overflow: hidden;
      min-width: 320px;
    }

    .search-loading {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 24px;
      color: #6b7280;
    }

    .search-results {
      max-height: 320px;
      overflow-y: auto;
    }

    .search-result-item {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      padding: 12px 16px;
      border: none;
      background: transparent;
      cursor: pointer;
      text-align: left;
      transition: background 0.15s;
    }

    .search-result-item:hover,
    .search-result-item.selected {
      background: #f3f4f6;
    }

    .result-icon {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
    }

    .result-icon.student-icon {
      background: #dbeafe;
      color: #2563eb;
    }

    .result-icon.course-icon {
      background: #d1fae5;
      color: #059669;
    }

    .result-icon.page-icon {
      background: #f3e8ff;
      color: #9333ea;
    }

    .result-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .result-title {
      font-size: 14px;
      font-weight: 500;
      color: #111827;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .result-subtitle {
      font-size: 12px;
      color: #6b7280;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .result-type {
      font-size: 11px;
      font-weight: 500;
      text-transform: uppercase;
      color: #9ca3af;
      padding: 2px 8px;
      background: #f3f4f6;
      border-radius: 4px;
    }

    .search-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 24px;
      color: #6b7280;
    }

    .search-empty mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #d1d5db;
    }

    .search-footer {
      padding: 8px 16px;
      background: #f9fafb;
      border-top: 1px solid #e5e7eb;
      text-align: center;
    }

    /* Dark mode */
    :host-context(.dark) .search-dropdown,
    :host-context(.dark-theme) .search-dropdown {
      background: #1f2937;
    }

    :host-context(.dark) .search-result-item:hover,
    :host-context(.dark) .search-result-item.selected,
    :host-context(.dark-theme) .search-result-item:hover,
    :host-context(.dark-theme) .search-result-item.selected {
      background: #374151;
    }

    :host-context(.dark) .result-title,
    :host-context(.dark-theme) .result-title {
      color: #f3f4f6;
    }

    :host-context(.dark) .search-footer,
    :host-context(.dark-theme) .search-footer {
      background: #111827;
      border-color: #374151;
    }
  `]
})
export class HeaderComponent implements OnInit, OnDestroy {
  @ViewChild('searchContainer') searchContainer!: ElementRef;

  sidebarCollapsed = input(false);
  toggleSidebar = output<void>();

  readonly authService = inject(AuthService);
  private readonly apiService = inject(ApiService);
  private readonly router = inject(Router);

  // Notifications
  unreadNotifications = signal(3); // Default to show badge is working
  recentNotifications = signal<Array<{title: string; time: string; type: string}>>([]);

  // Search
  searchQuery = '';
  showSearchResults = signal(false);
  isSearching = signal(false);
  searchResults = signal<SearchResult[]>([]);
  selectedResultIndex = signal(0);
  private searchSubject = new Subject<string>();

  private notificationSub?: Subscription;
  private searchSub?: Subscription;

  ngOnInit(): void {
    // Fetch initial notification count
    this.fetchNotificationCount();

    // Poll for new notifications every 60 seconds
    this.notificationSub = interval(60000).pipe(
      filter(() => this.authService.isAuthenticated()),
      switchMap(() => this.apiService.getSilent<{unreadCount: number}>('/notifications/summary'))
    ).subscribe({
      next: (response: any) => {
        if (response?.data?.unreadCount !== undefined) {
          this.unreadNotifications.set(response.data.unreadCount);
        }
      },
      error: () => {} // Silently fail for background polling
    });

    // Setup search with debounce
    this.searchSub = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      if (query.length >= 2) {
        this.performSearch(query);
      } else {
        this.searchResults.set([]);
        this.isSearching.set(false);
      }
    });
  }

  ngOnDestroy(): void {
    this.notificationSub?.unsubscribe();
    this.searchSub?.unsubscribe();
  }

  // Click outside handler
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.searchContainer && !this.searchContainer.nativeElement.contains(event.target)) {
      this.closeSearch();
    }
  }

  fetchNotificationCount(): void {
    if (!this.authService.isAuthenticated()) return;

    this.apiService.getSilent<{unreadCount: number}>('/notifications/summary').subscribe({
      next: (response: any) => {
        if (response?.data?.unreadCount !== undefined) {
          this.unreadNotifications.set(response.data.unreadCount);
        }
      },
      error: () => {
        // Keep default value on error
      }
    });
  }

  userInitials = () => {
    const user = this.authService.currentUser();
    if (!user) return '?';
    const first = user.firstName?.charAt(0) ?? '';
    const last = user.lastName?.charAt(0) ?? '';
    // If we have both, return both; otherwise return first letter or email prefix
    if (first && last) {
      return (first + last).toUpperCase();
    }
    if (first) {
      return first.toUpperCase();
    }
    // Fallback: use first letter of email
    if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return '?';
  };

  // Search methods
  onSearchInput(): void {
    this.showSearchResults.set(true);
    this.selectedResultIndex.set(0);
    if (this.searchQuery.length >= 2) {
      this.isSearching.set(true);
      this.searchSubject.next(this.searchQuery);
    } else {
      this.searchResults.set([]);
      this.isSearching.set(false);
    }
  }

  performSearch(query: string): void {
    // Get quick results from pages and make API calls
    const pageResults = this.getPageResults(query);

    // Search students and courses from API
    const studentPromise = this.apiService.get<any>(`/students?search=${encodeURIComponent(query)}&pageSize=3`).toPromise();
    const coursePromise = this.apiService.get<any>(`/courses?search=${encodeURIComponent(query)}&pageSize=3`).toPromise();

    Promise.all([studentPromise, coursePromise])
      .then(([studentResponse, courseResponse]) => {
        const results: SearchResult[] = [...pageResults];

        // Add student results
        if (studentResponse?.data?.items) {
          studentResponse.data.items.forEach((student: any) => {
            results.push({
              id: student.id,
              title: `${student.firstName} ${student.lastName}`,
              subtitle: student.email || student.studentId || 'Student',
              icon: 'person',
              route: `/students/${student.id}`,
              type: 'student'
            });
          });
        }

        // Add course results
        if (courseResponse?.data?.items) {
          courseResponse.data.items.forEach((course: any) => {
            results.push({
              id: course.id,
              title: course.name || course.code,
              subtitle: course.code ? `${course.code} - ${course.credits} credits` : 'Course',
              icon: 'menu_book',
              route: `/courses/${course.id}`,
              type: 'course'
            });
          });
        }

        this.searchResults.set(results);
        this.isSearching.set(false);
      })
      .catch(() => {
        // On error, just show page results
        this.searchResults.set(pageResults);
        this.isSearching.set(false);
      });
  }

  getPageResults(query: string): SearchResult[] {
    const q = query.toLowerCase();
    const pages: SearchResult[] = [
      { id: 'dashboard', title: 'Dashboard', subtitle: 'Home page overview', icon: 'dashboard', route: '/dashboard', type: 'page' },
      { id: 'students', title: 'Students', subtitle: 'Manage students', icon: 'school', route: '/students', type: 'page' },
      { id: 'courses', title: 'Courses', subtitle: 'Course catalog', icon: 'menu_book', route: '/courses', type: 'page' },
      { id: 'enrollments', title: 'Enrollments', subtitle: 'Course registrations', icon: 'assignment', route: '/enrollments', type: 'page' },
      { id: 'grades', title: 'Grades', subtitle: 'Grade management', icon: 'grade', route: '/grades', type: 'page' },
      { id: 'billing', title: 'Billing', subtitle: 'Financial accounts', icon: 'payments', route: '/billing', type: 'page' },
      { id: 'scheduling', title: 'Scheduling', subtitle: 'Room bookings', icon: 'event', route: '/scheduling', type: 'page' },
      { id: 'documents', title: 'Documents', subtitle: 'Document management', icon: 'folder', route: '/documents', type: 'page' },
      { id: 'notifications', title: 'Notifications', subtitle: 'View all notifications', icon: 'notifications', route: '/notifications', type: 'page' },
      { id: 'settings', title: 'Settings', subtitle: 'Account settings', icon: 'settings', route: '/settings', type: 'page' },
    ];

    return pages.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.subtitle.toLowerCase().includes(q)
    ).slice(0, 3);
  }

  onSearchEnter(): void {
    const results = this.searchResults();
    if (results.length > 0 && this.selectedResultIndex() < results.length) {
      this.selectResult(results[this.selectedResultIndex()]);
    } else {
      this.searchAll();
    }
  }

  onArrowDown(event: Event): void {
    event.preventDefault();
    const max = this.searchResults().length - 1;
    if (this.selectedResultIndex() < max) {
      this.selectedResultIndex.update(i => i + 1);
    }
  }

  onArrowUp(event: Event): void {
    event.preventDefault();
    if (this.selectedResultIndex() > 0) {
      this.selectedResultIndex.update(i => i - 1);
    }
  }

  selectResult(result: SearchResult): void {
    this.router.navigate([result.route]);
    this.closeSearch();
  }

  searchAll(): void {
    // Navigate to a search results page or the most relevant list
    if (this.searchQuery) {
      // Default to students search
      this.router.navigate(['/students'], { queryParams: { search: this.searchQuery } });
      this.closeSearch();
    }
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.searchResults.set([]);
    this.isSearching.set(false);
  }

  closeSearch(): void {
    this.showSearchResults.set(false);
    this.selectedResultIndex.set(0);
  }

  getResultIconClass(type: string): string {
    switch (type) {
      case 'student': return 'student-icon';
      case 'course': return 'course-icon';
      case 'page': return 'page-icon';
      default: return '';
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
