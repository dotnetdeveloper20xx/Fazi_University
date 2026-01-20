using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using UniverSysLite.Domain.Entities.Identity;

namespace UniverSysLite.Infrastructure.Persistence.Configurations;

public class AuditLogConfiguration : IEntityTypeConfiguration<AuditLog>
{
    public void Configure(EntityTypeBuilder<AuditLog> builder)
    {
        builder.ToTable("AuditLogs");

        builder.HasKey(a => a.Id);

        builder.Property(a => a.Action)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(a => a.EntityType)
            .HasMaxLength(100);

        builder.Property(a => a.EntityId)
            .HasMaxLength(100);

        builder.Property(a => a.ChangesSummary)
            .HasMaxLength(2000);

        builder.Property(a => a.ChangedColumns)
            .HasMaxLength(1000);

        builder.Property(a => a.EntityName)
            .HasMaxLength(200);

        builder.Property(a => a.RequestPath)
            .HasMaxLength(500);

        builder.Property(a => a.RequestMethod)
            .HasMaxLength(10);

        builder.Property(a => a.UserEmail)
            .HasMaxLength(256);

        builder.Property(a => a.AdditionalData)
            .HasColumnType("nvarchar(max)");

        builder.Property(a => a.ErrorMessage)
            .HasMaxLength(2000);

        builder.Property(a => a.OldValues)
            .HasColumnType("nvarchar(max)");

        builder.Property(a => a.NewValues)
            .HasColumnType("nvarchar(max)");

        builder.Property(a => a.IpAddress)
            .HasMaxLength(45);

        builder.Property(a => a.UserAgent)
            .HasMaxLength(500);

        builder.Property(a => a.Severity)
            .HasDefaultValue(Domain.Enums.AuditSeverity.Info)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(a => a.Timestamp)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(a => a.CorrelationId)
            .HasMaxLength(100);

        builder.Property(a => a.PreviousHash)
            .HasMaxLength(128);

        builder.Property(a => a.Hash)
            .HasMaxLength(128);

        // Indexes for efficient querying
        builder.HasIndex(a => a.UserId);
        builder.HasIndex(a => a.Action);
        builder.HasIndex(a => a.EntityType);
        builder.HasIndex(a => a.Timestamp);
        builder.HasIndex(a => a.Severity);
        builder.HasIndex(a => new { a.EntityType, a.EntityId });
    }
}
