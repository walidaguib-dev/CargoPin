using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Domain.Requests.Users
{
    public class CreateUserRequest
    {
        public string password { get; set; } = null!;
        public string Role { get; set; } = null!;
    }
}
