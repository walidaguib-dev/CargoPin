namespace Domain.GeoJson
{
    public class PositionGeoJsonProperties
    {
        public int Id { get; set; }
        public string ClientName { get; set; } = null!;
        public string MerchandiseDescription { get; set; } = null!;
        public string VesselName { get; set; } = null!;
        public string? AreaName { get; set; }
        public string? ZoneName { get; set; }
        public bool IsEmergencyPlacement { get; set; }
        public DateTime PlacedAt { get; set; }
        public string? Notes { get; set; }
    }
}
