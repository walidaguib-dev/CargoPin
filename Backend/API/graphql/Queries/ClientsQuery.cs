using Application.Clients.Queries;
using Domain.Entities;
using MediatR;

namespace API.graphql.Queries
{
    [ExtendObjectType(OperationTypeNames.Query)]
    public class ClientsQuery
    {
        [UsePaging]
        [UseFiltering]
        [UseSorting]
        public async Task<IQueryable<Client>> GetClients([Service] ISender sender)
        {
            var query = new GetClientsQuery();
            var result = await sender.Send(query);
            return result;
        }

        public async Task<Client?> GetClient(int Id, [Service] ISender sender)
        {
            var query = new GetClientQuery(Id);
            var result = await sender.Send(query);
            return result;
        }
    }
}
