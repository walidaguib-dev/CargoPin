using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Config
{
    public class MerchandiseAreaPositionsEntityConfiguration
        : IEntityTypeConfiguration<MerchandiseAreaPosition>
    {
        public void Configure(EntityTypeBuilder<MerchandiseAreaPosition> builder)
        {
            builder.Property(x => x.Location).HasColumnType("geometry(Point, 4326)").IsRequired();

            builder.HasIndex(x => x.Location).HasMethod("GIST");

            builder
                .HasOne(x => x.Area)
                .WithMany()
                .HasForeignKey(x => x.AreaId)
                .OnDelete(DeleteBehavior.Restrict);

            builder
                .HasOne(x => x.Shipment)
                .WithMany()
                .HasForeignKey(x => x.ShipmentId)
                .OnDelete(DeleteBehavior.Restrict);

            builder
                .HasOne(x => x.Tallyman)
                .WithMany()
                .HasForeignKey(x => x.TallymanId)
                .OnDelete(DeleteBehavior.Restrict);

            builder
                .HasOne(x => x.FileUploads)
                .WithMany()
                .HasForeignKey(x => x.FileUploadsId)
                .OnDelete(DeleteBehavior.SetNull);

            builder.Property(x => x.PlacedAt).IsRequired();
            builder.Property(x => x.IsActive).HasDefaultValue(true);
        }
    }
}
