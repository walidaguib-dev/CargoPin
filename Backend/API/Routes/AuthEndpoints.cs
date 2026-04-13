using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Users.Commands;
using Application.Users.Dtos;
using Application.Users.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using StackExchange.Redis;

namespace API.Routes
{
    public static class AuthEndpoints
    {
        public static void MapAuthEndpoints(this WebApplication app)
        {
            var group = app.MapGroup("/api/auth").WithTags("Auth");

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

            group
                .MapPost(
                    "/password-reset",
                    async (PasswordResetDto dto, ISender sender) =>
                    {
                        var command = new PasswordResetCommand(dto);
                        var result = await sender.Send(command);
                        return result is null ? Results.NotFound() : Results.StatusCode(200);
                    }
                )
                .RequireAuthorization();

            group.MapDelete(
                "All",
                async (ISender sender) =>
                {
                    var result = await sender.Send(new DeleteAllUsersCommand());
                    return result == null ? Results.Ok("No Users!") : Results.NoContent();
                }
            );

            group.MapGet(
                "confirm-email",
                async ([FromQuery] string userId, [FromQuery] string token, ISender sender) =>
                {
                    var query = new ConfirmEmailQuery(userId, token);
                    var result = await sender.Send(query);
                    return result is null
                        ? Results.BadRequest("user not found!")
                        : Results.Redirect("http://localhost:5005/");
                }
            );

            group.MapPost(
                "forget-password",
                async (ISender sender, [FromBody] ForgetPasswordDto dto) =>
                {
                    var command = new ForgetPasswordCommand(dto);
                    var result = await sender.Send(command);
                    return result == null ? Results.Ok("No Users!") : Results.NoContent();
                }
            );
        }
    }
}
