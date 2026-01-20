using FluentValidation;
using UniverSysLite.Domain.Enums;

namespace UniverSysLite.Application.Academics.Commands.CreateProgram;

public class CreateProgramCommandValidator : AbstractValidator<CreateProgramCommand>
{
    public CreateProgramCommandValidator()
    {
        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Program code is required.")
            .MaximumLength(20).WithMessage("Program code must not exceed 20 characters.");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Program name is required.")
            .MaximumLength(200).WithMessage("Program name must not exceed 200 characters.");

        RuleFor(x => x.Description)
            .MaximumLength(1000).WithMessage("Description must not exceed 1000 characters.");

        RuleFor(x => x.DegreeType)
            .NotEmpty().WithMessage("Degree type is required.")
            .Must(dt => Enum.TryParse<DegreeType>(dt, true, out _))
            .WithMessage("Invalid degree type. Valid values are: Certificate, Associate, Bachelor, Master, Doctorate, Professional.");

        RuleFor(x => x.DepartmentId)
            .NotEmpty().WithMessage("Department is required.");

        RuleFor(x => x.TotalCreditsRequired)
            .GreaterThan(0).WithMessage("Total credits required must be greater than 0.")
            .LessThanOrEqualTo(300).WithMessage("Total credits required must not exceed 300.");

        RuleFor(x => x.DurationYears)
            .GreaterThan(0).WithMessage("Duration must be at least 1 year.")
            .LessThanOrEqualTo(10).WithMessage("Duration must not exceed 10 years.");

        RuleFor(x => x.TuitionPerCredit)
            .GreaterThanOrEqualTo(0).WithMessage("Tuition per credit must be non-negative.");
    }
}
