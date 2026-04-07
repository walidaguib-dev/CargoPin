using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Authentication;
using System.Threading.Tasks;
using Domain.Entities;
using Domain.Interfaces;
using Domain.Requests.Users;
using Microsoft.AspNetCore.Identity;

namespace Infrastructure.Repositories
{
    public class UsersRepository(UserManager<User> _userManager, SignInManager<User> _signInManager)
        : IUsers
    {
        private readonly UserManager<User> userManager = _userManager;
        private readonly SignInManager<User> signInManager = _signInManager;

        public async Task<User> CreateUser(User user, CreateUserRequest userRequest)
        {
            var IsExists = await userManager.FindByNameAsync(user.UserName!);
            if (IsExists is not null)
                throw new InvalidDataException("User already exists!");
            var CreationResult = await userManager.CreateAsync(user, userRequest.password);

            if (!CreationResult.Succeeded)
                throw new Exception(
                    string.Join(", ", CreationResult.Errors.Select(e => e.Description))
                );

            var RolesResult = await userManager.AddToRoleAsync(user, userRequest.Role);

            if (!RolesResult.Succeeded)
            {
                throw new Exception(
                    string.Join(", ", RolesResult.Errors.Select(e => e.Description))
                );
            }

            return user;
        }

        public async Task<User?> ResetPassword(PasswordResetRequest resetRequest)
        {
            var user = await userManager.FindByIdAsync(resetRequest.UserId);
            if (user is null)
                return null;

            var resetResult = await userManager.ChangePasswordAsync(
                user,
                resetRequest.CurrentPassword,
                resetRequest.NewPassword
            );
            if (!resetResult.Succeeded)
            {
                throw new Exception(
                    string.Join(", ", resetResult.Errors.Select(e => e.Description))
                );
            }

            return user;
        }

        public async Task<User?> SignIn(SignInRequest signInRequest)
        {
            var user = await userManager.FindByNameAsync(signInRequest.Username);

            if (user is null)
                return null;

            var signInResult = await signInManager.CheckPasswordSignInAsync(
                user,
                signInRequest.Password,
                lockoutOnFailure: true
            );

            if (signInResult.IsLockedOut)
                throw new AuthenticationException("Account locked due to failed attempts.");
            if (signInResult.RequiresTwoFactor)
                throw new AuthenticationException("Two-factor authentication required.");
            return !signInResult.Succeeded
                ? throw new AuthenticationException("Invalid credentials")
                : user;
        }
    }
}
