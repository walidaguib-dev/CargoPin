using API;
using API.Helpers;
using API.middlewares;
using API.Services;
using Application;
using Hangfire;
using Infrastructure;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi(
    "v1",
    options =>
    {
        options.AddDocumentTransformer<OpenApiTransformer>();
        options.AddDocumentTransformer(
            (doc, ctx, ct) =>
            {
                doc.Info.Title = "CargoPin System Api";
                doc.Info.Description = "CargoPin API for managing Merchandises locations";
                doc.Info.Version = "v1";
                return Task.CompletedTask;
            }
        );
    }
);

builder.Services.ConfigureCors();

builder.Services.GetInfrastructureServices(builder, builder.Configuration);
builder.Services.GetApplicationServices();
builder.Services.GetApiServices(builder.Configuration);
builder.Services.AddAuthorization();
builder.Services.AddSignalR();
builder.Host.UseSerilog();
var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.ConfigureScalarUI();
}

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

    await db.Database.MigrateAsync(); // applies any pending migrations
}

app.ConfigureApiDocumentation();
app.UseCors("AllowAll");
app.UseResponseCompression();
app.UseHttpsRedirection();
app.UseGlobalExceptionHandling(app.Environment);
app.UseAuthentication();
app.UseAuthorization();
app.UseSerilogRequestLogging();
app.UseHangfireDashboard("/hangfire", new DashboardOptions { Authorization = [new JobsAuth()] });
app.Run();
