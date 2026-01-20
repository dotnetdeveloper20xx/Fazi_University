using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using UniverSysLite.Domain.Entities.Academic;

namespace UniverSysLite.Infrastructure.Persistence.Configurations;

public class StudentDocumentConfiguration : IEntityTypeConfiguration<StudentDocument>
{
    public void Configure(EntityTypeBuilder<StudentDocument> builder)
    {
        builder.ToTable("StudentDocuments");

        builder.HasKey(sd => sd.Id);

        builder.Property(sd => sd.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(sd => sd.Description)
            .HasMaxLength(500);

        builder.Property(sd => sd.FilePath)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(sd => sd.OriginalFileName)
            .HasMaxLength(200);

        builder.Property(sd => sd.ContentType)
            .HasMaxLength(100);

        builder.HasOne(sd => sd.Student)
            .WithMany(s => s.Documents)
            .HasForeignKey(sd => sd.StudentId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasQueryFilter(sd => !sd.IsDeleted);
    }
}
