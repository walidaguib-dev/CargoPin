using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Scalar.AspNetCore;

namespace API.Services
{
    public static class ScalarUi
    {
        public static void ConfigureScalarUI(this WebApplication app)
        {
            app.MapScalarApiReference(
                "/docs",
                options =>
                {
                    options.Title = "CargoPin API";
                    options.DarkMode = true;
                    options.DefaultHttpClient = new(ScalarTarget.CSharp, ScalarClient.HttpClient);
                    app.MapScalarApiReference(options =>
                        options
                            .AddPreferredSecuritySchemes("Bearer")
                            .AddHttpAuthentication(
                                "Bearer",
                                auth =>
                                {
                                    auth.Token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
                                }
                            )
                    );
                }
            );
        }
    }
}
