using System;
using System.Collections.Generic;
using System.Text;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Caching.StackExchangeRedis;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using NetTopologySuite.IO.Converters;
using ZiggyCreatures.Caching.Fusion;
using ZiggyCreatures.Caching.Fusion.Serialization.SystemTextJson;

namespace Infrastructure.Services
{
    public static class SetupCachingServices
    {
        public static IServiceCollection AddFusionCache(
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
                            Converters =
                            {
                                new GeoJsonConverterFactory(
                                    NetTopologySuite.NtsGeometryServices.Instance.CreateGeometryFactory(
                                        srid: 4326
                                    )
                                ),
                            },
                        }
                    )
                );

            return services;
        }
    }
}
