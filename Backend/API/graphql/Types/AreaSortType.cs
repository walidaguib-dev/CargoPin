using Domain.Entities;
using HotChocolate.Data.Sorting;

namespace API.graphql.Types
{
    public class AreaSortType : SortInputType<Area>
    {
        protected override void Configure(ISortInputTypeDescriptor<Area> descriptor)
        {
            descriptor.Ignore(x => x.Boundary);
        }
    }
}
