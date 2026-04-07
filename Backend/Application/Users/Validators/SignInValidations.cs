using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Users.Commands;
using FluentValidation;

namespace Application.Users.Validators
{
    public class SignInValidations : AbstractValidator<SignInCommand>
    {
        public SignInValidations()
        {
            RuleFor(u => u.Dto.Username)
                .NotNull()
                .NotEmpty()
                .Length(8, 20)
                .WithMessage("username must have between 8 and 20 letters")
                .WithName("Username");
            RuleFor(u => u.Dto.Password)
                .NotNull()
                .NotEmpty()
                .MinimumLength(12)
                .WithMessage("password must have 12 letters")
                .WithName("Password");
        }
    }
}
