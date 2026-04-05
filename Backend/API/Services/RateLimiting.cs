using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.RateLimiting;
using System.Threading.Tasks;
using Microsoft.AspNetCore.RateLimiting;

namespace API.Services
{
    public static class RateLimiting
    {
        public static void ConfigureRateLimiting(this IServiceCollection services)
        {
            // Register Rate Limiting services here
            services.AddRateLimiter(options =>
            {
                options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

                // Sliding window limiter for login
                options.AddSlidingWindowLimiter(
                    "Auth",
                    opt =>
                    {
                        opt.PermitLimit = 5; // max 5 requests
                        opt.Window = TimeSpan.FromSeconds(30); // per 30 seconds
                        opt.SegmentsPerWindow = 3; // divides window into segments for smoother sliding
                        opt.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
                        opt.QueueLimit = 0; // no queuing
                    }
                );

                // Fixed window limiter for normal queries
                options.AddFixedWindowLimiter(
                    "Default",
                    opt =>
                    {
                        opt.PermitLimit = 2; // max 100 requests
                        opt.Window = TimeSpan.FromSeconds(10); // per minute
                        opt.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
                        opt.QueueLimit = 2; // allow 2 queued requests
                    }
                );
            });
        }
    }
}
