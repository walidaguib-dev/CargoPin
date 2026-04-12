using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Users.Queries;
using Domain.Interfaces;
using MediatR;

namespace Application.Users.Handlers
{
    public class ConfirmEmailHandler(IUsers _usersService)
        : IRequestHandler<ConfirmEmailQuery, object?>
    {
        private readonly IUsers usersService = _usersService;

        public async Task<object?> Handle(
            ConfirmEmailQuery request,
            CancellationToken cancellationToken
        )
        {
            return await usersService.ConfirmEmailAsync(request.userId, request.token);
        }
    }
}
