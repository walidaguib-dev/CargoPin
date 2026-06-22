using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Config
{
    public class ShipmentsEntityConfiguration : IEntityTypeConfiguration<Shipment>
    {
        public void Configure(EntityTypeBuilder<Shipment> builder)
        {
            builder.Property(x => x.BLNumbers).HasColumnType("text[]").IsRequired();
            builder.Property(x => x.Status).HasConversion<string>().IsRequired();
            builder.Property(x => x.ArrivalDate).IsRequired();

            builder
                .HasOne(x => x.Client)
                .WithMany(x => x.Shipments)
                .HasForeignKey(x => x.ClientId)
                .OnDelete(DeleteBehavior.Cascade);

            builder
                .HasOne(x => x.Vessel)
                .WithMany()
                .HasForeignKey(x => x.VesselId)
                .OnDelete(DeleteBehavior.Restrict);

            builder
                .HasOne(x => x.Merchandise)
                .WithMany()
                .HasForeignKey(x => x.MerchandiseId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
