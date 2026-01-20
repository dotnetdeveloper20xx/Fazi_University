using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using UniverSysLite.Domain.Entities.Identity;

namespace UniverSysLite.Infrastructure.Persistence.Configurations;

public class PasswordHistoryConfiguration : IEntityTypeConfiguration<PasswordHistory>
{
    public void Configure(EntityTypeBuilder<PasswordHistory> builder)
    {
        builder.ToTable("PasswordHistories");

        builder.HasKey(ph => ph.Id);

        builder.Property(ph => ph.PasswordHash)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(ph => ph.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        // Indexes
        builder.HasIndex(ph => ph.UserId);
        builder.HasIndex(ph => ph.CreatedAt);
    }
}
