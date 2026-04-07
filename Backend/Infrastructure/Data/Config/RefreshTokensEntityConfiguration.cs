using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Config
{
    public class RefreshTokensEntityConfiguration : IEntityTypeConfiguration<RefreshToken>
    {
        public void Configure(EntityTypeBuilder<RefreshToken> builder)
        {
            builder.HasIndex(x => x.UserId).IsUnique();
            builder
                .HasOne(rt => rt.User)
                .WithOne(u => u.refreshTokens)
                .HasForeignKey<RefreshToken>(rt => rt.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            // Composite index for fast lookups
            builder
                .HasIndex(rt => new { rt.UserId, rt.Token })
                .HasDatabaseName("IX_RefreshTokens_UserId_Token");
            builder.HasIndex(rt => rt.ExpiresAt);

            builder.HasQueryFilter(rt => rt.ExpiresAt > DateTime.UtcNow);
        }
    }
}
