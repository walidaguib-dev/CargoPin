using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Resend;

namespace Infrastructure.Services
{
    public static class Emails
    {
        public static void ConfigureResend(
            this IServiceCollection services,
            IConfiguration configuration
        )
        {
            var smtp = configuration.GetSection("Smtp");

            services
                .AddFluentEmail(smtp["From"], smtp["FromName"] ?? smtp["From"])
                .AddSmtpSender(
                    smtp["Host"],
                    int.Parse(smtp["Port"]!),
                    smtp["Username"],
                    smtp["Password"]
                );
        }
    }
}
