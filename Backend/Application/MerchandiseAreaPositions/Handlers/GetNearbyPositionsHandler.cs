using Application.MerchandiseAreaPositions.Dtos;
using Application.MerchandiseAreaPositions.Queries;
using Domain.Helpers;
using Domain.Interfaces;
using MediatR;

namespace Application.MerchandiseAreaPositions.Handlers
{
    public class GetNearbyPositionsHandler(IMerchandiseAreaPositions service)
        : IRequestHandler<GetNearbyPositionsQuery, List<NearbyPositionDto>>
    {
        public async Task<List<NearbyPositionDto>> Handle(
            GetNearbyPositionsQuery request,
            CancellationToken cancellationToken
        )
        {
            var point = GeometryHelper.ToPoint(request.Latitude, request.Longitude);

            // 1 degree of latitude/longitude is ~111,000 meters near the equator —
            // a rough but adequate approximation for a "nearby" radius this small.
            var radiusInDegrees = request.RadiusMeters / 111000.0;

            var positions = await service.GetNearbyPositionsAsync(point, radiusInDegrees);

            return positions.Select(p => p.MapToNearbyDto()).ToList();
        }
    }
}
