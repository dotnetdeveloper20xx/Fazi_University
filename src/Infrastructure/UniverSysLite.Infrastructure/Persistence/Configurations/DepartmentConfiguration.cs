using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using UniverSysLite.Domain.Entities.Academic;

namespace UniverSysLite.Infrastructure.Persistence.Configurations;

public class DepartmentConfiguration : IEntityTypeConfiguration<Department>
{
    public void Configure(EntityTypeBuilder<Department> builder)
    {
        builder.ToTable("Departments");

        builder.HasKey(d => d.Id);

        builder.HasIndex(d => d.Code).IsUnique();

        builder.Property(d => d.Code)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(d => d.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(d => d.Description)
            .HasMaxLength(1000);

        builder.Property(d => d.Phone)
            .HasMaxLength(20);

        builder.Property(d => d.Email)
            .HasMaxLength(256);

        builder.Property(d => d.Location)
            .HasMaxLength(200);

        builder.HasQueryFilter(d => !d.IsDeleted);
    }
}
