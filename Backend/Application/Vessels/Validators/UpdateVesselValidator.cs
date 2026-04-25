using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Vessels.Commands;
using FluentValidation;

namespace Application.Vessels.Validators
{
    public class UpdateVesselValidator : AbstractValidator<UpdateVesselCommand>
    {
        public UpdateVesselValidator()
        {
            RuleFor(x => x.Dto.Name)
                .NotEmpty()
                .WithMessage("Vessel name is required.")
                .MaximumLength(100)
                .WithMessage("Vessel name must not exceed 100 characters.");

            RuleFor(x => x.Dto.IMONumber)
                .Matches(@"^\d{7}$")
                .WithMessage("IMO number must be exactly 7 digits.")
                .When(x => !string.IsNullOrEmpty(x.Dto.IMONumber));

            RuleFor(x => x.Dto.Status)
                .NotEmpty()
                .WithMessage("Status is required.")
                .Must(s => new[] { "Expected", "Berthed", "Departed" }.Contains(s))
                .WithMessage("Status must be Expected, Berthed, or Departed.");

            RuleFor(x => x.Dto.DepartureDate)
                .GreaterThan(x => x.Dto.ArrivalDate)
                .WithMessage("Departure date must be after arrival date.")
                .When(x => x.Dto.ArrivalDate.HasValue && x.Dto.DepartureDate.HasValue);
        }
    }
}
