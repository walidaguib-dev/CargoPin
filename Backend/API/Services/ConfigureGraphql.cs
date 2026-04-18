using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.graphql.Queries;
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
                .AddProjections()
                .AddSorting()
                .AddFiltering()
                .AddPagingArguments()
                .AddQueryTypes();
        }
    }
}
