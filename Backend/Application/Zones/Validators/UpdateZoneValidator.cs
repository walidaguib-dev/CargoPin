using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Zones.Commands;
using FluentValidation;

namespace Application.Zones.Validators
{
    public class UpdateZoneValidator : AbstractValidator<UpdateZoneCommand>
    {
        public UpdateZoneValidator()
        {
            RuleFor(x => x.Dto.Name)
                .NotEmpty()
                .WithMessage("Zone name is required.")
                .MaximumLength(100)
                .WithMessage("Zone name must not exceed 100 characters.");

            RuleFor(x => x.Dto.Code)
                .NotEmpty()
                .WithMessage("Zone code is required.")
                .MaximumLength(20)
                .WithMessage("Code must not exceed 20 characters.");

            RuleFor(x => x.Dto.Type)
                .NotEmpty()
                .WithMessage("Type is required.")
                .Must(s => new[] { "Hangar", "OpenYard", "Mixed", "Restricted" }.Contains(s))
                .WithMessage("Type must be Hangar, OpenYard, Mixed , or Restricted.");
            RuleFor(x => x.Dto.Notes)
                .NotEmpty()
                .WithMessage("notes are invalid!")
                .When(x => x.Dto.Notes is not null);
            RuleFor(x => x.Dto.IsActive)
                .NotEmpty()
                .NotNull()
                .WithMessage("zone status is required!");
        }
    }
}
