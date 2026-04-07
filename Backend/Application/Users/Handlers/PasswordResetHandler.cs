using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Users.Commands;
using Domain.Entities;
using Domain.Interfaces;
using Domain.Requests.Users;
using MediatR;

namespace Application.Users.Handlers
{
    public class PasswordResetHandler(IUsers _usersService)
        : IRequestHandler<PasswordResetCommand, User?>
    {
        private readonly IUsers usersService = _usersService;

        public async Task<User?> Handle(
            PasswordResetCommand request,
            CancellationToken cancellationToken
        )
        {
            return await usersService.ResetPassword(
                new PasswordResetRequest
                {
                    UserId = request.Dto.UserId,
                    CurrentPassword = request.Dto.CurrentPassword,
                    NewPassword = request.Dto.NewPassword,
                }
            );
        }
    }
}
