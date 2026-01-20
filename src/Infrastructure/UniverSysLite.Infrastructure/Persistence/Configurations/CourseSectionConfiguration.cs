using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using UniverSysLite.Domain.Entities.Academic;

namespace UniverSysLite.Infrastructure.Persistence.Configurations;

public class CourseSectionConfiguration : IEntityTypeConfiguration<CourseSection>
{
    public void Configure(EntityTypeBuilder<CourseSection> builder)
    {
        builder.ToTable("CourseSections");

        builder.HasKey(cs => cs.Id);

        builder.HasIndex(cs => new { cs.CourseId, cs.TermId, cs.SectionNumber }).IsUnique();

        builder.Property(cs => cs.SectionNumber)
            .IsRequired()
            .HasMaxLength(10);

        builder.Property(cs => cs.Room)
            .HasMaxLength(50);

        builder.Property(cs => cs.Building)
            .HasMaxLength(100);

        builder.Property(cs => cs.Schedule)
            .HasMaxLength(100);

        builder.Property(cs => cs.DaysOfWeek)
            .HasMaxLength(10);

        builder.HasOne(cs => cs.Course)
            .WithMany(c => c.Sections)
            .HasForeignKey(cs => cs.CourseId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(cs => cs.Term)
            .WithMany(t => t.Sections)
            .HasForeignKey(cs => cs.TermId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(cs => cs.Instructor)
            .WithMany()
            .HasForeignKey(cs => cs.InstructorId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasQueryFilter(cs => !cs.IsDeleted);
    }
}
