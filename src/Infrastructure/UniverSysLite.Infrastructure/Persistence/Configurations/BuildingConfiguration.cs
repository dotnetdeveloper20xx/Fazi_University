using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using UniverSysLite.Domain.Entities;

namespace UniverSysLite.Infrastructure.Persistence.Configurations;

public class BuildingConfiguration : IEntityTypeConfiguration<Building>
{
    public void Configure(EntityTypeBuilder<Building> builder)
    {
        builder.ToTable("Buildings");

        builder.HasKey(b => b.Id);

        builder.Property(b => b.Code)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(b => b.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(b => b.Description)
            .HasMaxLength(1000);

        builder.Property(b => b.Address)
            .HasMaxLength(500);

        builder.HasIndex(b => b.Code)
            .IsUnique()
            .HasFilter("[IsDeleted] = 0");

        builder.HasQueryFilter(b => !b.IsDeleted);

        builder.HasMany(b => b.Rooms)
            .WithOne(r => r.Building)
            .HasForeignKey(r => r.BuildingId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
