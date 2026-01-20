using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using UniverSysLite.Domain.Entities.Identity;

namespace UniverSysLite.Infrastructure.Persistence.Configurations;

public class UserSessionConfiguration : IEntityTypeConfiguration<UserSession>
{
    public void Configure(EntityTypeBuilder<UserSession> builder)
    {
        builder.ToTable("UserSessions");

        builder.HasKey(s => s.Id);

        builder.Property(s => s.DeviceInfo)
            .HasMaxLength(500);

        builder.Property(s => s.Browser)
            .HasMaxLength(100);

        builder.Property(s => s.OperatingSystem)
            .HasMaxLength(100);

        builder.Property(s => s.IpAddress)
            .HasMaxLength(45); // IPv6 max length

        builder.Property(s => s.Location)
            .HasMaxLength(200);

        builder.Property(s => s.LoginAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(s => s.LastActivityAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(s => s.IsActive)
            .HasDefaultValue(true);

        // Indexes
        builder.HasIndex(s => s.UserId);
        builder.HasIndex(s => s.IsActive);
        builder.HasIndex(s => s.LoginAt);
    }
}
