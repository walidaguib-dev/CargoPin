using Application.Shipments.Queries;
using Domain.Entities;
using MediatR;

namespace API.graphql.Queries
{
    [ExtendObjectType(OperationTypeNames.Query)]
    public class ShipmentsQuery
    {
        [UsePaging]
        [UseFiltering]
        [UseSorting]
        public async Task<IQueryable<Shipment>> GetShipments([Service] ISender sender)
        {
            return await sender.Send(new GetShipmentsQuery());
        }

        public async Task<Shipment?> GetShipment([Service] ISender sender, int Id)
        {
            return await sender.Send(new GetShipmentQuery(Id));
        }
    }
}
