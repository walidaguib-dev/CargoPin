using Domain.GeoJson;
using MediatR;

namespace Application.MerchandiseAreaPositions.Queries
{
    public record GetMerchandiseAreaPositionsGeoJsonQuery : IRequest<GeoJsonFeatureCollection> { }
}
