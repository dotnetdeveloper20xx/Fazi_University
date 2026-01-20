using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using UniverSysLite.Domain.Entities.Academic;

namespace UniverSysLite.Infrastructure.Persistence.Configurations;

public class ProgramConfiguration : IEntityTypeConfiguration<Program>
{
    public void Configure(EntityTypeBuilder<Program> builder)
    {
        builder.ToTable("Programs");

        builder.HasKey(p => p.Id);

        builder.HasIndex(p => p.Code).IsUnique();

        builder.Property(p => p.Code)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(p => p.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(p => p.Description)
            .HasMaxLength(1000);

        builder.Property(p => p.TuitionPerCredit)
            .HasPrecision(18, 2);

        builder.HasOne(p => p.Department)
            .WithMany(d => d.Programs)
            .HasForeignKey(p => p.DepartmentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasQueryFilter(p => !p.IsDeleted);
    }
}
