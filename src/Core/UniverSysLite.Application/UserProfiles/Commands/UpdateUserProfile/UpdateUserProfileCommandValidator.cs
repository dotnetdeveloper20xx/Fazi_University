using FluentValidation;
using UniverSysLite.Domain.Enums;

namespace UniverSysLite.Application.UserProfiles.Commands.UpdateUserProfile;

public class UpdateUserProfileCommandValidator : AbstractValidator<UpdateUserProfileCommand>
{
    public UpdateUserProfileCommandValidator()
    {
        RuleFor(x => x.Bio)
            .MaximumLength(500)
            .When(x => x.Bio != null)
            .WithMessage("Bio must not exceed 500 characters.");

        RuleFor(x => x.JobTitle)
            .MaximumLength(100)
            .When(x => x.JobTitle != null)
            .WithMessage("Job title must not exceed 100 characters.");

        RuleFor(x => x.Department)
            .MaximumLength(100)
            .When(x => x.Department != null)
            .WithMessage("Department must not exceed 100 characters.");

        RuleFor(x => x.Location)
            .MaximumLength(200)
            .When(x => x.Location != null)
            .WithMessage("Location must not exceed 200 characters.");

        RuleFor(x => x.PhoneNumber)
            .MaximumLength(20)
            .When(x => x.PhoneNumber != null)
            .WithMessage("Phone number must not exceed 20 characters.");

        RuleFor(x => x.AvatarUrl)
            .MaximumLength(500)
            .When(x => x.AvatarUrl != null)
            .WithMessage("Avatar URL must not exceed 500 characters.");

        RuleFor(x => x.Visibility)
            .Must(v => v == null || Enum.TryParse<ProfileVisibility>(v, true, out _))
            .WithMessage("Invalid visibility value. Valid values are: Public, Internal, Private.");

        RuleFor(x => x.DateOfBirth)
            .LessThan(DateOnly.FromDateTime(DateTime.Today))
            .When(x => x.DateOfBirth.HasValue)
            .WithMessage("Date of birth must be in the past.");
    }
}
