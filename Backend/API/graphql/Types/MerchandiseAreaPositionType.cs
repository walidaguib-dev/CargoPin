using Domain.Entities;
using HotChocolate.Data.Filters;
using HotChocolate.Data.Sorting;
using HotChocolate.Types;

namespace API.graphql.Types
{
    public class MerchandiseAreaPositionType : ObjectType<MerchandiseAreaPosition>
    {
        protected override void Configure(IObjectTypeDescriptor<MerchandiseAreaPosition> descriptor)
        {
            descriptor.Field(x => x.Location).Ignore();
            descriptor
                .Field("latitude")
                .Type<FloatType>()
                .Resolve(ctx => ctx.Parent<MerchandiseAreaPosition>().Location?.Y);
            descriptor
                .Field("longitude")
                .Type<FloatType>()
                .Resolve(ctx => ctx.Parent<MerchandiseAreaPosition>().Location?.X);
        }
    }

    public class MerchandiseAreaPositionFilterType : FilterInputType<MerchandiseAreaPosition>
    {
        protected override void Configure(
            IFilterInputTypeDescriptor<MerchandiseAreaPosition> descriptor
        )
        {
            descriptor.Ignore(x => x.Location);
            descriptor.Ignore(x => x.Tallyman);
        }
    }

    public class MerchandiseAreaPositionSortType : SortInputType<MerchandiseAreaPosition>
    {
        protected override void Configure(
            ISortInputTypeDescriptor<MerchandiseAreaPosition> descriptor
        )
        {
            descriptor.Ignore(x => x.Location);
            descriptor.Ignore(x => x.Tallyman);
        }
    }
}
