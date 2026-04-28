using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Clients.Commands;
using FluentValidation;

namespace Application.Clients.Validators
{
    public class UpdateClientValidator : AbstractValidator<UpdateClientCommand>
    {
        public UpdateClientValidator()
        {
            RuleFor(x => x.Dto.Name)
                .NotEmpty()
                .WithMessage("Client name is required.")
                .MaximumLength(200)
                .WithMessage("Client name must not exceed 200 characters.");

            RuleFor(x => x.Dto.BLNumbers)
                .NotEmpty()
                .WithMessage("At least one BL number is required.")
                .Must(bls => bls.All(bl => !string.IsNullOrWhiteSpace(bl)))
                .WithMessage("BL numbers cannot be empty strings.");

            RuleFor(x => x.Dto.ArrivalDate)
                .NotEmpty()
                .WithMessage("Arrival date is required.")
                .LessThanOrEqualTo(DateTime.UtcNow.AddDays(60))
                .WithMessage("Arrival date cannot be more than 60 days in the future.");

            RuleFor(x => x.Dto.Status)
                .NotEmpty()
                .WithMessage("Status is required.")
                .Must(s =>
                    new[] { "Awaiting", "Stored", "PartiallyStored", "Released" }.Contains(s)
                )
                .WithMessage("Invalid status value.");

            RuleFor(x => x.Dto.VesselId).NotEmpty().WithMessage("Vessel is required.");

            RuleFor(x => x.Dto.MerchandiseId).NotEmpty().WithMessage("Merchandise is required.");
        }
    }
}
