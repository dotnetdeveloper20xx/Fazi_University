using FluentValidation;

namespace UniverSysLite.Application.Billing.Commands.AddCharge;

public class AddChargeCommandValidator : AbstractValidator<AddChargeCommand>
{
    public AddChargeCommandValidator()
    {
        RuleFor(x => x.StudentId)
            .NotEmpty().WithMessage("Student is required.");

        RuleFor(x => x.Amount)
            .GreaterThan(0).WithMessage("Amount must be greater than 0.");

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Description is required.")
            .MaximumLength(200).WithMessage("Description must not exceed 200 characters.");

        RuleFor(x => x.ChargeType)
            .NotEmpty().WithMessage("Charge type is required.")
            .MaximumLength(50).WithMessage("Charge type must not exceed 50 characters.");
    }
}
