using Domain.Helpers;

namespace Application.Areas.Dtos
{
    public class CreateAreaDto
    {
        public string Name { get; set; } = null!;
        public string Code { get; set; } = null!;
        public string Status { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public bool IsActive { get; set; } = true;
        public int ZoneId { get; set; }
        public List<BoundaryCoordinate> Boundary { get; set; } = [];
    }
}
