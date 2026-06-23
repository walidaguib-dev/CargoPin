using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Zones.Commands;
using Application.Zones.Dtos;
using Application.Zones.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace API.Routes
{
    public static class ZonesEndpoints
    {
        public static void MapZonesEndpoints(this WebApplication app)
        {
            var group = app.MapGroup("/api/zones").WithTags("Zones");

            group.MapGet(
                "geojson",
                async (ISender sender) =>
                {
                    var result = await sender.Send(new GetZonesGeoJsonQuery());
                    return Results.Ok(result);
                }
            );

            group
                .MapPost(
                    "create",
                    async ([FromBody] CreateZoneDto dto, ISender sender) =>
                    {
                        var command = new CreateZoneCommand(dto);
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
                        var command = new DeleteZoneCommand(Id);
                        var result = await sender.Send(command);
                        return result == null ? Results.NotFound() : Results.NoContent();
                    }
                )
                .RequireAuthorization();

            group
                .MapPatch(
                    "update/{Id:int}",
                    async (int Id, ISender sender, [FromBody] UpdateZoneDto dto) =>
                    {
                        var command = new UpdateZoneCommand(Id, dto);
                        var result = await sender.Send(command);
                        return result == null ? Results.NotFound() : Results.NoContent();
                    }
                )
                .RequireAuthorization();
        }
    }
}
