using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;

namespace Infrastructure.Services
{
    public static class Auth
    {
        public static void ConfigureAuthentication(
            this IServiceCollection services,
            WebApplicationBuilder builder
        )
        {
            // Add authentication related services here
            services
                .AddAuthentication(options =>
                {
                    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                })
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters =
                        new Microsoft.IdentityModel.Tokens.TokenValidationParameters
                        {
                            ValidateIssuer = true,
                            ValidIssuer = builder.Configuration["JWT:Issuer"],
                            ValidateAudience = true,
                            ValidAudience = builder.Configuration["JWT:Audience"],
                            ValidateIssuerSigningKey = true,
                            IssuerSigningKey = new SymmetricSecurityKey(
                                System.Text.Encoding.UTF8.GetBytes(
                                    builder.Configuration["JWT:Key"]!
                                )
                            ),
                            ValidateLifetime = true,
                        };
                });
        }
    }
}
