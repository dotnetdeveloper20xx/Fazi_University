using FluentValidation;

namespace UniverSysLite.Application.Academics.Commands.CreateCourseSection;

public class CreateCourseSectionCommandValidator : AbstractValidator<CreateCourseSectionCommand>
{
    public CreateCourseSectionCommandValidator()
    {
        RuleFor(x => x.CourseId)
            .NotEmpty().WithMessage("Course is required.");

        RuleFor(x => x.TermId)
            .NotEmpty().WithMessage("Term is required.");

        RuleFor(x => x.SectionNumber)
            .NotEmpty().WithMessage("Section number is required.")
            .MaximumLength(10).WithMessage("Section number must not exceed 10 characters.");

        RuleFor(x => x.MaxEnrollment)
            .InclusiveBetween(1, 500).WithMessage("Max enrollment must be between 1 and 500.");

        RuleFor(x => x.WaitlistCapacity)
            .GreaterThanOrEqualTo(0).WithMessage("Waitlist capacity must be non-negative.")
            .LessThanOrEqualTo(50).WithMessage("Waitlist capacity must not exceed 50.");

        RuleFor(x => x.Room)
            .MaximumLength(50).WithMessage("Room must not exceed 50 characters.");

        RuleFor(x => x.Building)
            .MaximumLength(100).WithMessage("Building must not exceed 100 characters.");

        RuleFor(x => x.Schedule)
            .MaximumLength(100).WithMessage("Schedule must not exceed 100 characters.");

        RuleFor(x => x.DaysOfWeek)
            .MaximumLength(10).WithMessage("Days of week must not exceed 10 characters.");
    }
}
