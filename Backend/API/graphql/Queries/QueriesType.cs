using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.graphql.Queries;
using HotChocolate.Execution.Configuration;

namespace API.graphql.Queries
{
    public static class QueriesType
    {
        public static void AddQueryTypes(this IRequestExecutorBuilder request)
        {
            request.AddQueryType<Query>();
            request.AddTypeExtension<FileUploadsQuery>();
            request.AddTypeExtension<ProfileQueries>();
            request.AddTypeExtension<VesselsQuery>();
        }
    }
}
