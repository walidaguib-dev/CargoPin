using System.Security.Claims;
using Application.MerchandiseAreaPositions.Commands;
using Application.MerchandiseAreaPositions.Dtos;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace API.Routes
{
    public static class MerchandiseAreaPositionsEndpoints
    {
        public static void MapMerchandiseAreaPositionsEndpoints(this WebApplication app)
        {
            var group = app.MapGroup("/api/positions").WithTags("Positions");

            group
                .MapPost(
                    "create",
                    async (
                        [FromBody] CreateMerchandiseAreaPositionDto dto,
                        ISender sender,
                        HttpContext ctx
                    ) =>
                    {
                        var tallymanId = ctx.User.FindFirstValue(ClaimTypes.NameIdentifier)!;
                        var command = new CreateMerchandiseAreaPositionCommand(dto, tallymanId);
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
                        var command = new DeleteMerchandiseAreaPositionCommand(Id);
                        var result = await sender.Send(command);
                        return result == null ? Results.NotFound() : Results.NoContent();
                    }
                )
                .RequireAuthorization();

            group
                .MapPatch(
                    "update/{Id:int}",
                    async (int Id, [FromBody] UpdateMerchandiseAreaPositionDto dto, ISender sender) =>
                    {
                        var command = new UpdateMerchandiseAreaPositionCommand(Id, dto);
                        var result = await sender.Send(command);
                        return result == null ? Results.NotFound() : Results.NoContent();
                    }
                )
                .RequireAuthorization();
        }
    }
}
