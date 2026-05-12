namespace Application.MerchandiseAreaPositions.Dtos
{
    public class CreateMerchandiseAreaPositionDto
    {
        public int ShipmentId { get; set; }
        public int AreaId { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public int? FileUploadId { get; set; }
        public bool IsEmergencyPlacement { get; set; }
        public string? Notes { get; set; }
    }
}
