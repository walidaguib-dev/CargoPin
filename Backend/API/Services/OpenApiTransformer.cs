using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.OpenApi;
using Microsoft.OpenApi;

namespace API.Services
{
    public sealed class OpenApiTransformer(
        IAuthenticationSchemeProvider authenticationSchemeProvider
    ) : IOpenApiDocumentTransformer
    {
        public async Task TransformAsync(
            OpenApiDocument document,
            OpenApiDocumentTransformerContext context,
            CancellationToken cancellationToken
        )
        {
            var schemes = await authenticationSchemeProvider.GetAllSchemesAsync();

            if (!schemes.Any(s => s.Name == "Bearer"))
                return;

            document.Components ??= new OpenApiComponents();

            if (document.Components.SecuritySchemes == null)
                document.Components.SecuritySchemes =
                    new Dictionary<string, IOpenApiSecurityScheme>();

            var schemeId = "Bearer";

            document.Components.SecuritySchemes[schemeId] = new OpenApiSecurityScheme
            {
                Type = SecuritySchemeType.Http,
                Scheme = "bearer",
                BearerFormat = "JWT",
                In = ParameterLocation.Header,
                Description = "JWT Authorization",
            };

            document.Security ??= new List<OpenApiSecurityRequirement>();

            document.Security.Add(
                new OpenApiSecurityRequirement
                {
                    [new OpenApiSecuritySchemeReference(schemeId)] = new List<string>(),
                }
            );
        }
    }
}
