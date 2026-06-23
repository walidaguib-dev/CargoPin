namespace Domain.GeoJson
{
    public class AreaGeoJsonProperties
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string Code { get; set; } = null!;
        public string Status { get; set; } = null!;
        public string ZoneName { get; set; } = null!;
        public int ZoneId { get; set; }
    }
}
