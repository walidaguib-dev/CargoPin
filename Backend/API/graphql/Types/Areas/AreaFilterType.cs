using Domain.Entities;
using HotChocolate.Data.Filters;

namespace API.graphql.Types.Areas
{
    public class AreaFilterType : FilterInputType<Area>
    {
        protected override void Configure(IFilterInputTypeDescriptor<Area> descriptor)
        {
            descriptor.Ignore(x => x.Boundary);
        }
    }
}
