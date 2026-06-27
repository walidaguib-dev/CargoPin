using API.Hubs;
using API.Routes.Extensions;
using API.Services;
using Application;
using FluentValidation;
using Hangfire;
using Infrastructure;
using Infrastructure.Data;
using Infrastructure.Data.Seeders;
using Infrastructure.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Scalar.AspNetCore;
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
                doc.Info.Title = "CargoPin System API";
                doc.Info.Description =
                    "Port operations API for managing Merchandises positions in Port";
                doc.Info.Version = "v1";
                return Task.CompletedTask;
            }
        );
    }
);
builder.Services.AddCors(options =>
{
    options.AddPolicy(
        name: "AllowAll",
        policy =>
        {
            policy
                .WithOrigins("http://localhost:3000", "https://cargo-pin.vercel.app")
                .AllowAnyMethod()
                .AllowAnyHeader()
                .AllowCredentials();
        }
    );
});
builder.Services.AddLoggingConfiguration(builder.Configuration);
builder.Services.GetApplicationServices();
builder.Services.AddAPIServices();
builder.Services.AddValidations();
builder.Services.ConfigureGraphQL();

// builder.Services.AddIdentityServices();
builder.Services.ConfigureCloudinary(builder);
builder.Services.ConfigureRedisServices(builder.Configuration);
builder.Services.AddDatabase(builder.Configuration);
builder.Services.ConfigureBackgroundJobs(builder);
builder.Services.AddAuthenticationServices(builder);
builder.Services.AddAuthorization();
builder.Services.AddRateLimitingServices();
builder.Services.AddFusionCache(builder.Configuration);
builder.Services.AddSignalR();
builder.Services.ConfigureResend(builder.Configuration);

builder.Host.UseSerilog();
var app = builder.Build();

// Configure the HTTP request pipeline.

app.MapOpenApi();
if (app.Environment.IsDevelopment())
{
    app.MapScalarApiReference(
        "/docs",
        options =>
        {
            options.Title = "CargoPin API";
            options.DarkMode = true;
            options.DefaultHttpClient = new(ScalarTarget.CSharp, ScalarClient.HttpClient);
            app.MapScalarApiReference(options =>
                options
                    .AddPreferredSecuritySchemes("Bearer")
                    .AddHttpAuthentication(
                        "Bearer",
                        auth =>
                        {
                            auth.Token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
                        }
                    )
            );
        }
    );
}

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

    await db.Database.MigrateAsync(); // applies any pending migrations

    if (app.Environment.IsDevelopment())
    {
        var seeder = new CargoDataSeeder(db);
        await seeder.SeedAsync();
    }
}

app.SetupDocumentation();

app.UseHttpsRedirection();

app.UseGlobalExceptionHandling(app.Environment);
app.UseRateLimiter();
app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();
app.UseSerilogRequestLogging();
app.GetApiEndpoints();
app.UseHangfireDashboard("/hangfire", new DashboardOptions { Authorization = [new JobsAuth()] });
app.MapGraphQL();
app.MapHub<PositionsHub>("/hubs/positions");
app.Run();
