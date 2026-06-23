namespace Domain.GeoJson
{
    public class GeoJsonPoint
    {
        public string Type { get; set; } = "Point";
        public double[] Coordinates { get; set; } = [];
    }

    public class GeoJsonPolygon
    {
        public string Type { get; set; } = "Polygon";
        public double[][][] Coordinates { get; set; } = [];
    }
}
