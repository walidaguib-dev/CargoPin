using Application.MerchandiseAreaPositions.Commands;
using FluentValidation;

namespace Application.MerchandiseAreaPositions.Validators
{
    public class CreateMerchandiseAreaPositionValidator
        : AbstractValidator<CreateMerchandiseAreaPositionCommand>
    {
        public CreateMerchandiseAreaPositionValidator()
        {
            RuleFor(x => x.Dto.ShipmentId)
                .GreaterThan(0).WithMessage("A valid ShipmentId is required.");

            RuleFor(x => x.Dto.Latitude)
                .InclusiveBetween(-90, 90).WithMessage("Latitude must be between -90 and 90.");

            RuleFor(x => x.Dto.Longitude)
                .InclusiveBetween(-180, 180).WithMessage("Longitude must be between -180 and 180.");

            RuleFor(x => x.Dto.Notes)
                .MaximumLength(1000).WithMessage("Notes must not exceed 1000 characters.")
                .When(x => x.Dto.Notes is not null);

            RuleFor(x => x.TallymanId).NotEmpty().WithMessage("TallymanId is required.");
        }
    }
}
