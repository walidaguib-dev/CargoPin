using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Profiles.Commands;
using Application.Profiles.Dtos;
using MediatR;

namespace API.Routes
{
    public static class ProfileEndpoints
    {
        public static void MapProfileEndpoints(this WebApplication app)
        {
            var group = app.MapGroup("/api/profiles").WithTags("Profiles");

            group
                .MapPost(
                    "create-profile",
                    async (CreateProfileDto dto, ISender sender) =>
                    {
                        var command = new CreateProfileCommand(dto);
                        var result = await sender.Send(command);
                        return Results.Created();
                    }
                )
                .RequireAuthorization();

            group.MapPatch(
                "update-profile/{userId}",
                async (string userId, UpdateProfileDto dto, ISender sender) =>
                {
                    var command = new UpdateProfileCommand(dto, userId);
                    var result = await sender.Send(command);
                    return result is null ? Results.NotFound() : Results.NoContent();
                }
            );
        }
    }
}
