namespace Domain.Requests.Clients
{
    public class UpdateClientRequest
    {
        public string Name { get; set; } = null!;
        public string? ContactPerson { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? TaxId { get; set; }
    }
}
