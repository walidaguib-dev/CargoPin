using Domain.Entities;
using HotChocolate.Data.Sorting;

namespace API.graphql.Types.Zones
{
    public class ZoneSortType : SortInputType<Zone>
    {
        protected override void Configure(ISortInputTypeDescriptor<Zone> descriptor)
        {
            descriptor.Ignore(x => x.Boundary);
        }
    }
}
