using Domain.Requests.MerchandiseAreaPositions;

namespace Domain.Interfaces
{
    public interface IPositionsNotifier
    {
        Task NotifyPositionCreatedAsync(PositionCreatedNotification notification);
        Task NotifyPositionReleasedAsync(PositionReleasedNotification notification);
    }
}
