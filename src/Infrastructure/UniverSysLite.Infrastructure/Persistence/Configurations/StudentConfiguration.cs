using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using UniverSysLite.Domain.Entities.Academic;

namespace UniverSysLite.Infrastructure.Persistence.Configurations;

public class StudentConfiguration : IEntityTypeConfiguration<Student>
{
    public void Configure(EntityTypeBuilder<Student> builder)
    {
        builder.ToTable("Students");

        builder.HasKey(s => s.Id);

        builder.HasIndex(s => s.StudentId).IsUnique();
        builder.HasIndex(s => s.Email);
        builder.HasIndex(s => s.Status);

        builder.Property(s => s.StudentId)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(s => s.FirstName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(s => s.MiddleName)
            .HasMaxLength(100);

        builder.Property(s => s.LastName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(s => s.Email)
            .IsRequired()
            .HasMaxLength(256);

        builder.Property(s => s.PersonalEmail)
            .HasMaxLength(256);

        builder.Property(s => s.Phone)
            .HasMaxLength(20);

        builder.Property(s => s.MobilePhone)
            .HasMaxLength(20);

        builder.Property(s => s.NationalId)
            .HasMaxLength(50);

        builder.Property(s => s.PassportNumber)
            .HasMaxLength(50);

        builder.Property(s => s.AddressLine1)
            .HasMaxLength(200);

        builder.Property(s => s.AddressLine2)
            .HasMaxLength(200);

        builder.Property(s => s.City)
            .HasMaxLength(100);

        builder.Property(s => s.State)
            .HasMaxLength(100);

        builder.Property(s => s.PostalCode)
            .HasMaxLength(20);

        builder.Property(s => s.Country)
            .HasMaxLength(100);

        builder.Property(s => s.CumulativeGpa)
            .HasPrecision(4, 2);

        builder.Property(s => s.AccountBalance)
            .HasPrecision(18, 2);

        builder.Property(s => s.EmergencyContactName)
            .HasMaxLength(200);

        builder.Property(s => s.EmergencyContactPhone)
            .HasMaxLength(20);

        builder.Property(s => s.EmergencyContactRelationship)
            .HasMaxLength(50);

        // Ignore computed property
        builder.Ignore(s => s.FullName);

        // Relationships - Use NoAction to avoid cascade path conflicts
        builder.HasOne(s => s.User)
            .WithMany()
            .HasForeignKey(s => s.UserId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasOne(s => s.Program)
            .WithMany(p => p.Students)
            .HasForeignKey(s => s.ProgramId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasOne(s => s.Department)
            .WithMany(d => d.Students)
            .HasForeignKey(s => s.DepartmentId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasOne(s => s.Advisor)
            .WithMany()
            .HasForeignKey(s => s.AdvisorId)
            .OnDelete(DeleteBehavior.NoAction);

        // Query filter for soft delete
        builder.HasQueryFilter(s => !s.IsDeleted);
    }
}
