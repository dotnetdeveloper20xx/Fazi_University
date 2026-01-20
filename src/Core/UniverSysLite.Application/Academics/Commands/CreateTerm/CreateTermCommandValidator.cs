using FluentValidation;
using UniverSysLite.Domain.Enums;

namespace UniverSysLite.Application.Academics.Commands.CreateTerm;

public class CreateTermCommandValidator : AbstractValidator<CreateTermCommand>
{
    public CreateTermCommandValidator()
    {
        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Term code is required.")
            .MaximumLength(20).WithMessage("Term code must not exceed 20 characters.");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Term name is required.")
            .MaximumLength(100).WithMessage("Term name must not exceed 100 characters.");

        RuleFor(x => x.Type)
            .NotEmpty().WithMessage("Term type is required.")
            .Must(t => Enum.TryParse<TermType>(t, true, out _))
            .WithMessage("Invalid term type. Valid values are: Fall, Spring, Summer, Winter, Intersession.");

        RuleFor(x => x.AcademicYear)
            .InclusiveBetween(2000, 2100).WithMessage("Academic year must be between 2000 and 2100.");

        RuleFor(x => x.StartDate)
            .NotEmpty().WithMessage("Start date is required.");

        RuleFor(x => x.EndDate)
            .NotEmpty().WithMessage("End date is required.")
            .GreaterThan(x => x.StartDate).WithMessage("End date must be after start date.");

        RuleFor(x => x.RegistrationStartDate)
            .NotEmpty().WithMessage("Registration start date is required.");

        RuleFor(x => x.RegistrationEndDate)
            .NotEmpty().WithMessage("Registration end date is required.")
            .GreaterThan(x => x.RegistrationStartDate).WithMessage("Registration end date must be after start date.");

        RuleFor(x => x.AddDropDeadline)
            .NotEmpty().WithMessage("Add/drop deadline is required.");

        RuleFor(x => x.WithdrawalDeadline)
            .NotEmpty().WithMessage("Withdrawal deadline is required.");

        RuleFor(x => x.GradesDeadline)
            .NotEmpty().WithMessage("Grades deadline is required.");
    }
}
