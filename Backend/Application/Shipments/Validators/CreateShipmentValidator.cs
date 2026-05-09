using Application.Shipments.Commands;
using FluentValidation;

namespace Application.Shipments.Validators
{
    public class CreateShipmentValidator : AbstractValidator<CreateShipmentCommand>
    {
        public CreateShipmentValidator()
        {
            RuleFor(x => x.Dto.BLNumbers)
                .NotEmpty().WithMessage("At least one BL number is required.")
                .Must(bls => bls.All(bl => !string.IsNullOrWhiteSpace(bl)))
                .WithMessage("BL numbers cannot be empty strings.");

            RuleFor(x => x.Dto.ArrivalDate)
                .NotEmpty().WithMessage("Arrival date is required.")
                .LessThanOrEqualTo(DateTime.UtcNow.AddDays(60))
                .WithMessage("Arrival date cannot be more than 60 days in the future.");

            RuleFor(x => x.Dto.Status)
                .NotEmpty().WithMessage("Status is required.")
                .Must(s => new[] { "Awaiting", "Stored", "PartiallyStored", "Released" }.Contains(s))
                .WithMessage("Status must be Awaiting, Stored, PartiallyStored, or Released.");

            RuleFor(x => x.Dto.ClientId).GreaterThan(0).WithMessage("A valid ClientId is required.");
            RuleFor(x => x.Dto.VesselId).GreaterThan(0).WithMessage("A valid VesselId is required.");
            RuleFor(x => x.Dto.MerchandiseId).GreaterThan(0).WithMessage("A valid MerchandiseId is required.");
        }
    }
}
