namespace Application.MerchandiseAreaPositions.Dtos
{
    public class CreatePositionResultDto
    {
        public int Id { get; set; }
        public int? AreaId { get; set; }
        public int? ZoneId { get; set; }
        public string? AreaName { get; set; }
        public string? ZoneName { get; set; }
        public bool IsEmergencyPlacement { get; set; }
    }
}
