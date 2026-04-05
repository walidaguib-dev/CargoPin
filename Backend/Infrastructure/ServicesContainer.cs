using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Infrastructure.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Infrastructure
{
    public static class ServicesContainer
    {
        public static void GetInfrastructureServices(
            this IServiceCollection services,
            WebApplicationBuilder builder,
            IConfiguration configuration
        )
        {
            services.ConfigureAuthentication(builder);
            services.ConfigureBackgroundJobs(builder);
            services.ConfigureDatabase(configuration);
            services.ConfigureRedisCaching(configuration);
            services.ConfigureFusionCache(configuration);
            services.ConfigureCloudinary(builder);
        }
    }
}
