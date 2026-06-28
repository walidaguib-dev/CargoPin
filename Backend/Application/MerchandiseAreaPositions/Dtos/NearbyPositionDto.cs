namespace Application.MerchandiseAreaPositions.Dtos
{
    public class NearbyPositionDto
    {
        public int Id { get; set; }
        public string ClientName { get; set; } = null!;
        public string MerchandiseDescription { get; set; } = null!;
        public string VesselName { get; set; } = null!;
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public DateTime PlacedAt { get; set; }
        public string? Notes { get; set; }
        public bool IsEmergencyPlacement { get; set; }
        public string? AreaName { get; set; }
        public string? ZoneName { get; set; }
    }
}
