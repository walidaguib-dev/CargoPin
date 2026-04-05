using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Hangfire;
using Hangfire.PostgreSql;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Infrastructure.Services
{
    public static class BackgroundJobs
    {
        public static void ConfigureBackgroundJobs(
            this IServiceCollection services,
            WebApplicationBuilder builder
        )
        {
            var connectionString = builder.Configuration.GetConnectionString("Default");
            var StorageOptions = new PostgreSqlStorageOptions
            {
                PrepareSchemaIfNecessary = true,
                SchemaName = "hangfire",
            };
            services.AddHangfire(config =>
            {
                config
                    .UseSimpleAssemblyNameTypeSerializer()
                    .UseRecommendedSerializerSettings()
                    .UsePostgreSqlStorage(
                        options =>
                        {
                            options.UseNpgsqlConnection(connectionString);
                        },
                        StorageOptions
                    );
            });
            services.AddHangfireServer(x => x.SchedulePollingInterval = TimeSpan.FromMinutes(4));
        }
    }
}
