using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Users.Commands;
using FluentValidation;

namespace Application.Users.Validators
{
    public class RegisterUserValidations : AbstractValidator<RegisterUserCommand>
    {
        public RegisterUserValidations()
        {
            RuleFor(u => u.Dto.Email)
                .EmailAddress()
                .NotEmpty()
                .NotNull()
                .WithMessage("please write a valid email")
                .WithName("Email");
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
            RuleForEach(x => x.Dto.Role)
                .NotEmpty()
                .NotNull()
                .WithMessage("Invalid role specified.")
                .WithName("Role");
        }
    }
}
