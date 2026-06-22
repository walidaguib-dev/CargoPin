using System;
using System.Collections.Generic;
using System.Text;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;

namespace Infrastructure.Services
{
    public static class Authentication
    {
        public static IServiceCollection AddAuthenticationServices(
            this IServiceCollection services,
            WebApplicationBuilder builder
        )
        {
            services
                .AddIdentity<User, IdentityRole>(options => // ← FIX: int-keyed role
                {
                    options.SignIn.RequireConfirmedAccount = false;
                    options.SignIn.RequireConfirmedEmail = false;
                    options.User.RequireUniqueEmail = true;
                    options.Password.RequireDigit = false;
                    options.Password.RequiredLength = 6;
                })
                .AddEntityFrameworkStores<ApplicationDbContext>()
                .AddDefaultTokenProviders();

            services
                .AddAuthentication(options =>
                {
                    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
                })
                // ─── EXISTING JWT BEARER ──────────────────────────────────────
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidIssuer = builder.Configuration["JWT:Issuer"],
                        ValidateAudience = true,
                        ValidAudience = builder.Configuration["JWT:Audience"],
                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey = new SymmetricSecurityKey(
                            Encoding.UTF8.GetBytes(builder.Configuration["JWT:Key"]!)
                        ),
                        ValidateLifetime = true,
                    };

                    options.Events = new JwtBearerEvents
                    {
                        OnMessageReceived = context =>
                        {
                            // Accept token from Authorization header (mobile) OR cookie (browser)
                            // The header is checked by default, so we only fall back to cookie
                            // if the header didn't provide one.
                            if (string.IsNullOrEmpty(context.Token))
                            {
                                var cookieToken = context.Request.Cookies["access_token"];
                                if (!string.IsNullOrEmpty(cookieToken))
                                    context.Token = cookieToken;
                            }

                            return Task.CompletedTask;
                        },
                    };
                });

            return services;
        }
    }
}
