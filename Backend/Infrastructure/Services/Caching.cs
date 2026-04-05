using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using Microsoft.Extensions.Caching.StackExchangeRedis;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using StackExchange.Redis;
using ZiggyCreatures.Caching.Fusion;
using ZiggyCreatures.Caching.Fusion.Serialization.SystemTextJson;

namespace Infrastructure.Services
{
    public static class Caching
    {
        public static void ConfigureRedisCaching(
            this IServiceCollection services,
            IConfiguration configuration
        )
        {
            services.AddStackExchangeRedisCache(options =>
            {
                options.Configuration = configuration.GetValue<string>("RedisConnectionString");
                options.InstanceName = "MyAppCache_";
            });
            services.AddSingleton<IConnectionMultiplexer>(
                ConnectionMultiplexer.Connect(configuration["RedisConnectionString"]!)
            );
        }

        public static void ConfigureFusionCache(
            this IServiceCollection services,
            IConfiguration configuration
        )
        {
            services
                .AddFusionCache()
                .WithDistributedCache(_ =>
                {
                    var connectionString = configuration.GetValue<string>("RedisConnectionString");
                    var options = new RedisCacheOptions { Configuration = connectionString };

                    return new RedisCache(options);
                })
                .WithSerializer(
                    new FusionCacheSystemTextJsonSerializer(
                        new System.Text.Json.JsonSerializerOptions
                        {
                            ReferenceHandler = ReferenceHandler.IgnoreCycles,
                        }
                    )
                );
        }
    }
}
