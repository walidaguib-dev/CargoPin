using Domain.GeoJson;
using MediatR;

namespace Application.Areas.Queries
{
    public record GetAreasGeoJsonQuery : IRequest<GeoJsonFeatureCollection> { }
}
