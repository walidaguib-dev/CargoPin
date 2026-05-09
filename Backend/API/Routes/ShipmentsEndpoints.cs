using Application.Shipments.Commands;
using Application.Shipments.Dtos;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace API.Routes
{
    public static class ShipmentsEndpoints
    {
        public static void MapShipmentsEndpoints(this WebApplication app)
        {
            var group = app.MapGroup("/api/shipments").WithTags("Shipments");

            group
                .MapPost(
                    "create",
                    async ([FromBody] CreateShipmentDto dto, ISender sender) =>
                    {
                        var command = new CreateShipmentCommand(dto);
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
                        var command = new DeleteShipmentCommand(Id);
                        var result = await sender.Send(command);
                        return result == null ? Results.NotFound() : Results.NoContent();
                    }
                )
                .RequireAuthorization();

            group
                .MapPatch(
                    "update/{Id:int}",
                    async (int Id, [FromBody] UpdateShipmentDto dto, ISender sender) =>
                    {
                        var command = new UpdateShipmentCommand(Id, dto);
                        var result = await sender.Send(command);
                        return result == null ? Results.NotFound() : Results.NoContent();
                    }
                )
                .RequireAuthorization();
        }
    }
}
