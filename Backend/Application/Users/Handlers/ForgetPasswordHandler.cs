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
    public class ForgetPasswordHandler(IUsers _usersService)
        : IRequestHandler<ForgetPasswordCommand, User?>
    {
        private readonly IUsers usersService = _usersService;

        public async Task<User?> Handle(
            ForgetPasswordCommand request,
            CancellationToken cancellationToken
        )
        {
            return await usersService.ForgetPasswordReset(
                new ForgetPasswordRequest
                {
                    Email = request.Dto.Email,
                    New_password = request.Dto.New_password,
                    Token = request.Dto.Token,
                }
            );
        }
    }
}
