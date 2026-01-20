using FluentValidation;
using UniverSysLite.Domain.Enums;

namespace UniverSysLite.Application.Academics.Commands.CreateCourse;

public class CreateCourseCommandValidator : AbstractValidator<CreateCourseCommand>
{
    public CreateCourseCommandValidator()
    {
        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Course code is required.")
            .MaximumLength(20).WithMessage("Course code must not exceed 20 characters.");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Course name is required.")
            .MaximumLength(200).WithMessage("Course name must not exceed 200 characters.");

        RuleFor(x => x.Description)
            .MaximumLength(2000).WithMessage("Description must not exceed 2000 characters.");

        RuleFor(x => x.DepartmentId)
            .NotEmpty().WithMessage("Department is required.");

        RuleFor(x => x.CreditHours)
            .InclusiveBetween(0, 12).WithMessage("Credit hours must be between 0 and 12.");

        RuleFor(x => x.LectureHours)
            .GreaterThanOrEqualTo(0).WithMessage("Lecture hours must be non-negative.");

        RuleFor(x => x.LabHours)
            .GreaterThanOrEqualTo(0).WithMessage("Lab hours must be non-negative.");

        RuleFor(x => x.Level)
            .NotEmpty().WithMessage("Course level is required.")
            .Must(l => Enum.TryParse<CourseLevel>(l, true, out _))
            .WithMessage("Invalid course level. Valid values are: Undergraduate, Graduate, Doctoral.");
    }
}
