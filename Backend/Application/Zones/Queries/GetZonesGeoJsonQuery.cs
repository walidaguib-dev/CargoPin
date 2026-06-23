using Domain.GeoJson;
using MediatR;

namespace Application.Zones.Queries
{
    public record GetZonesGeoJsonQuery : IRequest<GeoJsonFeatureCollection> { }
}
