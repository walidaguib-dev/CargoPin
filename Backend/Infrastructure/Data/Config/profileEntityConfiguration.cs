using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Config
{
    public class profileEntityConfiguration : IEntityTypeConfiguration<Profile>
    {
        public void Configure(EntityTypeBuilder<Profile> builder)
        {
            builder.HasIndex(up => up.UserId).IsUnique();
            builder
                .HasOne(u => u.User)
                .WithOne(up => up.Profile)
                .HasForeignKey<Profile>(up => up.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            builder
                .HasOne(up => up.Upload)
                .WithOne(u => u.Profile)
                .HasForeignKey<Profile>(up => up.UploadId)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }
}
