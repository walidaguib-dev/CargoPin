namespace Domain.Requests.MerchandiseAreaPositions
{
    public class UpdateMerchandiseAreaPositionRequest
    {
        public int? FileUploadsId { get; set; }
        public bool IsEmergencyPlacement { get; set; }
        public string PositionState { get; set; } = null!;
        public string? Notes { get; set; }
    }
}
