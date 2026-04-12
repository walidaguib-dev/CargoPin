using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MediatR;

namespace Application.Users.Queries
{
    public record ConfirmEmailQuery(string userId, string token) : IRequest<object?> { }
}
