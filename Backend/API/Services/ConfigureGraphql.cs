using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.graphql.Queries;
using API.graphql.Types;
using API.graphql.Types.Areas;
using API.graphql.Types.Zones;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace API.Services
{
    public static class GraphQL
    {
        public static void ConfigureGraphQL(this IServiceCollection services)
        {
            services
                .AddGraphQLServer()
                .AddGraphQL()
                .ModifyCostOptions(options =>
                {
                    options.MaxFieldCost = 10000;
                })
                .AddProjections()
                .AddSorting()
                .AddFiltering()
                .AddPagingArguments()
                .AddType<AreaType>()
                .AddType<ZoneType>()
                .AddType<MerchandiseAreaPositionType>()
                .AddQueryTypes();
        }
    }
}
