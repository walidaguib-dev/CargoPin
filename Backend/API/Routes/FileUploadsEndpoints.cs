using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.FileUploads.Commands;
using Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace API.Routes
{
    public static class FileUploadsEndpoints
    {
        public static void MapFileUploadsEndpoints(this WebApplication app)
        {
            var group = app.MapGroup("/api/uploads").WithTags("File Uploads");

            group
                .MapPost(
                    "upload-file/{userId}",
                    async ([FromForm] IFormFile formFile, string userId, ISender sender) =>
                    {
                        var command = new UploadFileCommand(formFile, userId);
                        var result = await sender.Send(command);
                        return result is null ? Results.NotFound() : Results.Ok();
                    }
                )
                .RequireAuthorization()
                .DisableAntiforgery();

            group
                .MapDelete(
                    "delete-file/{publicId}",
                    async (string publicId, ISender sender) =>
                    {
                        var command = new DeleteFileCommand(publicId);
                        var result = await sender.Send(command);
                        return result is null ? Results.NotFound() : Results.NoContent();
                    }
                )
                .RequireAuthorization()
                .DisableAntiforgery();

            group
                .MapPatch(
                    "update-file/{userId}/{publicId}",
                    async (
                        string publicId,
                        string userId,
                        ISender sender,
                        [FromForm] IFormFile formFile
                    ) =>
                    {
                        var command = new UpdateFileCommand(userId, formFile, publicId);
                        var result = await sender.Send(command);
                        return result is null ? Results.NotFound() : Results.NoContent();
                    }
                )
                .RequireAuthorization()
                .DisableAntiforgery();
        }
    }
}
