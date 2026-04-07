using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Users.Commands;
using FluentValidation;

namespace Application.Users.Validators
{
    public class PasswordResetValidation : AbstractValidator<PasswordResetCommand>
    {
        public PasswordResetValidation()
        {
            RuleFor(x => x.Dto.UserId)
                .NotEmpty()
                .NotNull()
                .WithMessage("user id is required!")
                .WithName("User Id");
            RuleFor(x => x.Dto.CurrentPassword)
                .NotEmpty()
                .NotNull()
                .MinimumLength(12)
                .MaximumLength(20)
                .WithMessage("current password is required!")
                .WithName("Current password");
            RuleFor(x => x.Dto.NewPassword)
                .NotEmpty()
                .NotNull()
                .MinimumLength(12)
                .MaximumLength(20)
                .WithMessage("new password is required!")
                .WithName("New Password");
        }
    }
}
