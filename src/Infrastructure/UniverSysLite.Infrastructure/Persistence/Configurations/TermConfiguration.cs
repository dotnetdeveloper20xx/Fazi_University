using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using UniverSysLite.Domain.Entities.Academic;

namespace UniverSysLite.Infrastructure.Persistence.Configurations;

public class TermConfiguration : IEntityTypeConfiguration<Term>
{
    public void Configure(EntityTypeBuilder<Term> builder)
    {
        builder.ToTable("Terms");

        builder.HasKey(t => t.Id);

        builder.HasIndex(t => t.Code).IsUnique();

        builder.Property(t => t.Code)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(t => t.Name)
            .IsRequired()
            .HasMaxLength(100);
    }
}
