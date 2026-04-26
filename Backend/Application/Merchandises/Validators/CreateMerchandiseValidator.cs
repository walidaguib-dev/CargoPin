using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Merchandises.Commands;
using FluentValidation;

namespace Application.Merchandises.Validators
{
    public class CreateMerchandiseValidator : AbstractValidator<CreateMerchandiseCommand>
    {
        public CreateMerchandiseValidator()
        {
            RuleFor(x => x.Dto.Description)
                .NotEmpty()
                .WithMessage("Description is required.")
                .MaximumLength(200)
                .WithMessage("Description must not exceed 200 characters.");

            RuleFor(x => x.Dto.CargoType)
                .NotEmpty()
                .WithMessage("Status is required.")
                .Must(s =>
                    new[]
                    {
                        "GeneralCargo",
                        "SteelCoils",
                        "Colis",
                        "Bulk",
                        "Machinery",
                        "Dangerous",
                    }.Contains(s)
                )
                .WithMessage(
                    "Status must be GeneralCargo, SteelCoils, Colis, Bulk, Machinery, or Dangerous"
                );

            RuleFor(x => x.Dto.Weight)
                .GreaterThan(0)
                .WithMessage("Weight must be greater than 0.")
                .When(x => x.Dto.Weight.HasValue);

            RuleFor(x => x.Dto.NumberOfHeat)
                .GreaterThan(0)
                .WithMessage("Number of heat must be greater than 0.")
                .When(x => x.Dto.NumberOfHeat.HasValue);
            RuleFor(x => x.Dto.Note)
                .NotNull()
                .NotEmpty()
                .WithMessage("note must be not null")
                .When(x => x.Dto.Note != null);
        }
    }
}
