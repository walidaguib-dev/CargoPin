using Domain.Entities;
using Domain.Helpers;

namespace API.graphql.Types.Areas
{
    public class AreaType : ObjectType<Area>
    {
        protected override void Configure(IObjectTypeDescriptor<Area> descriptor)
        {
            descriptor.Field(x => x.Boundary).Ignore();

            descriptor
                .Field("boundaryCoordinates")
                .Type<ListType<ObjectType<BoundaryCoordinate>>>()
                .Resolve(ctx =>
                {
                    var area = ctx.Parent<Area>();
                    if (area.Boundary == null)
                        return null;
                    return area
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
