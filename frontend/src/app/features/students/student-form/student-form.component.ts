import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { StudentService } from '../services/student.service';
import { NotificationService } from '../../../core/services/notification.service';
import { CreateStudentRequest, UpdateStudentRequest, Gender, StudentType, StudentStatus } from '../../../models';

@Component({
  selector: 'app-student-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatDividerModule
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center gap-4">
        <button mat-icon-button routerLink="/students">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {{ isEditMode() ? 'Edit Student' : 'Add New Student' }}
          </h1>
          <p class="text-gray-500 dark:text-gray-400">
            {{ isEditMode() ? 'Update student information' : 'Create a new student record' }}
          </p>
        </div>
      </div>

      @if (isLoading()) {
        <div class="flex items-center justify-center p-12">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else {
        <form [formGroup]="studentForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <!-- Personal Information -->
          <mat-card class="p-6">
            <h2 class="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Personal Information</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <mat-form-field appearance="outline">
                <mat-label>First Name</mat-label>
                <input matInput formControlName="firstName" placeholder="Enter first name">
                @if (studentForm.get('firstName')?.hasError('required') && studentForm.get('firstName')?.touched) {
                  <mat-error>First name is required</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Middle Name</mat-label>
                <input matInput formControlName="middleName" placeholder="Enter middle name">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Last Name</mat-label>
                <input matInput formControlName="lastName" placeholder="Enter last name">
                @if (studentForm.get('lastName')?.hasError('required') && studentForm.get('lastName')?.touched) {
                  <mat-error>Last name is required</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Date of Birth</mat-label>
                <input matInput [matDatepicker]="picker" formControlName="dateOfBirth" placeholder="Select date">
                <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
                @if (studentForm.get('dateOfBirth')?.hasError('required') && studentForm.get('dateOfBirth')?.touched) {
                  <mat-error>Date of birth is required</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Gender</mat-label>
                <mat-select formControlName="gender">
                  <mat-option value="Male">Male</mat-option>
                  <mat-option value="Female">Female</mat-option>
                  <mat-option value="Other">Other</mat-option>
                  <mat-option value="PreferNotToSay">Prefer not to say</mat-option>
                </mat-select>
                @if (studentForm.get('gender')?.hasError('required') && studentForm.get('gender')?.touched) {
                  <mat-error>Gender is required</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>National ID</mat-label>
                <input matInput formControlName="nationalId" placeholder="Enter national ID">
              </mat-form-field>
            </div>
          </mat-card>

          <!-- Contact Information -->
          <mat-card class="p-6">
            <h2 class="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Contact Information</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <mat-form-field appearance="outline">
                <mat-label>Email (University)</mat-label>
                <input matInput type="email" formControlName="email" placeholder="Enter university email">
                <mat-icon matPrefix>email</mat-icon>
                @if (studentForm.get('email')?.hasError('required') && studentForm.get('email')?.touched) {
                  <mat-error>Email is required</mat-error>
                }
                @if (studentForm.get('email')?.hasError('email') && studentForm.get('email')?.touched) {
                  <mat-error>Please enter a valid email</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Personal Email</mat-label>
                <input matInput type="email" formControlName="personalEmail" placeholder="Enter personal email">
                <mat-icon matPrefix>alternate_email</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Phone</mat-label>
                <input matInput formControlName="phone" placeholder="Enter phone number">
                <mat-icon matPrefix>phone</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Mobile Phone</mat-label>
                <input matInput formControlName="mobilePhone" placeholder="Enter mobile number">
                <mat-icon matPrefix>smartphone</mat-icon>
              </mat-form-field>
            </div>
          </mat-card>

          <!-- Address -->
          <mat-card class="p-6">
            <h2 class="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Address</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <mat-form-field appearance="outline" class="md:col-span-2">
                <mat-label>Address Line 1</mat-label>
                <input matInput formControlName="addressLine1" placeholder="Street address">
              </mat-form-field>

              <mat-form-field appearance="outline" class="md:col-span-2">
                <mat-label>Address Line 2</mat-label>
                <input matInput formControlName="addressLine2" placeholder="Apartment, suite, etc.">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>City</mat-label>
                <input matInput formControlName="city" placeholder="Enter city">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>State/Province</mat-label>
                <input matInput formControlName="state" placeholder="Enter state">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Postal Code</mat-label>
                <input matInput formControlName="postalCode" placeholder="Enter postal code">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Country</mat-label>
                <input matInput formControlName="country" placeholder="Enter country">
              </mat-form-field>
            </div>
          </mat-card>

          <!-- Academic Information -->
          <mat-card class="p-6">
            <h2 class="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Academic Information</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <mat-form-field appearance="outline">
                <mat-label>Student Type</mat-label>
                <mat-select formControlName="type">
                  <mat-option value="FullTime">Full Time</mat-option>
                  <mat-option value="PartTime">Part Time</mat-option>
                  <mat-option value="Online">Online</mat-option>
                  <mat-option value="Exchange">Exchange</mat-option>
                  <mat-option value="NonDegree">Non-Degree</mat-option>
                </mat-select>
              </mat-form-field>

              @if (isEditMode()) {
                <mat-form-field appearance="outline">
                  <mat-label>Status</mat-label>
                  <mat-select formControlName="status">
                    <mat-option value="Admitted">Admitted</mat-option>
                    <mat-option value="Active">Active</mat-option>
                    <mat-option value="Inactive">Inactive</mat-option>
                    <mat-option value="OnLeave">On Leave</mat-option>
                    <mat-option value="Suspended">Suspended</mat-option>
                    <mat-option value="Withdrawn">Withdrawn</mat-option>
                    <mat-option value="Graduated">Graduated</mat-option>
                  </mat-select>
                </mat-form-field>
              }

              <mat-form-field appearance="outline">
                <mat-label>Expected Graduation Date</mat-label>
                <input matInput [matDatepicker]="gradPicker" formControlName="expectedGraduationDate">
                <mat-datepicker-toggle matIconSuffix [for]="gradPicker"></mat-datepicker-toggle>
                <mat-datepicker #gradPicker></mat-datepicker>
              </mat-form-field>
            </div>
          </mat-card>

          <!-- Emergency Contact -->
          <mat-card class="p-6">
            <h2 class="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Emergency Contact</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <mat-form-field appearance="outline">
                <mat-label>Contact Name</mat-label>
                <input matInput formControlName="emergencyContactName" placeholder="Full name">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Contact Phone</mat-label>
                <input matInput formControlName="emergencyContactPhone" placeholder="Phone number">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Relationship</mat-label>
                <input matInput formControlName="emergencyContactRelationship" placeholder="e.g., Parent, Spouse">
              </mat-form-field>
            </div>
          </mat-card>

          <!-- Account Options (only for new students) -->
          @if (!isEditMode()) {
            <mat-card class="p-6">
              <h2 class="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Account Options</h2>
              <mat-checkbox formControlName="createUserAccount" color="primary">
                Create a user account for this student
              </mat-checkbox>
              <p class="text-sm text-gray-500 mt-2">
                If checked, a user account will be created with a temporary password.
                The student will be required to change their password on first login.
              </p>
            </mat-card>
          }

          <!-- Form Actions -->
          <div class="flex items-center justify-end gap-4">
            <button mat-stroked-button type="button" routerLink="/students">
              Cancel
            </button>
            <button
              mat-flat-button
              color="primary"
              type="submit"
              [disabled]="isSaving() || studentForm.invalid"
            >
              @if (isSaving()) {
                <mat-spinner diameter="20" class="inline-block mr-2"></mat-spinner>
              }
              {{ isEditMode() ? 'Update Student' : 'Create Student' }}
            </button>
          </div>
        </form>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class StudentFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly studentService = inject(StudentService);
  private readonly notificationService = inject(NotificationService);

  isEditMode = signal(false);
  isLoading = signal(false);
  isSaving = signal(false);
  studentId = signal<string | null>(null);

  studentForm: FormGroup = this.fb.group({
    // Personal Information
    firstName: ['', [Validators.required, Validators.maxLength(100)]],
    middleName: [''],
    lastName: ['', [Validators.required, Validators.maxLength(100)]],
    dateOfBirth: ['', Validators.required],
    gender: ['', Validators.required],
    nationalId: [''],
    passportNumber: [''],

    // Contact Information
    email: ['', [Validators.required, Validators.email]],
    personalEmail: ['', Validators.email],
    phone: [''],
    mobilePhone: [''],

    // Address
    addressLine1: [''],
    addressLine2: [''],
    city: [''],
    state: [''],
    postalCode: [''],
    country: [''],

    // Academic Information
    type: ['FullTime'],
    status: ['Admitted'],
    programId: [''],
    departmentId: [''],
    advisorId: [''],
    expectedGraduationDate: [''],

    // Emergency Contact
    emergencyContactName: [''],
    emergencyContactPhone: [''],
    emergencyContactRelationship: [''],

    // Account Options
    createUserAccount: [false]
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.studentId.set(id);
      this.isEditMode.set(true);
      this.loadStudent(id);
    }
  }

  loadStudent(id: string): void {
    this.isLoading.set(true);

    this.studentService.getStudent(id).subscribe({
      next: (student) => {
        this.studentForm.patchValue({
          firstName: student.firstName,
          middleName: student.middleName,
          lastName: student.lastName,
          dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth) : null,
          gender: student.gender,
          nationalId: student.nationalId,
          passportNumber: student.passportNumber,
          email: student.email,
          personalEmail: student.personalEmail,
          phone: student.phone,
          mobilePhone: student.mobilePhone,
          addressLine1: student.addressLine1,
          addressLine2: student.addressLine2,
          city: student.city,
          state: student.state,
          postalCode: student.postalCode,
          country: student.country,
          type: student.type,
          status: student.status,
          programId: student.programId,
          departmentId: student.departmentId,
          advisorId: student.advisorId,
          expectedGraduationDate: student.expectedGraduationDate ? new Date(student.expectedGraduationDate) : null,
          emergencyContactName: student.emergencyContactName,
          emergencyContactPhone: student.emergencyContactPhone,
          emergencyContactRelationship: student.emergencyContactRelationship
        });
        this.isLoading.set(false);
      },
      error: (err) => {
        this.notificationService.showError('Failed to load student data');
        this.router.navigate(['/students']);
      }
    });
  }

  onSubmit(): void {
    if (this.studentForm.invalid) {
      this.studentForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);

    const formValue = this.studentForm.value;

    // Format dates for API
    const dateOfBirth = formValue.dateOfBirth
      ? this.formatDate(formValue.dateOfBirth)
      : null;
    const expectedGraduationDate = formValue.expectedGraduationDate
      ? this.formatDate(formValue.expectedGraduationDate)
      : null;

    if (this.isEditMode()) {
      const updateRequest: UpdateStudentRequest = {
        id: this.studentId()!,
        firstName: formValue.firstName,
        middleName: formValue.middleName || undefined,
        lastName: formValue.lastName,
        dateOfBirth: dateOfBirth!,
        gender: formValue.gender,
        nationalId: formValue.nationalId || undefined,
        passportNumber: formValue.passportNumber || undefined,
        email: formValue.email,
        personalEmail: formValue.personalEmail || undefined,
        phone: formValue.phone || undefined,
        mobilePhone: formValue.mobilePhone || undefined,
        addressLine1: formValue.addressLine1 || undefined,
        addressLine2: formValue.addressLine2 || undefined,
        city: formValue.city || undefined,
        state: formValue.state || undefined,
        postalCode: formValue.postalCode || undefined,
        country: formValue.country || undefined,
        type: formValue.type || undefined,
        status: formValue.status || undefined,
        programId: formValue.programId || undefined,
        departmentId: formValue.departmentId || undefined,
        advisorId: formValue.advisorId || undefined,
        expectedGraduationDate: expectedGraduationDate || undefined,
        emergencyContactName: formValue.emergencyContactName || undefined,
        emergencyContactPhone: formValue.emergencyContactPhone || undefined,
        emergencyContactRelationship: formValue.emergencyContactRelationship || undefined
      };

      this.studentService.updateStudent(this.studentId()!, updateRequest).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.notificationService.showSuccess('Student updated successfully');
          this.router.navigate(['/students', this.studentId()]);
        },
        error: (err) => {
          this.isSaving.set(false);
          this.notificationService.showError(err.error?.message || 'Failed to update student');
        }
      });
    } else {
      const createRequest: CreateStudentRequest = {
        firstName: formValue.firstName,
        middleName: formValue.middleName || undefined,
        lastName: formValue.lastName,
        dateOfBirth: dateOfBirth!,
        gender: formValue.gender,
        nationalId: formValue.nationalId || undefined,
        passportNumber: formValue.passportNumber || undefined,
        email: formValue.email,
        personalEmail: formValue.personalEmail || undefined,
        phone: formValue.phone || undefined,
        mobilePhone: formValue.mobilePhone || undefined,
        addressLine1: formValue.addressLine1 || undefined,
        addressLine2: formValue.addressLine2 || undefined,
        city: formValue.city || undefined,
        state: formValue.state || undefined,
        postalCode: formValue.postalCode || undefined,
        country: formValue.country || undefined,
        type: formValue.type || undefined,
        programId: formValue.programId || undefined,
        departmentId: formValue.departmentId || undefined,
        advisorId: formValue.advisorId || undefined,
        expectedGraduationDate: expectedGraduationDate || undefined,
        emergencyContactName: formValue.emergencyContactName || undefined,
        emergencyContactPhone: formValue.emergencyContactPhone || undefined,
        emergencyContactRelationship: formValue.emergencyContactRelationship || undefined,
        createUserAccount: formValue.createUserAccount
      };

      this.studentService.createStudent(createRequest).subscribe({
        next: (newId) => {
          this.isSaving.set(false);
          this.notificationService.showSuccess('Student created successfully');
          this.router.navigate(['/students', newId]);
        },
        error: (err) => {
          this.isSaving.set(false);
          this.notificationService.showError(err.error?.message || 'Failed to create student');
        }
      });
    }
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
