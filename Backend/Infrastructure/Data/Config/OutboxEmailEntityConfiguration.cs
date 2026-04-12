using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Config
{
    public class OutboxEmailEntityConfiguration : IEntityTypeConfiguration<OutboxEmail>
    {
        public void Configure(EntityTypeBuilder<OutboxEmail> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.To).IsRequired().HasMaxLength(256);
            builder.Property(x => x.Subject).IsRequired().HasMaxLength(512);
            builder.Property(x => x.HtmlBody).IsRequired();
            builder.HasIndex(x => x.CreatedAt);

            builder.Property(p => p.Type).HasConversion<string>().IsRequired();
        }
    }
}
