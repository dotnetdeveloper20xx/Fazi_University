import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Text skeleton -->
    <ng-container *ngIf="type === 'text'">
      <div class="skeleton skeleton-text" [style.width]="width" [style.height]="height"></div>
    </ng-container>

    <!-- Avatar skeleton -->
    <ng-container *ngIf="type === 'avatar'">
      <div class="skeleton skeleton-avatar" [style.width]="size" [style.height]="size"></div>
    </ng-container>

    <!-- Card skeleton -->
    <ng-container *ngIf="type === 'card'">
      <div class="skeleton-card-wrapper">
        <div class="skeleton" [style.height]="height || '120px'" style="border-radius: 12px;"></div>
      </div>
    </ng-container>

    <!-- Table row skeleton -->
    <ng-container *ngIf="type === 'table'">
      <div class="skeleton-table">
        @for (row of rows; track $index) {
          <div class="skeleton skeleton-table-row"></div>
        }
      </div>
    </ng-container>

    <!-- List skeleton -->
    <ng-container *ngIf="type === 'list'">
      <div class="skeleton-list">
        @for (item of rows; track $index) {
          <div class="skeleton-list-item">
            <div class="skeleton skeleton-avatar" style="width: 40px; height: 40px;"></div>
            <div class="skeleton-list-content">
              <div class="skeleton" style="height: 14px; width: 60%; margin-bottom: 8px;"></div>
              <div class="skeleton" style="height: 12px; width: 40%;"></div>
            </div>
          </div>
        }
      </div>
    </ng-container>

    <!-- Stats card skeleton -->
    <ng-container *ngIf="type === 'stats'">
      <div class="skeleton-stats">
        @for (stat of [1,2,3,4]; track stat) {
          <div class="skeleton-stat-card">
            <div class="skeleton" style="height: 12px; width: 60%; margin-bottom: 12px;"></div>
            <div class="skeleton" style="height: 32px; width: 40%;"></div>
          </div>
        }
      </div>
    </ng-container>

    <!-- Form skeleton -->
    <ng-container *ngIf="type === 'form'">
      <div class="skeleton-form">
        @for (field of rows; track $index) {
          <div class="skeleton-form-field">
            <div class="skeleton" style="height: 12px; width: 30%; margin-bottom: 8px;"></div>
            <div class="skeleton" style="height: 48px; width: 100%; border-radius: 8px;"></div>
          </div>
        }
      </div>
    </ng-container>
  `,
  styles: [`
    :host {
      display: block;
    }

    .skeleton {
      background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
      background-size: 200% 100%;
      animation: skeleton-loading 1.5s infinite;
      border-radius: 4px;
    }

    @keyframes skeleton-loading {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    .skeleton-text {
      height: 1rem;
    }

    .skeleton-avatar {
      border-radius: 50%;
    }

    .skeleton-table {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .skeleton-table-row {
      height: 48px;
      border-radius: 4px;
    }

    .skeleton-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .skeleton-list-item {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .skeleton-list-content {
      flex: 1;
    }

    .skeleton-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .skeleton-stat-card {
      padding: 20px;
      background: white;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
    }

    .skeleton-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .skeleton-form-field {
      display: flex;
      flex-direction: column;
    }
  `]
})
export class SkeletonComponent {
  @Input() type: 'text' | 'avatar' | 'card' | 'table' | 'list' | 'stats' | 'form' = 'text';
  @Input() width = '100%';
  @Input() height = '1rem';
  @Input() size = '40px';
  @Input() count = 5;

  get rows(): number[] {
    return Array(this.count).fill(0);
  }
}
