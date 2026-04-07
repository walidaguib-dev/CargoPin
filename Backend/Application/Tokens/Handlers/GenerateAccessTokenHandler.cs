using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Tokens.Commands;
using Domain.Interfaces;
using Domain.Requests.Tokens;
using MediatR;

namespace Application.Tokens.Handlers
{
    public class GenerateAccessTokenHandler(ITokens _tokensService)
        : IRequestHandler<GenerateAccessTokenCommand, string?>
    {
        private readonly ITokens tokensService = _tokensService;

        public async Task<string?> Handle(
            GenerateAccessTokenCommand request,
            CancellationToken cancellationToken
        )
        {
            var result = await tokensService.GenerateAccessToken(
                new GenerateAccessTokenRequest
                {
                    UserId = request.TokenRequest.UserId,
                    Token = request.TokenRequest.RefreshTokenString,
                }
            );
            return result;
        }
    }
}
