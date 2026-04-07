using Domain.Entities;
using Infrastructure.Data;
using Microsoft.AspNetCore.Identity;
using System;

namespace API.Services
{
    public static class SetupIdentity
    {
        public static IServiceCollection AddIdentityServices(this IServiceCollection services)
        {
            services.AddIdentity<User, IdentityRole>(options =>
            {
                options.Password.RequireDigit = true;
                options.Password.RequireLowercase = true;
                options.Password.RequiredLength = 12;
                options.User.RequireUniqueEmail = true;

                // Lockout settings
                options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15); // how long user stays locked
                options.Lockout.MaxFailedAccessAttempts = 5; // number of tries before lockout
                options.Lockout.AllowedForNewUsers = true; // apply lockout to new accounts


            })
                    .AddEntityFrameworkStores<ApplicationDbContext>()
                    .AddRoles<IdentityRole>()
                    .AddDefaultTokenProviders();
            // Register Identity services here
            return services;
        }
    }
}
