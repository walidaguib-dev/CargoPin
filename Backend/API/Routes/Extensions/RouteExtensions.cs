using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Routes.Extensions
{
    public static class RouteExtensions
    {
        public static void GetApiEndpoints(this WebApplication app)
        {
            app.MapAuthEndpoints();
            app.MapTokensEndpoints();
            app.MapMailEndpoints();
            app.MapFileUploadsEndpoints();
            app.MapProfileEndpoints();
            app.MapVesselsEndpoints();
            app.MapMerchandisesEndpoints();
            app.MapClientsEndpoints();
            app.MapZonesEndpoints();
            app.MapAreasEndpoints();
            app.MapShipmentsEndpoints();
        }
    }
}
