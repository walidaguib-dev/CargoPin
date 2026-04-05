using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Services;

namespace API
{
    public static class ServicesContainer
    {
        public static void GetApiServices(
            this IServiceCollection services,
            IConfiguration configuration
        )
        {
            services.ConfigureIdentity();
            services.ConfigureResponseCompression();
            services.ConfigureRateLimiting();
            services.ConfigureLogging(configuration);
        }
    }
}
