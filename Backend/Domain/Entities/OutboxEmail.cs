using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain.Enums;

namespace Domain.Entities
{
    // Entities/OutboxEmail.cs
    public class OutboxEmail
    {
        public int Id { get; set; }
        public string To { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string HtmlBody { get; set; } = string.Empty;
        public string? Token { get; set; }
        public EmailType Type { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string UserId { get; set; } = null!;
        public User User { get; set; } = null!;
    }
}
