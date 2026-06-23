using Application.MerchandiseAreaPositions.Queries;
using Domain.GeoJson;
using Domain.Interfaces;
using MediatR;

namespace Application.MerchandiseAreaPositions.Handlers
{
    public class GetMerchandiseAreaPositionsGeoJsonHandler(IMerchandiseAreaPositions service)
        : IRequestHandler<GetMerchandiseAreaPositionsGeoJsonQuery, GeoJsonFeatureCollection>
    {
        public async Task<GeoJsonFeatureCollection> Handle(
            GetMerchandiseAreaPositionsGeoJsonQuery request,
            CancellationToken cancellationToken
        ) => await service.GetActivePositionsGeoJsonAsync();
    }
}
