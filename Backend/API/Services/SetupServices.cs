using Application.Common;
using Domain.Interfaces;
using Infrastructure.Repositories;
using MediatR;

namespace API.Services
{
    public static class SetupServices
    {
        public static IServiceCollection AddAPIServices(this IServiceCollection services)
        {
            // custom services
            services.AddScoped<IUsers, UsersRepository>();
            services.AddScoped<ITokens, TokensRepository>();
            services.AddScoped<IOutboxEmail, OutboxEmailRepository>();
            services.AddScoped<IFileUploads, FileUploadsRepository>();

            // pipelines services
            services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehaviour<,>));
            // services.AddTransient(
            //     typeof(IPipelineBehavior<,>),
            //     typeof(CacheInvalidationBehavior<,>)
            // );

            // Register API services here
            return services;
        }
    }
}
