using Application.Users.Commands;
using Application.Users.Dtos;
using Domain.Interfaces;
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

            var refreshToken = await tokensService.GenerateRefreshToken(SignInResult!);
            var accessToken = await tokensService.GenerateToken(SignInResult!);

            return new LoginResponseDto
            {
                Access_Token = accessToken,
                Refresh_Token = refreshToken.Token,
            };
        }
    }
}
