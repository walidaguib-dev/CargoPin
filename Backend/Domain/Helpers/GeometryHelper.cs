using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using NetTopologySuite;
using NetTopologySuite.Geometries;

namespace Domain.Helpers
{
    public static class GeometryHelper
    {
        public static Polygon ToPolygon(List<BoundaryCoordinate> boundary)
        {
            if (boundary == null || boundary.Count < 3)
                throw new ArgumentException("Polygon must have at least 3 points.");

            var geometryFactory = NtsGeometryServices.Instance.CreateGeometryFactory(srid: 4326);

            var coordinates = boundary
                .Select(p => new Coordinate(p.Longitude, p.Latitude)) // ⚠️ X=Lon, Y=Lat
                .ToList();

            // Ensure polygon is closed
            if (!coordinates.First().Equals2D(coordinates.Last()))
            {
                coordinates.Add(coordinates.First());
            }

            var ring = new LinearRing([.. coordinates]);

            if (!ring.IsValid)
                throw new ArgumentException("Invalid polygon shape.");

            return new Polygon(ring);
        }
    }
}
