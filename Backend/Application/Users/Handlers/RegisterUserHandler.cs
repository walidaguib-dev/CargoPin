using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Users.Commands;
using Application.Users.Mappers;
using Domain.Entities;
using Domain.Interfaces;
using Domain.Requests.Users;
using MediatR;

namespace Application.Users.Handlers
{
    public class RegisterUserHandler(IUsers _usersService)
        : IRequestHandler<RegisterUserCommand, User>
    {
        private readonly IUsers usersService = _usersService;

        public async Task<User> Handle(
            RegisterUserCommand request,
            CancellationToken cancellationToken
        )
        {
            var user = request.Dto.MapToEntity();
            await usersService.CreateUser(
                user,
                new CreateUserRequest { password = request.Dto.Password, Role = request.Dto.Role }
            );

            return user;
        }
    }
}
