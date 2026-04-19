using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain.Interfaces
{
    public interface ICaching
    {
        public Task<T?> GetOrSetAsync<T>(
            string key,
            Func<CancellationToken, Task<T>> factory,
            TimeSpan? expiry = null,
            List<string> tags = null!
        );
        public Task RemoveCaching(string key);

        public Task RemoveByTagAsync(string tag);
    }
}
