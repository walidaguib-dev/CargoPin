using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Clients.Commands;
using Application.Clients.Dtos;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace API.Routes
{
    public static class ClientsEndpoints
    {
        public static void MapClientsEndpoints(this WebApplication app)
        {
            var group = app.MapGroup("/api/clients").WithTags("Clients");

            group
                .MapPost(
                    "create",
                    async ([FromBody] CreateClientDto dto, ISender sender) =>
                    {
                        var command = new CreateClientCommand(dto);
                        var result = await sender.Send(command);
                        return result;
                    }
                )
                .RequireAuthorization();

            group
                .MapDelete(
                    "delete/{id:int}",
                    async (int id, ISender sender) =>
                    {
                        var command = new DeleteClientCommand(id);
                        var result = await sender.Send(command);
                        return result is null ? Results.NotFound() : Results.NoContent();
                    }
                )
                .RequireAuthorization();

            group
                .MapPatch(
                    "update/{id:int}",
                    async (int id, ISender sender, [FromBody] UpdateClientDto dto) =>
                    {
                        var command = new UpdateClientCommand(id, dto);
                        var result = await sender.Send(command);
                        return result is null ? Results.NotFound() : Results.NoContent();
                    }
                )
                .RequireAuthorization();
        }
    }
}
