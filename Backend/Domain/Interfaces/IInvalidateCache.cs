using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain.Interfaces
{
    public interface IInvalidateCache
    {
        List<string> CacheKeys { get; }
        List<string> CacheTags { get; }
    }
}
