using Application.Areas.Commands;
using Application.Areas.Dtos;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace API.Routes
{
    public static class AreasEndpoints
    {
        public static void MapAreasEndpoints(this WebApplication app)
        {
            var group = app.MapGroup("/api/areas").WithTags("Areas");

            group
                .MapPost(
                    "create",
                    async ([FromBody] CreateAreaDto dto, ISender sender) =>
                    {
                        var command = new CreateAreaCommand(dto);
                        var result = await sender.Send(command);
                        return Results.Created();
                    }
                )
                .RequireAuthorization();

            group
                .MapDelete(
                    "delete/{Id:int}",
                    async (int Id, ISender sender) =>
                    {
                        var command = new DeleteAreaCommand(Id);
                        var result = await sender.Send(command);
                        return result == null ? Results.NotFound() : Results.NoContent();
                    }
                )
                .RequireAuthorization();

            group
                .MapPatch(
                    "update/{Id:int}",
                    async (int Id, [FromBody] UpdateAreaDto dto, ISender sender) =>
                    {
                        var command = new UpdateAreaCommand(Id, dto);
                        var result = await sender.Send(command);
                        return result == null ? Results.NotFound() : Results.NoContent();
                    }
                )
                .RequireAuthorization();
        }
    }
}
