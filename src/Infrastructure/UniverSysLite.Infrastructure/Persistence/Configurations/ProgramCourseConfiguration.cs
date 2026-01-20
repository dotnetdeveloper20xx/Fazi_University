using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using UniverSysLite.Domain.Entities.Academic;

namespace UniverSysLite.Infrastructure.Persistence.Configurations;

public class ProgramCourseConfiguration : IEntityTypeConfiguration<ProgramCourse>
{
    public void Configure(EntityTypeBuilder<ProgramCourse> builder)
    {
        builder.ToTable("ProgramCourses");

        builder.HasKey(pc => pc.Id);

        builder.HasIndex(pc => new { pc.ProgramId, pc.CourseId }).IsUnique();

        builder.HasOne(pc => pc.Program)
            .WithMany(p => p.ProgramCourses)
            .HasForeignKey(pc => pc.ProgramId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(pc => pc.Course)
            .WithMany(c => c.ProgramCourses)
            .HasForeignKey(pc => pc.CourseId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
