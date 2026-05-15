using Application.Tokens.Dtos;
using Domain.Requests.Tokens;
using MediatR;

namespace Application.Tokens.Commands
{
    public record GenerateAccessTokenCommand(RefreshTokenRequest TokenRequest)
        : IRequest<Domain.Requests.Tokens.TokenPairDto?>;
}
