using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Serilog;

namespace API.Services
{
    public static class Logging
    {
        public static void ConfigureLogging(
            this IServiceCollection services,
            IConfiguration configuration
        )
        {
            Log.Logger = new LoggerConfiguration()
                .ReadFrom.Configuration(configuration)
                .CreateLogger();
        }
    }
}
