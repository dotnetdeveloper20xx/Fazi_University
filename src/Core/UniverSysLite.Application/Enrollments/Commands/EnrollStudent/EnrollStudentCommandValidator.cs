using FluentValidation;

namespace UniverSysLite.Application.Enrollments.Commands.EnrollStudent;

public class EnrollStudentCommandValidator : AbstractValidator<EnrollStudentCommand>
{
    public EnrollStudentCommandValidator()
    {
        RuleFor(x => x.StudentId)
            .NotEmpty().WithMessage("Student is required.");

        RuleFor(x => x.CourseSectionId)
            .NotEmpty().WithMessage("Course section is required.");

        RuleFor(x => x.Notes)
            .MaximumLength(500).WithMessage("Notes must not exceed 500 characters.");
    }
}
