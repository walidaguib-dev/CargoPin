namespace Domain.Requests.Shipments
{
    public class UpdateShipmentRequest
    {
        public string[] BLNumbers { get; set; } = [];
        public DateTime ArrivalDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? Note { get; set; }
        public int ClientId { get; set; }
        public int VesselId { get; set; }
        public int MerchandiseId { get; set; }
    }
}
