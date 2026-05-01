using System;
using System.Collections.Generic;
using System.Text;
using Infrastructure.Data;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using NetTopologySuite;

namespace Infrastructure.Services
{
    public static class DatabaseExtensions
    {
        public static void AddDatabase(
            this IServiceCollection services,
            IConfiguration configuration
        )
        {
            var connectionString = configuration.GetConnectionString("Default");
            services.AddDbContext<ApplicationDbContext>(options =>
            {
                options.UseNpgsql(
                    connectionString,
                    o =>
                    {
                        o.UseNetTopologySuite();
                    }
                );
            });
        }
    }
}
