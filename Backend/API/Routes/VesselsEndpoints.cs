using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Vessels.Commands;
using Application.Vessels.Dtos;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace API.Routes
{
    public static class VesselsEndpoints
    {
        public static void MapVesselsEndpoints(this WebApplication app)
        {
            var group = app.MapGroup("/api/Vessels").WithTags("Vessels");

            group
                .MapPost(
                    "create",
                    async ([FromBody] CreateVesselDto dto, ISender sender) =>
                    {
                        var command = new CreateVesselCommand(dto);
                        var result = await sender.Send(command);
                        return Results.Created();
                    }
                )
                .RequireAuthorization();

            group
                .MapDelete(
                    "delete/{name}",
                    async (string name, ISender sender) =>
                    {
                        var command = new DeleteVesselCommand(name);
                        var result = await sender.Send(command);
                        return result == null ? Results.NotFound() : Results.NoContent();
                    }
                )
                .RequireAuthorization();

            group
                .MapPatch(
                    "update/{name}",
                    async (string name, [FromBody] UpdateVesselDto dto, ISender sender) =>
                    {
                        var command = new UpdateVesselCommand(name, dto);
                        var result = await sender.Send(command);
                        return result == null ? Results.NotFound() : Results.NoContent();
                    }
                )
                .RequireAuthorization();
        }
    }
}
