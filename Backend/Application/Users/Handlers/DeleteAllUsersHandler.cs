using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Users.Commands;
using Domain.Interfaces;
using MediatR;

namespace Application.Users.Handlers
{
    public class DeleteAllUsersHandler(IUsers _usersService)
        : IRequestHandler<DeleteAllUsersCommand, bool?>
    {
        private readonly IUsers usersService = _usersService;

        public async Task<bool?> Handle(
            DeleteAllUsersCommand request,
            CancellationToken cancellationToken
        )
        {
            return await usersService.DeleteAll();
        }
    }
}
