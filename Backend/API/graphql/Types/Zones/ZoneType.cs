using Domain.Entities;
using Domain.Helpers;

namespace API.graphql.Types.Zones
{
    public class ZoneType : ObjectType<Zone>
    {
        protected override void Configure(IObjectTypeDescriptor<Zone> descriptor)
        {
            descriptor.Field(x => x.Boundary).Ignore();

            descriptor
                .Field("boundaryCoordinates")
                .Type<ListType<ObjectType<BoundaryCoordinate>>>()
                .Resolve(ctx =>
                {
                    var zone = ctx.Parent<Zone>();
                    if (zone.Boundary == null)
                        return null;
                    return zone
                        .Boundary.Coordinates.Select(c => new BoundaryCoordinate
                        {
                            Latitude = c.Y,
                            Longitude = c.X,
                        })
                        .ToList();
                });
        }
    }
}
