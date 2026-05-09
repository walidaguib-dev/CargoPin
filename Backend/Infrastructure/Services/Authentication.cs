using System;
using System.Collections.Generic;
using System.Text;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google; // ← NEW
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
                })
                // ─── NEW: COOKIE SCHEME (scratch space for Google OAuth dance) ──
                .AddCookie(
                    CookieAuthenticationDefaults.AuthenticationScheme,
                    options =>
                    {
                        // This cookie is ONLY used as temporary storage during the
                        // Google OAuth redirect flow. Real auth is JWT.
                        options.Cookie.Name = "cargopin.oauth";
                        options.Cookie.HttpOnly = true;
                        options.Cookie.SameSite = SameSiteMode.Lax;
                        options.ExpireTimeSpan = TimeSpan.FromMinutes(5); // OAuth dance is fast
                    }
                )
                // ─── NEW: GOOGLE PROVIDER ─────────────────────────────────────
                .AddGoogle(
                    GoogleDefaults.AuthenticationScheme,
                    options =>
                    {
                        options.ClientId = builder.Configuration["Google:ClientId"]!;
                        options.ClientSecret = builder.Configuration["Google:ClientSecret"]!;
                        options.CallbackPath = builder.Configuration["Google:CallbackPath"]!;

                        // Use the cookie scheme as temporary storage during the OAuth dance
                        options.SignInScheme = CookieAuthenticationDefaults.AuthenticationScheme;

                        options.SaveTokens = true;

                        // Fix "oauth state was missing or invalid" on HTTP (dev)
                        // The correlation cookie validates the CSRF state on Google's callback.
                        // Default is SameSite=None+Secure which breaks over plain HTTP.
                        options.CorrelationCookie.SameSite = SameSiteMode.Lax;
                        options.CorrelationCookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;

                        options.Scope.Add("email");
                        options.Scope.Add("profile");
                    }
                );

            return services;
        }
    }
}
