using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Application.Tokens.Dtos
{
    public class RefreshTokenRequest
    {
        public string UserId { get; set; } = string.Empty;
        public string RefreshTokenString { get; set; } = string.Empty;
    }
}
