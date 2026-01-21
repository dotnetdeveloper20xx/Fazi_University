import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import {
  ApiResponse,
  PagedResponse,
  PaginationParams,
  BuildingListItem,
  RoomListItem,
  RoomBooking,
  RoomAvailability,
  CreateBuildingRequest,
  CreateRoomRequest,
  BookRoomRequest,
  RoomFilter,
  BookingFilter
} from '../../../models';

@Injectable({
  providedIn: 'root'
})
export class SchedulingService {
  private readonly api = inject(ApiService);
  private readonly endpoint = 'scheduling';

  // ==================== Buildings ====================

  /**
   * Get all buildings with pagination
   */
  getBuildings(
    pagination: PaginationParams = {}
  ): Observable<ApiResponse<PagedResponse<BuildingListItem>>> {
    const params: Record<string, any> = {
      pageNumber: pagination.pageNumber ?? 1,
      pageSize: pagination.pageSize ?? 10,
      sortBy: pagination.sortBy ?? 'Name',
      sortDescending: pagination.sortDirection === 'desc'
    };

    if (pagination.searchTerm) {
      params['searchTerm'] = pagination.searchTerm;
    }

    return this.api.get<ApiResponse<PagedResponse<BuildingListItem>>>(
      `${this.endpoint}/buildings`,
      params
    );
  }

  /**
   * Create a new building
   */
  createBuilding(request: CreateBuildingRequest): Observable<string> {
    return this.api.post<ApiResponse<string>>(
      `${this.endpoint}/buildings`,
      request
    ).pipe(map(response => response.data));
  }

  // ==================== Rooms ====================

  /**
   * Get all rooms with pagination and filtering
   */
  getRooms(
    pagination: PaginationParams = {},
    filter: RoomFilter = {}
  ): Observable<ApiResponse<PagedResponse<RoomListItem>>> {
    const params: Record<string, any> = {
      pageNumber: pagination.pageNumber ?? 1,
      pageSize: pagination.pageSize ?? 10,
      sortBy: pagination.sortBy ?? 'RoomNumber',
      sortDescending: pagination.sortDirection === 'desc'
    };

    if (pagination.searchTerm) params['searchTerm'] = pagination.searchTerm;
    if (filter.buildingId) params['buildingId'] = filter.buildingId;
    if (filter.type) params['type'] = filter.type;
    if (filter.minCapacity) params['minCapacity'] = filter.minCapacity;
    if (filter.isActive !== undefined) params['isActive'] = filter.isActive;

    return this.api.get<ApiResponse<PagedResponse<RoomListItem>>>(
      `${this.endpoint}/rooms`,
      params
    );
  }

  /**
   * Create a new room
   */
  createRoom(request: CreateRoomRequest): Observable<string> {
    return this.api.post<ApiResponse<string>>(
      `${this.endpoint}/rooms`,
      request
    ).pipe(map(response => response.data));
  }

  /**
   * Get room availability for a specific date
   */
  getRoomAvailability(roomId: string, date: string): Observable<RoomAvailability> {
    return this.api.get<ApiResponse<RoomAvailability>>(
      `${this.endpoint}/rooms/${roomId}/availability`,
      { date }
    ).pipe(map(response => response.data));
  }

  // ==================== Bookings ====================

  /**
   * Get all bookings with pagination and filtering
   */
  getBookings(
    pagination: PaginationParams = {},
    filter: BookingFilter = {}
  ): Observable<ApiResponse<PagedResponse<RoomBooking>>> {
    const params: Record<string, any> = {
      pageNumber: pagination.pageNumber ?? 1,
      pageSize: pagination.pageSize ?? 10,
      sortBy: pagination.sortBy ?? 'Date',
      sortDescending: pagination.sortDirection === 'desc'
    };

    if (pagination.searchTerm) params['searchTerm'] = pagination.searchTerm;
    if (filter.roomId) params['roomId'] = filter.roomId;
    if (filter.buildingId) params['buildingId'] = filter.buildingId;
    if (filter.date) params['date'] = filter.date;
    if (filter.startDate) params['startDate'] = filter.startDate;
    if (filter.endDate) params['endDate'] = filter.endDate;
    if (filter.bookingType) params['bookingType'] = filter.bookingType;
    if (filter.status) params['status'] = filter.status;

    return this.api.get<ApiResponse<PagedResponse<RoomBooking>>>(
      `${this.endpoint}/bookings`,
      params
    );
  }

  /**
   * Book a room
   */
  bookRoom(request: BookRoomRequest): Observable<string> {
    return this.api.post<ApiResponse<string>>(
      `${this.endpoint}/bookings`,
      request
    ).pipe(map(response => response.data));
  }

  /**
   * Cancel a booking
   */
  cancelBooking(bookingId: string, reason?: string): Observable<void> {
    const endpoint = reason
      ? `${this.endpoint}/bookings/${bookingId}?reason=${encodeURIComponent(reason)}`
      : `${this.endpoint}/bookings/${bookingId}`;

    return this.api.delete<ApiResponse<void>>(endpoint).pipe(map(() => void 0));
  }
}
