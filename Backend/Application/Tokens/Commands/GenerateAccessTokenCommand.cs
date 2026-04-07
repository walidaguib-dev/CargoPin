using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Tokens.Dtos;
using MediatR;

namespace Application.Tokens.Commands
{
    public record GenerateAccessTokenCommand(RefreshTokenRequest TokenRequest) : IRequest<string?>;
}
