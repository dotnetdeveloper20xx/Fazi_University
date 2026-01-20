using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using UniverSysLite.Domain.Entities.Identity;
using UniverSysLite.Domain.Enums;

namespace UniverSysLite.Infrastructure.Persistence.Configurations;

public class UserSettingsConfiguration : IEntityTypeConfiguration<UserSettings>
{
    public void Configure(EntityTypeBuilder<UserSettings> builder)
    {
        builder.ToTable("UserSettings");

        builder.HasKey(s => s.Id);

        builder.Property(s => s.Theme)
            .HasDefaultValue(ThemeMode.System)
            .HasConversion<string>();

        builder.Property(s => s.AccentColor)
            .HasMaxLength(20);

        builder.Property(s => s.Density)
            .HasDefaultValue(UiDensity.Comfortable)
            .HasConversion<string>();

        builder.Property(s => s.Language)
            .HasMaxLength(10)
            .HasDefaultValue("en-US");

        builder.Property(s => s.DateFormat)
            .HasMaxLength(20)
            .HasDefaultValue("MM/dd/yyyy");

        builder.Property(s => s.TimeFormat)
            .HasMaxLength(20)
            .HasDefaultValue("h:mm tt");

        builder.Property(s => s.Timezone)
            .HasMaxLength(50)
            .HasDefaultValue("UTC");

        builder.Property(s => s.FontSize)
            .HasDefaultValue(FontSize.Medium)
            .HasConversion<string>();

        builder.Property(s => s.DigestFrequency)
            .HasDefaultValue(DigestFrequency.Immediate)
            .HasConversion<string>();

        builder.Property(s => s.EmailNotifications)
            .HasDefaultValue(true);

        builder.Property(s => s.PushNotifications)
            .HasDefaultValue(true);

        builder.Property(s => s.InAppNotifications)
            .HasDefaultValue(true);

        // Indexes
        builder.HasIndex(s => s.UserId)
            .IsUnique();
    }
}
