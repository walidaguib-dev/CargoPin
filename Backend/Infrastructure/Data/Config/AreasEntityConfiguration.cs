using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
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

            builder.Property(x => x.Boundary).HasColumnType("geometry(Polygon, 4326)").IsRequired();

            // Spatial index — required for ST_Contains performance
            builder.HasIndex(x => x.Boundary).HasMethod("GIST");

            builder.Property(x => x.Notes).HasMaxLength(500);

            builder.Property(x => x.IsActive).HasDefaultValue(true);

            // Zone relationship
            builder
                .HasOne(x => x.Zone)
                .WithMany(x => x.Areas)
                .HasForeignKey(x => x.ZoneId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
