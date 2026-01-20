namespace UniverSysLite.Application.Billing.DTOs;

/// <summary>
/// Student account summary DTO.
/// </summary>
public record StudentAccountDto
{
    public Guid StudentId { get; init; }
    public string StudentId_Display { get; init; } = string.Empty;
    public string StudentName { get; init; } = string.Empty;
    public decimal AccountBalance { get; init; }
    public bool HasFinancialHold { get; init; }
    public string AccountStatus { get; init; } = string.Empty;
    public List<ChargeDto> RecentCharges { get; init; } = new();
    public List<PaymentDto> RecentPayments { get; init; } = new();
}

/// <summary>
/// Charge/invoice line item DTO.
/// </summary>
public record ChargeDto
{
    public string Description { get; init; } = string.Empty;
    public decimal Amount { get; init; }
    public DateTime ChargeDate { get; init; }
    public string ChargeType { get; init; } = string.Empty;
    public string TermName { get; init; } = string.Empty;
}

/// <summary>
/// Payment DTO.
/// </summary>
public record PaymentDto
{
    public Guid PaymentId { get; init; }
    public decimal Amount { get; init; }
    public DateTime PaymentDate { get; init; }
    public string PaymentMethod { get; init; } = string.Empty;
    public string? ReferenceNumber { get; init; }
    public string Status { get; init; } = string.Empty;
}

/// <summary>
/// Tuition calculation result DTO.
/// </summary>
public record TuitionCalculationDto
{
    public Guid StudentId { get; init; }
    public Guid TermId { get; init; }
    public string TermName { get; init; } = string.Empty;
    public int TotalCredits { get; init; }
    public decimal TuitionPerCredit { get; init; }
    public decimal TuitionAmount { get; init; }
    public decimal Fees { get; init; }
    public decimal TotalAmount { get; init; }
    public List<TuitionLineItemDto> LineItems { get; init; } = new();
}

/// <summary>
/// Tuition line item DTO.
/// </summary>
public record TuitionLineItemDto
{
    public string CourseCode { get; init; } = string.Empty;
    public string CourseName { get; init; } = string.Empty;
    public int CreditHours { get; init; }
    public decimal TuitionRate { get; init; }
    public decimal Amount { get; init; }
}
