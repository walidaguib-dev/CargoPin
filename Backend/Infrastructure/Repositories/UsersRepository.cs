using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Authentication;
using System.Text;
using System.Threading.Tasks;
using Domain.Entities;
using Domain.Helpers;
using Domain.Interfaces;
using Domain.Requests.Emails;
using Domain.Requests.Users;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories
{
    public class UsersRepository(
        UserManager<User> _userManager,
        SignInManager<User> _signInManager,
        IOutboxEmail _outboxEmailService
    ) : IUsers
    {
        private readonly UserManager<User> userManager = _userManager;
        private readonly SignInManager<User> signInManager = _signInManager;
        private readonly IOutboxEmail outboxEmailService = _outboxEmailService;

        public async Task<object?> ConfirmEmailAsync(string userId, string token)
        {
            var user = await userManager.FindByIdAsync(userId);
            if (user == null)
                return null;

            var decodedToken = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(token));

            var result = await userManager.ConfirmEmailAsync(user, decodedToken);
            if (!result.Succeeded)
                throw new Exception("Invalid or expired token");

            return "Done";
        }

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

            var confirmationToken = await userManager.GenerateEmailConfirmationTokenAsync(user);
            var encodedToken = WebEncoders.Base64UrlEncode(
                Encoding.UTF8.GetBytes(confirmationToken)
            );
            await outboxEmailService.CreateAndSendAsync(
                new EmailCreationRequest
                {
                    HtmlBody = EmailHtmlBuilder.HtmlBody(
                        Domain.Enums.EmailType.EmailConfirmation,
                        encodedToken,
                        user.Id
                    ),
                    Subject = "Email Confirmation",
                    To = user.Email!,
                    Type = "EmailConfirmation",
                    UserId = user.Id,
                    Token = encodedToken,
                }
            );

            return user;
        }

        public async Task<bool?> DeleteAll()
        {
            var affectedRows = await userManager.Users.ExecuteDeleteAsync();

            return affectedRows == 0 ? null : true;
        }

        public async Task<User?> ForgetPasswordReset(ForgetPasswordRequest request)
        {
            var user =
                await userManager.Users.FirstOrDefaultAsync(x => x.Email == request.Email)
                ?? throw new InvalidOperationException("User not found!");

            var result = await userManager.ResetPasswordAsync(
                user,
                request.Token,
                request.New_password
            );

            if (!result.Succeeded)
            {
                throw new Exception(string.Join(", ", result.Errors.Select(e => e.Description)));
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
