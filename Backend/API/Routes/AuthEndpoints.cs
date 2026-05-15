using System.Security.Claims;
using Application.Users.Commands;
using Application.Users.Dtos;
using Application.Users.Queries;
using Domain.Interfaces;
using Domain.Requests.Tokens;
using MediatR;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;

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

            group.MapGet(
                "/google/signin",
                (HttpContext ctx) =>
                {
                    var props = new AuthenticationProperties
                    {
                        // Must be DIFFERENT from CallbackPath in AddGoogle().
                        // Middleware owns CallbackPath; this is where it redirects after finishing.
                        RedirectUri = "/api/auth/google/tokens",
                    };
                    return Results.Challenge(props, ["Google"]);
                }
            );

            group.MapGet(
                "/google/tokens",
                async (HttpContext ctx, IUsers users, ITokens tokens) =>
                {
                    var authResult = await ctx.AuthenticateAsync(
                        CookieAuthenticationDefaults.AuthenticationScheme
                    );

                    if (!authResult.Succeeded || authResult.Principal is null)
                        return Results.Unauthorized();

                    var email = authResult.Principal.FindFirstValue(ClaimTypes.Email);
                    var name = authResult.Principal.FindFirstValue(ClaimTypes.Name);

                    if (string.IsNullOrEmpty(email))
                        return Results.BadRequest("No email returned from Google.");

                    var user = await users.FindOrCreateOAuthUserAsync(email, name ?? email);

                    var refreshToken = await tokens.GenerateRefreshToken(user);
                    var accessToken = await tokens.GenerateAccessToken(
                        new GenerateAccessTokenRequest
                        {
                            UserId = user.Id,
                            Token = refreshToken.Token,
                        }
                    );

                    await ctx.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);

                    return Results.Ok(
                        new TokenPairDto
                        {
                            Access_Token = accessToken!.Access_Token,
                            Refresh_Token = refreshToken.Token,
                        }
                    );
                }
            );
        }
    }
}
