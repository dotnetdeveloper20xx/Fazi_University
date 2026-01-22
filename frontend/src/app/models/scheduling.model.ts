// Building DTO matching backend BuildingListDto
export interface BuildingListItem {
  id: string;
  code: string;
  name: string;
  address?: string;
  totalFloors?: number;
  isActive: boolean;
  roomCount: number;
  activeRoomCount: number;
}

// Room List DTO matching backend RoomListDto
export interface RoomListItem {
  id: string;
  buildingCode: string;
  buildingName: string;
  roomNumber: string;
  name: string;
  type: string;
  capacity: number;
  floor?: number;
  isActive: boolean;
  features: string;
}

// Room Booking DTO matching backend RoomBookingDto
export interface RoomBooking {
  id: string;
  roomId: string;
  roomName: string;
  buildingName: string;
  courseSectionId?: string;
  courseCode?: string;
  courseName?: string;
  bookedById?: string;
  bookedByName?: string;
  title: string;
  description?: string;
  bookingType: string;
  date: string;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  recurrencePattern?: string;
  recurrenceEndDate?: string;
  status: string;
}

// Room Availability DTO matching backend RoomAvailabilityDto
export interface RoomAvailability {
  roomId: string;
  roomName: string;
  buildingName: string;
  date: string;
  availableSlots: TimeSlot[];
  bookedSlots: TimeSlot[];
  isAvailable: boolean;
}

// Time Slot DTO matching backend TimeSlotDto
export interface TimeSlot {
  startTime: string;
  endTime: string;
  isBooked: boolean;
  bookingTitle?: string;
  bookingType?: string;
}

// Create Building Request matching backend CreateBuildingCommand
export interface CreateBuildingRequest {
  code: string;
  name: string;
  description?: string;
  address?: string;
  totalFloors?: number;
}

// Create Room Request matching backend CreateRoomCommand
export interface CreateRoomRequest {
  buildingId: string;
  roomNumber: string;
  name: string;
  type: string;
  capacity: number;
  floor?: number;
  description?: string;
  hasProjector: boolean;
  hasWhiteboard: boolean;
  hasComputers: boolean;
  computerCount?: number;
  isAccessible: boolean;
}

// Book Room Request matching backend BookRoomCommand
export interface BookRoomRequest {
  roomId: string;
  courseSectionId?: string;
  title: string;
  description?: string;
  bookingType: string;
  date: string;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  recurrencePattern?: string;
  recurrenceEndDate?: string;
}

// Filter for rooms
export interface RoomFilter {
  buildingId?: string;
  type?: string;
  minCapacity?: number;
  isActive?: boolean;
  hasProjector?: boolean;
  hasComputers?: boolean;
  isAccessible?: boolean;
}

// Filter for bookings
export interface BookingFilter {
  roomId?: string;
  buildingId?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  bookingType?: string;
  status?: string;
}

// Room types
export const ROOM_TYPES = [
  'Classroom',
  'Lecture Hall',
  'Laboratory',
  'Computer Lab',
  'Conference Room',
  'Study Room',
  'Office',
  'Auditorium',
  'Library',
  'Other'
];

// Booking types
export const BOOKING_TYPES = [
  'Class',
  'Exam',
  'Meeting',
  'Event',
  'Maintenance',
  'Other'
];

// Booking status
export type BookingStatus = 'Confirmed' | 'Pending' | 'Cancelled';

// Recurrence patterns
export const RECURRENCE_PATTERNS = [
  { value: 'Daily', label: 'Daily' },
  { value: 'Weekly', label: 'Weekly' },
  { value: 'MWF', label: 'Mon/Wed/Fri' },
  { value: 'TTh', label: 'Tue/Thu' },
  { value: 'Biweekly', label: 'Every Two Weeks' }
];
