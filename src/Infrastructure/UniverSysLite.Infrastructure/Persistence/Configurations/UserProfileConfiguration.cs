using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using UniverSysLite.Domain.Entities.Identity;
using UniverSysLite.Domain.Enums;

namespace UniverSysLite.Infrastructure.Persistence.Configurations;

public class UserProfileConfiguration : IEntityTypeConfiguration<UserProfile>
{
    public void Configure(EntityTypeBuilder<UserProfile> builder)
    {
        builder.ToTable("UserProfiles");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.AvatarUrl)
            .HasMaxLength(500);

        builder.Property(p => p.AvatarThumbnailUrl)
            .HasMaxLength(500);

        builder.Property(p => p.PhoneNumber)
            .HasMaxLength(20);

        builder.Property(p => p.Bio)
            .HasMaxLength(1000);

        builder.Property(p => p.JobTitle)
            .HasMaxLength(100);

        builder.Property(p => p.Department)
            .HasMaxLength(100);

        builder.Property(p => p.Location)
            .HasMaxLength(200);

        builder.Property(p => p.Visibility)
            .HasDefaultValue(ProfileVisibility.Internal)
            .HasConversion<string>()
            .HasMaxLength(20);

        // Indexes
        builder.HasIndex(p => p.UserId)
            .IsUnique();

        builder.HasIndex(p => p.Department);
    }
}
