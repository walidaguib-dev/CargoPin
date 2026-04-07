using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Users.Commands;
using Application.Users.Dtos;
using MediatR;

namespace API.Routes
{
    public static class AuthEndpoints
    {
        public static void MapAuthEndpoints(this WebApplication app)
        {
            var group = app.MapGroup("/api/auth").WithTags("Authentication");

            group.MapPost(
                "/register",
                async (ISender sender, RegisterUserDto dto) =>
                {
                    var command = new RegisterUserCommand(dto);
                    var result = await sender.Send(command);
                    return Results.Created();
                }
            );

            group.MapPost(
                "/signin",
                async (ISender sender, SignInDto dto) =>
                {
                    var command = new SignInCommand(dto);
                    var result = await sender.Send(command);

                    return result is null ? Results.NotFound() : Results.Ok(result);
                }
            );
        }
    }
}
