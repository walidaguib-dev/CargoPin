namespace Domain.GeoJson
{
    public class GeoJsonFeatureCollection
    {
        public string Type { get; set; } = "FeatureCollection";
        public List<GeoJsonFeature> Features { get; set; } = [];
    }
}
