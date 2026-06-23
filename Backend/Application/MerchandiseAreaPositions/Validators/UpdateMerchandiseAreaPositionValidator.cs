using Application.MerchandiseAreaPositions.Commands;
using Domain.Enums;
using FluentValidation;

namespace Application.MerchandiseAreaPositions.Validators
{
    public class UpdateMerchandiseAreaPositionValidator
        : AbstractValidator<UpdateMerchandiseAreaPositionCommand>
    {
        public UpdateMerchandiseAreaPositionValidator()
        {
            RuleFor(x => x.Id).GreaterThan(0).WithMessage("A valid Id is required.");

            RuleFor(x => x.Dto.Notes)
                .MaximumLength(500).WithMessage("Notes must not exceed 500 characters.")
                .When(x => x.Dto.Notes is not null);

            RuleFor(x => x.Dto.State)
                .Must(s => Enum.TryParse<PositionState>(s, true, out _))
                .WithMessage("State must be 'active' or 'released'.")
                .When(x => !string.IsNullOrWhiteSpace(x.Dto.State));
        }
    }
}
