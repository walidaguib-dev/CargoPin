using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Users.Commands;
using FluentValidation;

namespace Application.Users.Validators
{
    public class ForgetPasswordValidation : AbstractValidator<ForgetPasswordCommand>
    {
        public ForgetPasswordValidation()
        {
            RuleFor(x => x.Dto.Email)
                .NotEmpty()
                .WithMessage("Email is required.")
                .EmailAddress()
                .WithMessage("Invalid email format.");

            RuleFor(x => x.Dto.Token).NotEmpty().WithMessage("Token is required.");

            RuleFor(x => x.Dto.New_password)
                .NotEmpty()
                .WithMessage("Password is required.")
                .MinimumLength(8)
                .WithMessage("Password must be at least 8 characters.")
                .Matches("[A-Z]")
                .WithMessage("Password must contain at least one uppercase letter.")
                .Matches("[a-z]")
                .WithMessage("Password must contain at least one lowercase letter.")
                .Matches("[0-9]")
                .WithMessage("Password must contain at least one number.")
                .Matches("[^a-zA-Z0-9]")
                .WithMessage("Password must contain at least one special character.");
        }
    }
}
