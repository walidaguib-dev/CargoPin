using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Config
{
    public class ClientsEntityConfiguration : IEntityTypeConfiguration<Client>
    {
        public void Configure(EntityTypeBuilder<Client> builder)
        {
            builder.Property(x => x.Name).IsRequired().HasMaxLength(200);
            builder.Property(x => x.Phone).HasMaxLength(20);
            builder.Property(x => x.Email).HasMaxLength(100);
            builder.Property(x => x.TaxId).HasMaxLength(50);
        }
    }
}
