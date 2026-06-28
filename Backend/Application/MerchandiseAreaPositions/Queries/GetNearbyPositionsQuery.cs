using Application.MerchandiseAreaPositions.Dtos;
using MediatR;

namespace Application.MerchandiseAreaPositions.Queries
{
    public record GetNearbyPositionsQuery(double Latitude, double Longitude, double RadiusMeters = 50)
        : IRequest<List<NearbyPositionDto>>;
}
