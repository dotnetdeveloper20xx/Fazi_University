using FluentValidation;

namespace UniverSysLite.Application.Grades.Commands.SubmitGrade;

public class SubmitGradeCommandValidator : AbstractValidator<SubmitGradeCommand>
{
    public SubmitGradeCommandValidator()
    {
        RuleFor(x => x.EnrollmentId)
            .NotEmpty().WithMessage("Enrollment is required.");

        RuleFor(x => x.Grade)
            .NotEmpty().WithMessage("Grade is required.")
            .MaximumLength(5).WithMessage("Grade must not exceed 5 characters.");

        RuleFor(x => x.NumericGrade)
            .InclusiveBetween(0, 100)
            .When(x => x.NumericGrade.HasValue)
            .WithMessage("Numeric grade must be between 0 and 100.");

        RuleFor(x => x.Notes)
            .MaximumLength(500).WithMessage("Notes must not exceed 500 characters.");
    }
}
