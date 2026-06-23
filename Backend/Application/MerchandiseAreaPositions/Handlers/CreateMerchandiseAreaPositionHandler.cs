using Application.MerchandiseAreaPositions.Commands;
using Application.MerchandiseAreaPositions.Dtos;
using Domain.Helpers;
using Domain.Interfaces;
using Domain.Requests.MerchandiseAreaPositions;
using MediatR;

namespace Application.MerchandiseAreaPositions.Handlers
{
    public class CreateMerchandiseAreaPositionHandler(
        IMerchandiseAreaPositions positionsService,
        IShipments shipmentsService,
        IPositionsNotifier notifier
    ) : IRequestHandler<CreateMerchandiseAreaPositionCommand, CreatePositionResultDto>
    {
        public async Task<CreatePositionResultDto> Handle(
            CreateMerchandiseAreaPositionCommand request,
            CancellationToken cancellationToken
        )
        {
            var dto = request.Dto;

            var shipment =
                await shipmentsService.GetShipmentAsync(dto.ShipmentId)
                ?? throw new Exception($"Shipment {dto.ShipmentId} not found.");

            var point = GeometryHelper.ToPoint(dto.Latitude, dto.Longitude);

            var area = await positionsService.FindContainingAreaAsync(point);
            var zone =
                area is not null
                    ? area.Zone
                    : await positionsService.FindContainingZoneAsync(point);

            var isEmergencyPlacement = area is null && zone is null;

            var position = dto.MapToEntity(
                request.TallymanId,
                point,
                area?.Id,
                zone?.Id,
                isEmergencyPlacement
            );
            position = await positionsService.CreateAsync(position);

            await notifier.NotifyPositionCreatedAsync(
                new PositionCreatedNotification
                {
                    PositionId = position.Id,
                    ShipmentId = position.ShipmentId,
                    ClientName = shipment.Client.Name,
                    MerchandiseDescription = shipment.Merchandise.Description,
                    VesselName = shipment.Vessel.Name,
                    Latitude = position.Location.Y,
                    Longitude = position.Location.X,
                    AreaName = area?.Name,
                    ZoneName = zone?.Name,
                    IsEmergencyPlacement = position.IsEmergencyPlacement,
                    PlacedAt = position.PlacedAt,
                }
            );

            return new CreatePositionResultDto
            {
                Id = position.Id,
                AreaId = position.AreaId,
                ZoneId = position.ZoneId,
                AreaName = area?.Name,
                ZoneName = zone?.Name,
                IsEmergencyPlacement = position.IsEmergencyPlacement,
            };
        }
    }
}
