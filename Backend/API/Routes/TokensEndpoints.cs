using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Tokens.Commands;
using Application.Tokens.Dtos;
using MediatR;

namespace API.Routes
{
    public static class TokensEndpoints
    {
        public static void MapTokensEndpoints(this WebApplication app)
        {
            var group = app.MapGroup("/api/tokens").WithTags("Tokens");

            group
                .MapPost(
                    "/generate",
                    async (ISender sender, RefreshTokenRequest request) =>
                    {
                        var command = new GenerateAccessTokenCommand(request);
                        var result = await sender.Send(command);
                        return result is null ? Results.NotFound() : Results.Ok(result);
                    }
                )
                .RequireAuthorization();
        }
    }
}
