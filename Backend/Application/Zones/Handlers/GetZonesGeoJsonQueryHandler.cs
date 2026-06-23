using Application.Zones.Queries;
using Domain.GeoJson;
using Domain.Interfaces;
using MediatR;

namespace Application.Zones.Handlers
{
    public class GetZonesGeoJsonQueryHandler(IZones zonesService)
        : IRequestHandler<GetZonesGeoJsonQuery, GeoJsonFeatureCollection>
    {
        private readonly IZones _zonesService = zonesService;

        public async Task<GeoJsonFeatureCollection> Handle(
            GetZonesGeoJsonQuery request,
            CancellationToken cancellationToken
        ) => await _zonesService.GetActiveZonesGeoJsonAsync();
    }
}
