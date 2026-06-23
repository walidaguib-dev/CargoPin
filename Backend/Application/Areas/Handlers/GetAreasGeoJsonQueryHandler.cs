using Application.Areas.Queries;
using Domain.GeoJson;
using Domain.Interfaces;
using MediatR;

namespace Application.Areas.Handlers
{
    public class GetAreasGeoJsonQueryHandler(IAreas areasService)
        : IRequestHandler<GetAreasGeoJsonQuery, GeoJsonFeatureCollection>
    {
        private readonly IAreas _areasService = areasService;

        public async Task<GeoJsonFeatureCollection> Handle(
            GetAreasGeoJsonQuery request,
            CancellationToken cancellationToken
        ) => await _areasService.GetActiveAreasGeoJsonAsync();
    }
}
