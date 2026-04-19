using System;
using System.Collections.Generic;
using System.Text;
using Domain.Helpers;
using Domain.Interfaces;
using MediatR;

namespace Application.Common
{
    public class CacheInvalidationBehavior<TRequest, TResponse>(ICaching _cachingService)
        : IPipelineBehavior<TRequest, TResponse>
        where TRequest : notnull
    {
        private readonly ICaching cachingService = _cachingService;

        public async Task<TResponse> Handle(
            TRequest request,
            RequestHandlerDelegate<TResponse> next,
            CancellationToken cancellationToken
        )
        {
            // Run the actual handler
            var response = await next(cancellationToken);

            // If request declares cache keys, invalidate them
            if (request is IInvalidateCache invalidateRequest)
            {
                foreach (var key in invalidateRequest.CacheKeys)
                {
                    await cachingService.RemoveCaching(key);
                }

                foreach (var key in invalidateRequest.CacheTags)
                {
                    await cachingService.RemoveByTagAsync(key);
                }
            }

            return response;
        }
    }
}
