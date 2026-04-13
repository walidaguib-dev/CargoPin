using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Users.Dtos;
using Domain.Entities;
using MediatR;

namespace Application.Users.Commands
{
    public record ForgetPasswordCommand(ForgetPasswordDto Dto) : IRequest<User?> { }
}
