using FluentValidation;

namespace UniverSysLite.Application.Users.Commands.UpdateUser;

public class UpdateUserCommandValidator : AbstractValidator<UpdateUserCommand>
{
    public UpdateUserCommandValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("User ID is required");

        RuleFor(x => x.FirstName)
            .MaximumLength(50).WithMessage("First name must not exceed 50 characters")
            .When(x => x.FirstName != null);

        RuleFor(x => x.LastName)
            .MaximumLength(50).WithMessage("Last name must not exceed 50 characters")
            .When(x => x.LastName != null);

        RuleFor(x => x.DisplayName)
            .MaximumLength(100).WithMessage("Display name must not exceed 100 characters")
            .When(x => x.DisplayName != null);

        RuleFor(x => x.PhoneNumber)
            .MaximumLength(20).WithMessage("Phone number must not exceed 20 characters")
            .Matches(@"^[\d\s\+\-\(\)]*$").WithMessage("Invalid phone number format")
            .When(x => !string.IsNullOrEmpty(x.PhoneNumber));

        RuleFor(x => x.Roles)
            .Must(roles => roles == null || roles.Count > 0)
            .WithMessage("If updating roles, at least one role must be provided");
    }
}
