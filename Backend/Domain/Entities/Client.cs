namespace Domain.Entities
{
    public class Client
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string? ContactPerson { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? TaxId { get; set; }

        public ICollection<Shipment> Shipments { get; set; } = [];
    }
}
