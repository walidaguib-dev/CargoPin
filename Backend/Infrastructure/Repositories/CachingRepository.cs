using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain.Interfaces;
using ZiggyCreatures.Caching.Fusion;

namespace Infrastructure.Repositories
{
    public class CachingRepository(IFusionCache _cache) : ICaching
    {
        private readonly IFusionCache cache = _cache;

        public async Task RemoveCaching(string key)
        {
            await cache.RemoveAsync(key);
        }

        public async Task<T?> GetOrSetAsync<T>(
            string key,
            Func<CancellationToken, Task<T>> factory,
            TimeSpan? expiry = null,
            List<string> tags = null!
        )
        {
            var options = new FusionCacheEntryOptions
            {
                Duration = expiry ?? TimeSpan.FromMinutes(4),
                IsFailSafeEnabled = true,
            };

            return await cache.GetOrSetAsync<T>(
                key,
                (ctx, token) => factory(token),
                options,
                tags: tags,
                token: default
            );
        }

        public async Task RemoveByTagAsync(string tag)
        {
            await cache.RemoveByTagAsync(tag);
        }
    }
}
