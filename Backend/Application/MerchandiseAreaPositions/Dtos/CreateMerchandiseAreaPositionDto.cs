namespace Application.MerchandiseAreaPositions.Dtos
{
    public class CreateMerchandiseAreaPositionDto
    {
        public int ShipmentId { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public string? Notes { get; set; }
    }
}
