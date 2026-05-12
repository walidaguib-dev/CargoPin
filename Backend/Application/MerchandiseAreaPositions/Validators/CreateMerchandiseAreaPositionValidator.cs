using Application.MerchandiseAreaPositions.Commands;
using FluentValidation;

namespace Application.MerchandiseAreaPositions.Validators
{
    public class CreateMerchandiseAreaPositionValidator
        : AbstractValidator<CreateMerchandiseAreaPositionCommand>
    {
        public CreateMerchandiseAreaPositionValidator()
        {
            RuleFor(x => x.Dto.ShipmentId).GreaterThan(0).WithMessage("A valid ShipmentId is required.");
            RuleFor(x => x.Dto.AreaId).GreaterThan(0).WithMessage("A valid AreaId is required.");
            RuleFor(x => x.Dto.Latitude)
                .InclusiveBetween(-90, 90)
                .WithMessage("Latitude must be between -90 and 90.");
            RuleFor(x => x.Dto.Longitude)
                .InclusiveBetween(-180, 180)
                .WithMessage("Longitude must be between -180 and 180.");
            RuleFor(x => x.TallymanId).NotEmpty().WithMessage("TallymanId is required.");
        }
    }
}
