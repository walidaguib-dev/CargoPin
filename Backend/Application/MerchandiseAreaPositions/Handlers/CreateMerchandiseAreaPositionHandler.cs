using Application.MerchandiseAreaPositions.Commands;
using Domain.Enums;
using Domain.Helpers;
using Domain.Interfaces;
using MediatR;

namespace Application.MerchandiseAreaPositions.Handlers
{
    public class CreateMerchandiseAreaPositionHandler(
        IMerchandiseAreaPositions positionsService,
        IShipments shipmentsService,
        ICaching cachingService
    ) : IRequestHandler<CreateMerchandiseAreaPositionCommand, int>
    {
        public async Task<int> Handle(
            CreateMerchandiseAreaPositionCommand request,
            CancellationToken cancellationToken
        )
        {
            var dto = request.Dto;

            var shipment =
                await shipmentsService.GetShipmentAsync(dto.ShipmentId)
                ?? throw new Exception($"Shipment {dto.ShipmentId} not found.");

            var point = GeometryHelper.ToPoint(dto.Latitude, dto.Longitude);

            var zone = await positionsService.FindContainingZoneAsync(point);

            int? zoneId = null;
            int? areaId = null;
            int? designatedMerchandiseId = null;

            if (zone is not null)
            {
                zoneId = zone.Id;

                if (zone.Type == ZoneType.Hangar)
                {
                    designatedMerchandiseId = zone.DesignatedMerchandiseId;
                }
                else
                {
                    var area = await positionsService.FindContainingAreaAsync(zone.Id, point);
                    if (area is not null)
                    {
                        areaId = area.Id;
                        designatedMerchandiseId = area.DesignatedMerchandiseId;
                    }
                }
            }

            var isEmergency =
                designatedMerchandiseId.HasValue
                && designatedMerchandiseId != shipment.MerchandiseId;

            var position = dto.MapToEntity(request.TallymanId, point, zoneId, areaId, isEmergency);

            await positionsService.CreateAsync(position);

            if (zoneId.HasValue)
                await cachingService.RemoveByTagAsync($"positions:zone:{zoneId}");
            if (areaId.HasValue)
                await cachingService.RemoveByTagAsync($"positions:area:{areaId}");
            await cachingService.RemoveByTagAsync($"positions:shipment:{dto.ShipmentId}");
            await cachingService.RemoveByTagAsync("positions:all");

            return position.Id;
        }
    }
}
