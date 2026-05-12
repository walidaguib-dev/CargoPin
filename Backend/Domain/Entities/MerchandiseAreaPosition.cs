using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using NetTopologySuite.Geometries;

namespace Domain.Entities
{
    public class MerchandiseAreaPosition
    {
        public int Id { get; set; }
        public int AreaId { get; set; }
        public Area Area { get; set; } = null!;
        public Point Location { get; set; } = null!;
        public int ShipmentId { get; set; }
        public Shipment Shipment { get; set; } = null!;
        public string TallymanId { get; set; } = null!;
        public User Tallyman { get; set; } = null!;
        public DateTime PlacedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime? ClosedAt { get; set; }
        public int? FileUploadsId { get; set; }
        public FileUploads? FileUploads { get; set; }
        public bool IsEmergencyPlacement { get; set; }
        public string? Notes { get; set; }
    }
}
