using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Tokens.Dtos;
using Application.Users.Commands;
using Application.Users.Dtos;
using Domain.Interfaces;
using Domain.Requests.Tokens;
using Domain.Requests.Users;
using MediatR;

namespace Application.Users.Handlers
{
    public class SignInHandler(IUsers _usersService, ITokens _tokensService)
        : IRequestHandler<SignInCommand, LoginResponseDto?>
    {
        private readonly IUsers usersService = _usersService;
        private readonly ITokens tokensService = _tokensService;

        public async Task<LoginResponseDto?> Handle(
            SignInCommand request,
            CancellationToken cancellationToken
        )
        {
            var SignInResult = await usersService.SignIn(
                new SignInRequest
                {
                    Password = request.Dto.Password,
                    Username = request.Dto.Username,
                }
            );

            // here below the refresh & access tokens login

            var tokenResult = await tokensService.GenerateRefreshToken(SignInResult!);

            RefreshTokenRequest tokenRequest = new()
            {
                UserId = SignInResult!.Id,
                RefreshTokenString = tokenResult.Token,
            };

            var AccessToken = await tokensService.GenerateAccessToken(
                new GenerateAccessTokenRequest
                {
                    UserId = tokenRequest.UserId,
                    Token = tokenRequest.RefreshTokenString,
                }
            );

            return new LoginResponseDto
            {
                Access_Token = AccessToken!,
                Refresh_Token = tokenResult.Token,
            };
        }
    }
}
