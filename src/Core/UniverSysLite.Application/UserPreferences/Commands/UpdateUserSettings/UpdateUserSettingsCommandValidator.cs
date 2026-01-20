using FluentValidation;
using UniverSysLite.Domain.Enums;

namespace UniverSysLite.Application.UserPreferences.Commands.UpdateUserSettings;

public class UpdateUserSettingsCommandValidator : AbstractValidator<UpdateUserSettingsCommand>
{
    private static readonly string[] SupportedLanguages = { "en-US", "en-GB", "es-ES", "fr-FR", "de-DE", "it-IT", "pt-BR", "zh-CN", "ja-JP", "ko-KR" };

    public UpdateUserSettingsCommandValidator()
    {
        // Theme validation
        RuleFor(x => x.Theme)
            .Must(t => t == null || Enum.TryParse<ThemeMode>(t, true, out _))
            .WithMessage("Invalid theme. Valid values are: Light, Dark, System.");

        RuleFor(x => x.AccentColor)
            .MaximumLength(20)
            .When(x => x.AccentColor != null)
            .WithMessage("Accent color must not exceed 20 characters.");

        RuleFor(x => x.Density)
            .Must(d => d == null || Enum.TryParse<UiDensity>(d, true, out _))
            .WithMessage("Invalid density. Valid values are: Compact, Comfortable, Spacious.");

        // Regional validation
        RuleFor(x => x.Language)
            .Must(l => l == null || SupportedLanguages.Contains(l))
            .WithMessage($"Invalid language. Supported languages are: {string.Join(", ", SupportedLanguages)}.");

        RuleFor(x => x.DateFormat)
            .MaximumLength(20)
            .When(x => x.DateFormat != null)
            .WithMessage("Date format must not exceed 20 characters.");

        RuleFor(x => x.TimeFormat)
            .MaximumLength(20)
            .When(x => x.TimeFormat != null)
            .WithMessage("Time format must not exceed 20 characters.");

        RuleFor(x => x.Timezone)
            .MaximumLength(50)
            .When(x => x.Timezone != null)
            .WithMessage("Timezone must not exceed 50 characters.");

        // Accessibility validation
        RuleFor(x => x.FontSize)
            .Must(f => f == null || Enum.TryParse<FontSize>(f, true, out _))
            .WithMessage("Invalid font size. Valid values are: Small, Medium, Large, ExtraLarge.");

        // Notification validation
        RuleFor(x => x.DigestFrequency)
            .Must(d => d == null || Enum.TryParse<DigestFrequency>(d, true, out _))
            .WithMessage("Invalid digest frequency. Valid values are: Immediate, Daily, Weekly, Never.");
    }
}
