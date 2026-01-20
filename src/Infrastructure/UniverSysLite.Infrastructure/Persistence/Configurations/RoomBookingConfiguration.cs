using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using UniverSysLite.Domain.Entities;

namespace UniverSysLite.Infrastructure.Persistence.Configurations;

public class RoomBookingConfiguration : IEntityTypeConfiguration<RoomBooking>
{
    public void Configure(EntityTypeBuilder<RoomBooking> builder)
    {
        builder.ToTable("RoomBookings");

        builder.HasKey(b => b.Id);

        builder.Property(b => b.Title)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(b => b.Description)
            .HasMaxLength(1000);

        builder.Property(b => b.BookingType)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(b => b.Status)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(b => b.RecurrencePattern)
            .HasMaxLength(500);

        builder.Property(b => b.CancellationReason)
            .HasMaxLength(500);

        builder.HasIndex(b => new { b.RoomId, b.Date, b.StartTime, b.EndTime });

        builder.HasOne(b => b.CourseSection)
            .WithMany()
            .HasForeignKey(b => b.CourseSectionId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(b => b.BookedBy)
            .WithMany()
            .HasForeignKey(b => b.BookedById)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
