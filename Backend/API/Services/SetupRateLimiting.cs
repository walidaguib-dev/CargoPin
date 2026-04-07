using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;

namespace API.Services
{
    public static class SetupRateLimiting
    {
        public static IServiceCollection AddRateLimitingServices(this IServiceCollection services)
        {
            // Register Rate Limiting services here
            services.AddRateLimiter(options =>
            {
                
                options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

                // Sliding window limiter for login
                options.AddSlidingWindowLimiter("Auth", opt =>
                {
                    opt.PermitLimit = 5;                     // max 5 requests
                    opt.Window = TimeSpan.FromSeconds(30);   // per 30 seconds
                    opt.SegmentsPerWindow = 3;               // divides window into segments for smoother sliding
                    opt.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
                    opt.QueueLimit = 0;                      // no queuing
                });

                // Fixed window limiter for normal queries
                options.AddFixedWindowLimiter("Default", opt =>
                {
                    opt.PermitLimit = 2;                   // max 100 requests
                    opt.Window = TimeSpan.FromSeconds(10);    // per minute
                    opt.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
                    opt.QueueLimit = 2;                      // allow 2 queued requests
                });
            });

            return services;
        }
    }
}
