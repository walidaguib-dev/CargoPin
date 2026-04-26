using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Merchandises.Commands;
using Application.Merchandises.Dtos;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace API.Routes
{
    public static class MerchandisesEndpoints
    {
        public static void MapMerchandisesEndpoints(this WebApplication app)
        {
            var group = app.MapGroup("/api/merchandises").WithTags("Merchandises");

            group
                .MapPost(
                    "create",
                    async ([FromBody] CreateMerchandiseDto dto, ISender sender) =>
                    {
                        var command = new CreateMerchandiseCommand(dto);
                        var result = await sender.Send(command);
                        return Results.Created();
                    }
                )
                .RequireAuthorization();

            group
                .MapPatch(
                    "update/{Id:int}",
                    async ([FromBody] UpdateMerchandiseDto dto, int Id, ISender sender) =>
                    {
                        var command = new UpdateMerchandiseCommand(Id, dto);
                        var result = await sender.Send(command);
                        return result is null ? Results.NotFound() : Results.NoContent();
                    }
                )
                .RequireAuthorization();
            group
                .MapDelete(
                    "delete/{Id:int}",
                    async (int Id, ISender sender) =>
                    {
                        var command = new DeleteMerchandiseCommand(Id);
                        var result = await sender.Send(command);
                        return result is null ? Results.NotFound() : Results.NoContent();
                    }
                )
                .RequireAuthorization();
        }
    }
}
