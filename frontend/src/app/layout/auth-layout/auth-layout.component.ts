import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="auth-container">
      <!-- Left side - Branding -->
      <div class="branding-panel">
        <div class="branding-content">
          <div class="brand-logo">
            <svg viewBox="0 0 24 24" fill="currentColor" class="logo-icon">
              <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
            </svg>
          </div>
          <h1 class="brand-title">UniverSys Lite</h1>
          <p class="brand-description">
            A comprehensive university management system for students, faculty, and administrators.
          </p>
          <ul class="feature-list">
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Student enrollment and registration</span>
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Grade management and transcripts</span>
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Course scheduling and room booking</span>
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Billing and financial management</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Right side - Auth form -->
      <div class="form-panel">
        <div class="form-container">
          <router-outlet />
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .auth-container {
      min-height: 100vh;
      display: flex;
    }

    /* Branding Panel */
    .branding-panel {
      display: none;
      width: 50%;
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #4338ca 100%);
      align-items: center;
      justify-content: center;
      padding: 48px;
      position: relative;
      overflow: hidden;
    }

    .branding-panel::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -50%;
      width: 100%;
      height: 100%;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
      pointer-events: none;
    }

    .branding-panel::after {
      content: '';
      position: absolute;
      bottom: -30%;
      left: -30%;
      width: 80%;
      height: 80%;
      background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 60%);
      pointer-events: none;
    }

    @media (min-width: 1024px) {
      .branding-panel {
        display: flex;
      }
    }

    .branding-content {
      max-width: 480px;
      color: white;
      position: relative;
      z-index: 1;
    }

    .brand-logo {
      width: 72px;
      height: 72px;
      background: rgba(255, 255, 255, 0.15);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 24px;
      backdrop-filter: blur(10px);
    }

    .logo-icon {
      width: 40px;
      height: 40px;
    }

    .brand-title {
      font-size: 40px;
      font-weight: 800;
      margin: 0 0 16px 0;
      letter-spacing: -0.5px;
    }

    .brand-description {
      font-size: 18px;
      line-height: 1.6;
      color: rgba(255, 255, 255, 0.85);
      margin: 0 0 32px 0;
    }

    .feature-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .feature-list li {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 16px;
      color: rgba(255, 255, 255, 0.9);
    }

    .feature-list svg {
      width: 24px;
      height: 24px;
      color: rgba(255, 255, 255, 0.7);
      flex-shrink: 0;
    }

    /* Form Panel */
    .form-panel {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 32px;
      background: #f3f4f6;
      min-height: 100vh;
    }

    .form-container {
      width: 100%;
      max-width: 480px;
    }

    /* Dark Mode */
    @media (prefers-color-scheme: dark) {
      .form-panel {
        background: #111827;
      }
    }
  `]
})
export class AuthLayoutComponent {}
