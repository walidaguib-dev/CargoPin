using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CloudinaryDotNet;
using Domain.Helpers;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace Infrastructure.Services
{
    public static class MediaUploads
    {
        public static void ConfigureCloudinary(
            this IServiceCollection services,
            WebApplicationBuilder builder
        )
        {
            // Implementation for configuring Cloudinary service
            services.Configure<CloudinarySettings>(
                builder.Configuration.GetSection("CloudinarySettings")
            );

            builder.Services.AddSingleton(provider =>
            {
                var config = provider.GetRequiredService<IOptions<CloudinarySettings>>().Value;
                var account = new Account(config.CloudName, config.ApiKey, config.ApiSecret);
                return new Cloudinary(account);
            });
        }
    }
}
