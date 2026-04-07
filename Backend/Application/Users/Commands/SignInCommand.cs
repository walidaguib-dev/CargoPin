using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Users.Dtos;
using MediatR;

namespace Application.Users.Commands
{
    public record SignInCommand(SignInDto Dto) : IRequest<LoginResponseDto?> { }
}
