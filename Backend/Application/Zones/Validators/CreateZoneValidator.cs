using Application.Zones.Commands;
using FluentValidation;

namespace Application.Zones.Validators
{
    public class CreateZoneValidator : AbstractValidator<CreateZoneCommand>
    {
        public CreateZoneValidator()
        {
            RuleFor(x => x.Dto.Name)
                .NotEmpty().WithMessage("Zone name is required.")
                .MaximumLength(100).WithMessage("Zone name must not exceed 100 characters.");

            RuleFor(x => x.Dto.Code)
                .NotEmpty().WithMessage("Zone code is required.")
                .MaximumLength(20).WithMessage("Code must not exceed 20 characters.");

            RuleFor(x => x.Dto.Type)
                .NotEmpty().WithMessage("Type is required.")
                .Must(s => new[] { "Hangar", "Quay" }.Contains(s))
                .WithMessage("Type must be Hangar or Quay.");

            RuleFor(x => x.Dto.Boundary)
                .NotEmpty().WithMessage("Boundary coordinates are required.")
                .Must(b => b != null && b.Count >= 3)
                .WithMessage("Boundary must have at least 3 points.");

            RuleFor(x => x.Dto.DesignatedMerchandiseId)
                .GreaterThan(0).WithMessage("DesignatedMerchandiseId is required for Hangar zones.")
                .When(x => x.Dto.Type == "Hangar");

            RuleFor(x => x.Dto.DesignatedMerchandiseId)
                .Null().WithMessage("Quay zones must not have a DesignatedMerchandiseId.")
                .When(x => x.Dto.Type == "Quay");

            RuleFor(x => x.Dto.Notes)
                .NotEmpty().WithMessage("Notes are invalid.")
                .When(x => x.Dto.Notes is not null);
        }
    }
}
