using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using UniverSysLite.Domain.Entities.Academic;

namespace UniverSysLite.Infrastructure.Persistence.Configurations;

public class EnrollmentConfiguration : IEntityTypeConfiguration<Enrollment>
{
    public void Configure(EntityTypeBuilder<Enrollment> builder)
    {
        builder.ToTable("Enrollments");

        builder.HasKey(e => e.Id);

        builder.HasIndex(e => new { e.StudentId, e.CourseSectionId }).IsUnique();

        builder.Property(e => e.Grade)
            .HasMaxLength(5);

        builder.Property(e => e.GradePoints)
            .HasPrecision(4, 2);

        builder.Property(e => e.NumericGrade)
            .HasPrecision(5, 2);

        builder.Property(e => e.Notes)
            .HasMaxLength(500);

        builder.HasOne(e => e.Student)
            .WithMany(s => s.Enrollments)
            .HasForeignKey(e => e.StudentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.CourseSection)
            .WithMany(cs => cs.Enrollments)
            .HasForeignKey(e => e.CourseSectionId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
