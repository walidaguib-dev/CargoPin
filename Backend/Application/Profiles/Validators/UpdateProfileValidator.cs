using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Profiles.Commands;
using FluentValidation;

namespace Application.Profiles.Validators
{
    public class UpdateProfileValidator : AbstractValidator<UpdateProfileCommand>
    {
        public UpdateProfileValidator()
        {
            RuleFor(x => x.Dto.FirstName)
                .NotEmpty()
                .WithMessage("First name is required.")
                .MaximumLength(50)
                .WithMessage("First name cannot exceed 50 characters.")
                .When(x => x.Dto.FirstName != null)
                .WithName("First Name");
            RuleFor(x => x.Dto.LastName)
                .NotEmpty()
                .WithMessage("Last name is required.")
                .MaximumLength(50)
                .WithMessage("Last name cannot exceed 50 characters.")
                .When(x => x.Dto.LastName != null)
                .WithName("Last Name");
            RuleFor(x => x.Dto.Bio)
                .MaximumLength(500)
                .WithMessage("Bio cannot exceed 500 characters.")
                .When(x => x.Dto.Bio != null && x.Dto.Bio != string.Empty)
                .WithName("Bio");
        }
    }
}
