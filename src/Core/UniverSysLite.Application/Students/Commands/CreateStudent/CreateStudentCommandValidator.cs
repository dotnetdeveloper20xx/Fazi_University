using FluentValidation;
using UniverSysLite.Domain.Enums;

namespace UniverSysLite.Application.Students.Commands.CreateStudent;

public class CreateStudentCommandValidator : AbstractValidator<CreateStudentCommand>
{
    public CreateStudentCommandValidator()
    {
        RuleFor(x => x.FirstName)
            .NotEmpty().WithMessage("First name is required.")
            .MaximumLength(100).WithMessage("First name must not exceed 100 characters.");

        RuleFor(x => x.LastName)
            .NotEmpty().WithMessage("Last name is required.")
            .MaximumLength(100).WithMessage("Last name must not exceed 100 characters.");

        RuleFor(x => x.MiddleName)
            .MaximumLength(100).WithMessage("Middle name must not exceed 100 characters.");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required.")
            .EmailAddress().WithMessage("Invalid email format.")
            .MaximumLength(256).WithMessage("Email must not exceed 256 characters.");

        RuleFor(x => x.PersonalEmail)
            .EmailAddress().WithMessage("Invalid personal email format.")
            .When(x => !string.IsNullOrEmpty(x.PersonalEmail));

        RuleFor(x => x.DateOfBirth)
            .NotEmpty().WithMessage("Date of birth is required.")
            .LessThan(DateOnly.FromDateTime(DateTime.Today))
            .WithMessage("Date of birth must be in the past.");

        RuleFor(x => x.Gender)
            .NotEmpty().WithMessage("Gender is required.")
            .Must(g => Enum.TryParse<Gender>(g, true, out _))
            .WithMessage("Invalid gender. Valid values are: Male, Female, Other, PreferNotToSay.");

        RuleFor(x => x.Type)
            .Must(t => string.IsNullOrEmpty(t) || Enum.TryParse<StudentType>(t, true, out _))
            .WithMessage("Invalid student type. Valid values are: FullTime, PartTime, Online, Exchange, Visiting, NonDegree.");

        RuleFor(x => x.Phone)
            .MaximumLength(20).WithMessage("Phone must not exceed 20 characters.");

        RuleFor(x => x.MobilePhone)
            .MaximumLength(20).WithMessage("Mobile phone must not exceed 20 characters.");

        RuleFor(x => x.NationalId)
            .MaximumLength(50).WithMessage("National ID must not exceed 50 characters.");

        RuleFor(x => x.PassportNumber)
            .MaximumLength(50).WithMessage("Passport number must not exceed 50 characters.");

        RuleFor(x => x.AddressLine1)
            .MaximumLength(200).WithMessage("Address line 1 must not exceed 200 characters.");

        RuleFor(x => x.AddressLine2)
            .MaximumLength(200).WithMessage("Address line 2 must not exceed 200 characters.");

        RuleFor(x => x.City)
            .MaximumLength(100).WithMessage("City must not exceed 100 characters.");

        RuleFor(x => x.State)
            .MaximumLength(100).WithMessage("State must not exceed 100 characters.");

        RuleFor(x => x.PostalCode)
            .MaximumLength(20).WithMessage("Postal code must not exceed 20 characters.");

        RuleFor(x => x.Country)
            .MaximumLength(100).WithMessage("Country must not exceed 100 characters.");

        RuleFor(x => x.EmergencyContactName)
            .MaximumLength(200).WithMessage("Emergency contact name must not exceed 200 characters.");

        RuleFor(x => x.EmergencyContactPhone)
            .MaximumLength(20).WithMessage("Emergency contact phone must not exceed 20 characters.");

        RuleFor(x => x.EmergencyContactRelationship)
            .MaximumLength(50).WithMessage("Emergency contact relationship must not exceed 50 characters.");
    }
}
