using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain.Requests.Emails
{
    public class EmailCreationRequest
    {
        public string UserId { get; set; } = string.Empty;
        public string To { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string HtmlBody { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string? Token { get; set; }
    }
}
