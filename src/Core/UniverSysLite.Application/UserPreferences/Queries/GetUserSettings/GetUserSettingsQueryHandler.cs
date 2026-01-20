using MediatR;
using Microsoft.EntityFrameworkCore;
using UniverSysLite.Application.Common.Exceptions;
using UniverSysLite.Application.Common.Interfaces;
using UniverSysLite.Application.Common.Models;
using UniverSysLite.Application.Users.DTOs;

namespace UniverSysLite.Application.UserPreferences.Queries.GetUserSettings;

public class GetUserSettingsQueryHandler : IRequestHandler<GetUserSettingsQuery, Result<UserSettingsDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public GetUserSettingsQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result<UserSettingsDto>> Handle(GetUserSettingsQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;

        if (!userId.HasValue || userId == Guid.Empty)
        {
            return Result<UserSettingsDto>.Failure("User not authenticated.");
        }

        var settings = await _context.UserSettings
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.UserId == userId.Value, cancellationToken);

        if (settings == null)
        {
            throw new NotFoundException("UserSettings", userId.Value);
        }

        var dto = new UserSettingsDto
        {
            Id = settings.Id,
            Theme = settings.Theme.ToString(),
            Density = settings.Density.ToString(),
            FontSize = settings.FontSize.ToString(),
            AccentColor = settings.AccentColor,
            HighContrastMode = settings.HighContrastMode,
            ReducedMotion = settings.ReducedMotion,
            Language = settings.Language,
            Timezone = settings.Timezone,
            DateFormat = settings.DateFormat,
            TimeFormat = settings.TimeFormat,
            EmailNotifications = settings.EmailNotifications,
            PushNotifications = settings.PushNotifications,
            InAppNotifications = settings.InAppNotifications,
            DigestFrequency = settings.DigestFrequency.ToString()
        };

        return Result<UserSettingsDto>.Success(dto);
    }
}
