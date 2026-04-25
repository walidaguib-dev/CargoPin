using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Config
{
    public class VesselEntityConfiguration : IEntityTypeConfiguration<Vessel>
    {
        public void Configure(EntityTypeBuilder<Vessel> builder)
        {
            builder.HasIndex(x => x.Name).IsUnique();
            builder.HasIndex(x => x.IMONumber).IsUnique();
            builder.Property(p => p.Status).HasConversion<string>().IsRequired();
        }
    }
}
