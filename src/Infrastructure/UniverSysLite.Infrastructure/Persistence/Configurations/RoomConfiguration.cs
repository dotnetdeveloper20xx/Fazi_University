using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using UniverSysLite.Domain.Entities;

namespace UniverSysLite.Infrastructure.Persistence.Configurations;

public class RoomConfiguration : IEntityTypeConfiguration<Room>
{
    public void Configure(EntityTypeBuilder<Room> builder)
    {
        builder.ToTable("Rooms");

        builder.HasKey(r => r.Id);

        builder.Property(r => r.RoomNumber)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(r => r.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(r => r.Description)
            .HasMaxLength(1000);

        builder.Property(r => r.Type)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.HasIndex(r => new { r.BuildingId, r.RoomNumber })
            .IsUnique()
            .HasFilter("[IsDeleted] = 0");

        builder.HasQueryFilter(r => !r.IsDeleted);

        builder.HasMany(r => r.Bookings)
            .WithOne(b => b.Room)
            .HasForeignKey(b => b.RoomId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
