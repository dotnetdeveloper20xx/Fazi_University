import { Component, input, output, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../../core/auth/auth.service';
import { staggeredList } from '../../../shared/animations';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles?: string[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatTooltipModule],
  animations: [staggeredList],
  template: `
    <aside
      class="flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 shadow-sm"
      [class.w-64]="!collapsed()"
      [class.w-20]="collapsed()"
    >
      <!-- Logo -->
      <div class="flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-primary-600 to-primary-700">
        @if (!collapsed()) {
          <span class="text-xl font-bold text-white tracking-tight">
            UniverSys Lite
          </span>
        } @else {
          <span class="text-xl font-bold text-white">
            UL
          </span>
        }
      </div>

      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto py-4">
        <ul class="space-y-1 px-3" [@staggeredList]="filteredNavItems().length">
          @for (item of filteredNavItems(); track item.route) {
            <li>
              <a
                [routerLink]="item.route"
                routerLinkActive="active-nav-item"
                [routerLinkActiveOptions]="{ exact: item.route === '/dashboard' }"
                class="nav-item flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                [matTooltip]="collapsed() ? item.label : ''"
                matTooltipPosition="right"
              >
                <mat-icon class="nav-icon text-gray-500 dark:text-gray-400 transition-colors duration-200">{{ item.icon }}</mat-icon>
                @if (!collapsed()) {
                  <span class="font-medium">{{ item.label }}</span>
                }
              </a>
            </li>
          }
        </ul>
      </nav>

      <!-- Collapse button -->
      <div class="border-t border-gray-200 dark:border-gray-700 p-3">
        <button
          (click)="toggleCollapse.emit()"
          class="collapse-btn flex items-center justify-center w-full py-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
        >
          <mat-icon class="transition-transform duration-300" [class.rotate-180]="!collapsed()">
            chevron_right
          </mat-icon>
        </button>
      </div>
    </aside>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }

    .nav-item {
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 3px;
        background: linear-gradient(180deg, #3b82f6, #2563eb);
        transform: scaleY(0);
        transition: transform 200ms ease;
      }

      &:hover {
        transform: translateX(4px);

        .nav-icon {
          color: #3b82f6;
        }
      }
    }

    .active-nav-item {
      background: linear-gradient(90deg, rgba(59, 130, 246, 0.1), transparent) !important;
      color: #3b82f6 !important;

      &::before {
        transform: scaleY(1);
      }

      .nav-icon {
        color: #3b82f6 !important;
      }
    }

    .collapse-btn:hover mat-icon {
      transform: scale(1.1);
    }

    .rotate-180 {
      transform: rotate(180deg);
    }
  `]
})
export class SidebarComponent {
  collapsed = input(false);
  toggleCollapse = output<void>();

  private readonly authService = inject(AuthService);

  private readonly navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Students', icon: 'school', route: '/students', roles: ['Administrator', 'Registrar', 'Faculty'] },
    { label: 'Courses', icon: 'menu_book', route: '/courses', roles: ['Administrator', 'Registrar', 'Faculty'] },
    { label: 'Enrollments', icon: 'assignment', route: '/enrollments', roles: ['Administrator', 'Registrar', 'Student'] },
    { label: 'Grades', icon: 'grade', route: '/grades', roles: ['Administrator', 'Faculty', 'Student'] },
    { label: 'Billing', icon: 'payments', route: '/billing', roles: ['Administrator', 'BillingStaff', 'Student'] },
    { label: 'Scheduling', icon: 'event', route: '/scheduling', roles: ['Administrator', 'Registrar', 'Faculty'] },
    { label: 'Documents', icon: 'folder', route: '/documents', roles: ['Administrator', 'Registrar', 'Student'] },
    { label: 'Notifications', icon: 'notifications', route: '/notifications' },
    { label: 'Settings', icon: 'settings', route: '/settings' },
  ];

  filteredNavItems = computed(() => {
    const userRoles = this.authService.userRoles();
    return this.navItems.filter(item => {
      if (!item.roles || item.roles.length === 0) return true;
      return item.roles.some(role => userRoles.includes(role as any));
    });
  });
}
