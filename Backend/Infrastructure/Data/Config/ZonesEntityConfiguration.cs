using Domain.Entities;
using Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Config
{
    public class ZonesEntityConfiguration : IEntityTypeConfiguration<Zone>
    {
        public void Configure(EntityTypeBuilder<Zone> builder)
        {
            builder.Property(x => x.Type).IsRequired().HasDefaultValue(ZoneType.Quay);

            builder
                .Property(x => x.Boundary)
                .HasColumnType("geometry(Polygon, 4326)")
                .IsRequired(false);

            builder.HasIndex(x => x.Boundary).HasMethod("GIST");

            builder
                .HasOne(x => x.DesignatedMerchandise)
                .WithMany()
                .HasForeignKey(x => x.DesignatedMerchandiseId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
