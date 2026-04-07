using CloudinaryDotNet;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Domain.Helpers;
using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.AspNetCore.Builder;

namespace Infrastructure.Services
{
    public static class AddCloudinary
    {
        // Cloudinary configuration and setup methods would go here
        public static IServiceCollection ConfigureCloudinary(this IServiceCollection services , WebApplicationBuilder builder)
        {
            // Implementation for configuring Cloudinary service
            services.Configure<CloudinarySettings>(
            builder.Configuration.GetSection("CloudinarySettings"));

            builder.Services.AddSingleton(provider =>
            {
                var config = provider.GetRequiredService<IOptions<CloudinarySettings>>().Value;
                var account = new Account(config.CloudName, config.ApiKey, config.ApiSecret);
                return new Cloudinary(account);
            });
            return services;
        }
    }
}
