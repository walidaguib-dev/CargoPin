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
        public Task<object?> ConfirmEmailAsync(string userId, string token);
        public Task<User?> ForgetPasswordReset(ForgetPasswordRequest request);

        public Task<User> FindOrCreateOAuthUserAsync(string email, string name);

        //for testing
        public Task<bool?> DeleteAll();
    }
}
