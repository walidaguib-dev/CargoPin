using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Config
{
    public class ZonesEntityConfiguration : IEntityTypeConfiguration<Zone>
    {
        public void Configure(EntityTypeBuilder<Zone> builder)
        {
            builder.Property(x => x.Type).HasConversion<string>().IsRequired();

            builder
                .Property(x => x.Boundary)
                .HasColumnType("geometry(Polygon, 4326)")
                .IsRequired(false);

            builder.HasIndex(x => x.Boundary).HasMethod("GIST");
        }
    }
}
