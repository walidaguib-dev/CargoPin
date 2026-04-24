using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;

namespace Domain.Entities
{
    public class User : IdentityUser
    {
        public RefreshToken refreshTokens { get; set; } = null!;
        public List<OutboxEmail> OutboxEmails { get; set; } = [];
        public Profile? Profile { get; set; }
    }
}
