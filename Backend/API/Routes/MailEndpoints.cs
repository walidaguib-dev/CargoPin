using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Emails.Commands;
using Application.Emails.Dtos;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace API.Routes
{
    public static class MailEndpoints
    {
        public static void MapMailEndpoints(this WebApplication app)
        {
            var group = app.MapGroup("/api/mail").WithTags("Emails");

            group.MapPost(
                "/send-email",
                async (ISender sender, [FromBody] EmailCreationDto dto) =>
                {
                    var command = new EmailCreationCommand(dto);
                    var result = await sender.Send(command);
                    return Results.Ok();
                }
            );
        }
    }
}
