namespace Domain.GeoJson
{
    public class GeoJsonFeature
    {
        public string Type { get; set; } = "Feature";
        public object Geometry { get; set; } = null!;
        public object Properties { get; set; } = null!;
    }
}
