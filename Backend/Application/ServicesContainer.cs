using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace Application
{
    public static class ServicesContainer
    {
        public static void GetApplicationServices(this IServiceCollection services)
        {
            services.AddMediatR(cfg =>
                cfg.RegisterServicesFromAssembly(typeof(ServicesContainer).Assembly)
            );
            services.AddValidatorsFromAssembly(typeof(ServicesContainer).Assembly);
        }
    }
}
