using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Tokens.Commands;
using FluentValidation;

namespace Application.Tokens.Validators
{
    public class RefreshTokenRequestValidation : AbstractValidator<GenerateAccessTokenCommand>
    {
        public RefreshTokenRequestValidation()
        {
            RuleFor(x => x.TokenRequest.UserId)
                .NotEmpty()
                .NotNull()
                .WithMessage("the user id is required!")
                .WithName("User Id");

            RuleFor(x => x.TokenRequest.RefreshTokenString)
                .NotEmpty()
                .NotNull()
                .WithMessage("the user id is required!")
                .WithName("Refresh token");
        }
    }
}
