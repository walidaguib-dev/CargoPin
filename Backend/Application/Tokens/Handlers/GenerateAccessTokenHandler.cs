using Application.Tokens.Commands;
using Domain.Interfaces;
using Domain.Requests.Tokens;
using MediatR;

namespace Application.Tokens.Handlers
{
    public class GenerateAccessTokenHandler(ITokens _tokensService)
        : IRequestHandler<GenerateAccessTokenCommand, TokenPairDto?>
    {
        private readonly ITokens tokensService = _tokensService;

        public async Task<TokenPairDto?> Handle(
            GenerateAccessTokenCommand request,
            CancellationToken cancellationToken
        )
        {
            return await tokensService.GenerateAccessToken(
                new GenerateAccessTokenRequest
                {
                    UserId = request.TokenRequest.UserId,
                    Token = request.TokenRequest.RefreshTokenString,
                }
            );
        }
    }
}
