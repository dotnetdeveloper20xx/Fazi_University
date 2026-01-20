namespace UniverSysLite.Application.Scheduling.DTOs;

public record BuildingDto
{
    public Guid Id { get; init; }
    public string Code { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string? Address { get; init; }
    public int? TotalFloors { get; init; }
    public bool IsActive { get; init; }
    public int RoomCount { get; init; }
}

public record BuildingListDto
{
    public Guid Id { get; init; }
    public string Code { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string? Address { get; init; }
    public int? TotalFloors { get; init; }
    public bool IsActive { get; init; }
    public int RoomCount { get; init; }
    public int ActiveRoomCount { get; init; }
}

public record RoomDto
{
    public Guid Id { get; init; }
    public Guid BuildingId { get; init; }
    public string BuildingName { get; init; } = string.Empty;
    public string RoomNumber { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string Type { get; init; } = string.Empty;
    public int Capacity { get; init; }
    public int? Floor { get; init; }
    public string? Description { get; init; }
    public bool HasProjector { get; init; }
    public bool HasWhiteboard { get; init; }
    public bool HasComputers { get; init; }
    public int? ComputerCount { get; init; }
    public bool IsAccessible { get; init; }
    public bool IsActive { get; init; }
}

public record RoomListDto
{
    public Guid Id { get; init; }
    public string BuildingCode { get; init; } = string.Empty;
    public string BuildingName { get; init; } = string.Empty;
    public string RoomNumber { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string Type { get; init; } = string.Empty;
    public int Capacity { get; init; }
    public int? Floor { get; init; }
    public bool IsActive { get; init; }
    public string Features { get; init; } = string.Empty;
}

public record RoomBookingDto
{
    public Guid Id { get; init; }
    public Guid RoomId { get; init; }
    public string RoomName { get; init; } = string.Empty;
    public string BuildingName { get; init; } = string.Empty;
    public Guid? CourseSectionId { get; init; }
    public string? CourseCode { get; init; }
    public string? CourseName { get; init; }
    public Guid? BookedById { get; init; }
    public string? BookedByName { get; init; }
    public string Title { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string BookingType { get; init; } = string.Empty;
    public DateOnly Date { get; init; }
    public TimeOnly StartTime { get; init; }
    public TimeOnly EndTime { get; init; }
    public bool IsRecurring { get; init; }
    public string? RecurrencePattern { get; init; }
    public DateOnly? RecurrenceEndDate { get; init; }
    public string Status { get; init; } = string.Empty;
}

public record RoomAvailabilityDto
{
    public Guid RoomId { get; init; }
    public string RoomName { get; init; } = string.Empty;
    public string BuildingName { get; init; } = string.Empty;
    public DateOnly Date { get; init; }
    public List<TimeSlotDto> AvailableSlots { get; init; } = new();
    public List<TimeSlotDto> BookedSlots { get; init; } = new();
    public bool IsAvailable { get; init; }
}

public record TimeSlotDto
{
    public TimeOnly StartTime { get; init; }
    public TimeOnly EndTime { get; init; }
    public bool IsBooked { get; init; }
    public string? BookingTitle { get; init; }
    public string? BookingType { get; init; }
}

public record ScheduleConflictDto
{
    public Guid RoomId { get; init; }
    public string RoomName { get; init; } = string.Empty;
    public DateOnly Date { get; init; }
    public TimeOnly StartTime { get; init; }
    public TimeOnly EndTime { get; init; }
    public string ConflictingBookingTitle { get; init; } = string.Empty;
    public string Message { get; init; } = string.Empty;
}
