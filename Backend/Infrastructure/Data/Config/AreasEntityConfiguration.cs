using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Config
{
    public class AreasEntityConfiguration : IEntityTypeConfiguration<Area>
    {
        public void Configure(EntityTypeBuilder<Area> builder)
        {
            builder.HasKey(x => x.Id);

            builder.Property(x => x.Name).IsRequired().HasMaxLength(100);
            builder.Property(x => x.Code).IsRequired().HasMaxLength(20);
            builder.Property(x => x.Status).IsRequired().HasConversion<string>();
            builder.Property(x => x.Notes).HasMaxLength(500);
            builder.Property(x => x.IsActive).HasDefaultValue(true);

            builder.Property(x => x.Boundary).HasColumnType("geometry(Polygon, 4326)").IsRequired();

            builder.HasIndex(x => x.Boundary).HasMethod("GIST");

            builder
                .HasOne(x => x.Zone)
                .WithMany(x => x.Areas)
                .HasForeignKey(x => x.ZoneId)
                .OnDelete(DeleteBehavior.Restrict);

            builder
                .HasOne(x => x.DesignatedMerchandise)
                .WithMany()
                .HasForeignKey(x => x.DesignatedMerchandiseId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(x => new { x.ZoneId, x.DesignatedMerchandiseId });
        }
    }
}
