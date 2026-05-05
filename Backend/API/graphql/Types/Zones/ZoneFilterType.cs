using Domain.Entities;
using HotChocolate.Data.Filters;

namespace API.graphql.Types.Zones
{
    public class ZoneFilterType : FilterInputType<Zone>
    {
        protected override void Configure(IFilterInputTypeDescriptor<Zone> descriptor)
        {
            descriptor.Ignore(x => x.Boundary);
        }
    }
}
