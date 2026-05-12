using Application.MerchandiseAreaPositions.Commands;
using FluentValidation;

namespace Application.MerchandiseAreaPositions.Validators
{
    public class UpdateMerchandiseAreaPositionValidator
        : AbstractValidator<UpdateMerchandiseAreaPositionCommand>
    {
        public UpdateMerchandiseAreaPositionValidator()
        {
            RuleFor(x => x.Id).GreaterThan(0).WithMessage("A valid Id is required.");
        }
    }
}
