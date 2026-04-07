using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Services
{
    public static class ConfigureApiDocumentation
    {
        public static void SetupDocumentation(this WebApplication web)
        {
            web.MapGet(
                    "/redoc",
                    () =>
                        Results.Content(
                            """
<!DOCTYPE html>
<html>
<head>
    <title>Tally API Docs</title>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet">
</head>
<body>
    <redoc spec-url='/openapi/v1.json'></redoc>
    <script src="https://cdn.jsdelivr.net/npm/redoc/bundles/redoc.standalone.js"></script>
</body>
</html>
""",
                            "text/html"
                        )
                )
                .AllowAnonymous();
        }
    }
}
