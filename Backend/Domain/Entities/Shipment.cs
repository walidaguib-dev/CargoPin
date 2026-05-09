using Domain.Enums;

namespace Domain.Entities
{
    public class Shipment
    {
        public int Id { get; set; }
        public string[] BLNumbers { get; set; } = [];
        public DateTime ArrivalDate { get; set; }
        public ShipmentStatus Status { get; set; }
        public string? Note { get; set; }

        public int ClientId { get; set; }
        public Client Client { get; set; } = null!;

        public int VesselId { get; set; }
        public Vessel Vessel { get; set; } = null!;

        public int MerchandiseId { get; set; }
        public Merchandise Merchandise { get; set; } = null!;
    }
}
