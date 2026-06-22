namespace Application.MerchandiseAreaPositions.Dtos
{
    public class UpdateMerchandiseAreaPositionDto
    {
        public int? FileUploadId { get; set; }
        public bool IsEmergencyPlacement { get; set; }
        public string PositionState { get; set; } = null!;
        public string? Notes { get; set; }
    }
}
