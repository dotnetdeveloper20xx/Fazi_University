using FluentValidation;

namespace UniverSysLite.Application.Billing.Commands.ProcessPayment;

public class ProcessPaymentCommandValidator : AbstractValidator<ProcessPaymentCommand>
{
    private static readonly string[] ValidPaymentMethods = { "Cash", "Check", "CreditCard", "DebitCard", "BankTransfer", "FinancialAid", "Scholarship" };

    public ProcessPaymentCommandValidator()
    {
        RuleFor(x => x.StudentId)
            .NotEmpty().WithMessage("Student is required.");

        RuleFor(x => x.Amount)
            .GreaterThan(0).WithMessage("Payment amount must be greater than 0.");

        RuleFor(x => x.PaymentMethod)
            .NotEmpty().WithMessage("Payment method is required.")
            .Must(pm => ValidPaymentMethods.Contains(pm))
            .WithMessage($"Invalid payment method. Valid methods are: {string.Join(", ", ValidPaymentMethods)}");

        RuleFor(x => x.ReferenceNumber)
            .MaximumLength(100).WithMessage("Reference number must not exceed 100 characters.");

        RuleFor(x => x.Notes)
            .MaximumLength(500).WithMessage("Notes must not exceed 500 characters.");
    }
}
