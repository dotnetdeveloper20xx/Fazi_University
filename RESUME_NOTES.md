# Resume Notes - University Corporate Software

## Last Updated: January 22, 2026

## Session Summary

### Completed Tasks

1. **Dashboard Improvements**
   - Removed Recent Activity section from `dashboard.component.ts`
   - Made Quick Actions full-width with 4-column responsive grid

2. **Form Field Fixes (Custom Styled Inputs)**
   - **Login Page** (`login.component.ts`) - Already fixed in previous session
   - **Forgot Password** (`forgot-password.component.ts`) - Uses custom inputs
   - **Scheduling Calendar** (`scheduling-calendar.component.ts`) - Replaced Material form fields with custom inputs for date, building, and booking type filters. Added focus signals.
   - **Settings Password Fields** (`settings-page.component.ts`) - Replaced Material form fields with custom inputs for password change form. Added focus signals.

3. **Error Handling Improvements**
   - `error.interceptor.ts` - Added `X-Suppress-Error-Notification` header support
   - `api.service.ts` - Added `getSilent()` method for background requests
   - `dashboard.service.ts` - Uses `getSilent()` for dashboard summary
   - `header.component.ts` - Uses `getSilent()` for notification polling

4. **User Display Fixes**
   - `auth.service.ts` - Improved name parsing from email (handles "john.doe@..." format)
   - `header.component.ts` - Improved `userInitials()` to handle missing lastName

5. **Login Page Registration**
   - Added "Request Account Access" email button
   - Styled registration section with helpful guidance text

6. **Notifications Seeding**
   - `ComprehensiveDataSeeder.cs` - Added 8 new notifications for admin users
   - Added more diverse notifications for staff users

7. **Profile Photo Change**
   - `settings-page.component.ts` - Added file input and `onPhotoSelected()` handler
   - Validates file type (images only) and size (max 5MB)
   - Shows "coming soon" message (backend upload not implemented)

### Pending/Known Issues

1. **Courses Not Loading**
   - Frontend code is correct (`course-list.component.ts`)
   - Issue is likely backend API endpoint (`/courses`) not returning data
   - Need to verify backend is running and API is accessible

2. **Enrollments Not Loading**
   - Frontend code is correct (`enrollment-list.component.ts`)
   - Issue is likely backend API endpoint (`/enrollments`) not returning data
   - Need to verify backend is running and API is accessible

3. **Profile Photo Upload**
   - Frontend file selection works
   - Backend API for uploading avatar not implemented
   - Currently shows "coming soon" notification

### Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Administrator | admin@universyslite.edu | Admin@123! |
| Faculty | john.smith@universyslite.edu | Faculty@123! |
| Registrar | mary.wilson@universyslite.edu | Staff@123! |
| Billing Staff | robert.walker@universyslite.edu | Staff@123! |

### Key Files Modified This Session

**Frontend:**
- `frontend/src/app/features/dashboard/dashboard.component.ts`
- `frontend/src/app/features/scheduling/scheduling-calendar/scheduling-calendar.component.ts`
- `frontend/src/app/features/settings/settings-page/settings-page.component.ts`
- `frontend/src/app/features/auth/login/login.component.ts`
- `frontend/src/app/core/interceptors/error.interceptor.ts`
- `frontend/src/app/core/services/api.service.ts`
- `frontend/src/app/features/dashboard/services/dashboard.service.ts`
- `frontend/src/app/layout/main-layout/header/header.component.ts`
- `frontend/src/app/core/auth/auth.service.ts`

**Backend:**
- `src/Infrastructure/UniverSysLite.Infrastructure/Persistence/ComprehensiveDataSeeder.cs`

### Next Steps

1. Test the application to verify all fixes work correctly
2. Investigate why Courses and Enrollments APIs are not returning data
3. Consider implementing profile photo upload API on backend
4. Run `ng build` to check for any TypeScript errors (was blocked by group policy)
5. Commit all changes when verified working

### Technical Notes

- Angular Material form fields with `appearance="outline"` had issues with label positioning
- Solution: Use custom HTML inputs with wrapper divs and focus state signals
- Pattern: `.input-wrapper` / `.select-wrapper` with `.focused` class toggled by signals
- Dark mode styles are included for all custom form fields

### Git Status (Uncommitted Changes)

The following changes have not been committed yet:
- All frontend fixes listed above
- Backend notification seeder updates
- This resume notes file
