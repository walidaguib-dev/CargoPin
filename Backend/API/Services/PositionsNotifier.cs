using API.Hubs;
using Domain.Interfaces;
using Domain.Requests.MerchandiseAreaPositions;
using Microsoft.AspNetCore.SignalR;

namespace API.Services
{
    public class PositionsNotifier(IHubContext<PositionsHub> hubContext) : IPositionsNotifier
    {
        private readonly IHubContext<PositionsHub> _hubContext = hubContext;

        public async Task NotifyPositionCreatedAsync(PositionCreatedNotification notification) =>
            await _hubContext.Clients.All.SendAsync("PositionCreated", notification);

        public async Task NotifyPositionReleasedAsync(PositionReleasedNotification notification) =>
            await _hubContext.Clients.All.SendAsync("PositionReleased", notification);
    }
}
