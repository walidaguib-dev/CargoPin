using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain.Requests.Users
{
    public class SignInRequest
    {
        public string Username { get; set; } = null!;
        public string Password { get; set; } = null!;
    }
}
