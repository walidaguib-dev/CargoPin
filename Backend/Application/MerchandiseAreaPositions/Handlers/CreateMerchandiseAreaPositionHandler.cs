using Application.MerchandiseAreaPositions.Commands;
using Domain.Entities;
using Domain.Enums;
using Domain.Helpers;
using Domain.Interfaces;
using MediatR;

namespace Application.MerchandiseAreaPositions.Handlers
{
    public class CreateMerchandiseAreaPositionHandler(
        IMerchandiseAreaPositions positionsService,
        IShipments shipmentsService
    ) : IRequestHandler<CreateMerchandiseAreaPositionCommand, MerchandiseAreaPosition>
    {
        public async Task<MerchandiseAreaPosition> Handle(
            CreateMerchandiseAreaPositionCommand request,
            CancellationToken cancellationToken
        )
        {
            var shipment =
                await shipmentsService.GetShipmentAsync(request.Dto.ShipmentId)
                ?? throw new Exception($"Shipment {request.Dto.ShipmentId} not found.");

            var point = GeometryHelper.ToPoint(request.Dto.Latitude, request.Dto.Longitude);

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

            var position = request.Dto.MapToEntity(
                request.TallymanId,
                point,
                zoneId,
                areaId,
                isEmergency
            );

            return await positionsService.CreateAsync(position);
        }
    }
}
