using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain.Entities;
using Domain.Requests.Users;

namespace Domain.Interfaces
{
    public interface IUsers
    {
        public Task<User> CreateUser(User user, CreateUserRequest userRequest);
        public Task<User?> SignIn(SignInRequest signInRequest);
        public Task<User?> ResetPassword(PasswordResetRequest resetRequest);
    }
}
