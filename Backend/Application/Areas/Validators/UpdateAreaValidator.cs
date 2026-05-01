using Application.Areas.Commands;
using FluentValidation;

namespace Application.Areas.Validators
{
    public class UpdateAreaValidator : AbstractValidator<UpdateAreaCommand>
    {
        public UpdateAreaValidator()
        {
            RuleFor(x => x.Dto.Name)
                .NotEmpty().WithMessage("Area name is required.")
                .MaximumLength(100).WithMessage("Area name must not exceed 100 characters.");

            RuleFor(x => x.Dto.Code)
                .NotEmpty().WithMessage("Area code is required.")
                .MaximumLength(20).WithMessage("Code must not exceed 20 characters.");

            RuleFor(x => x.Dto.Status)
                .NotEmpty().WithMessage("Status is required.")
                .Must(s => new[] { "Available", "Occupied", "Blocked" }.Contains(s))
                .WithMessage("Status must be Available, Occupied, or Blocked.");

            RuleFor(x => x.Dto.ZoneId)
                .GreaterThan(0).WithMessage("A valid ZoneId is required.");

            RuleFor(x => x.Dto.Boundary)
                .Must(b => b == null || b.Count >= 3)
                .WithMessage("Boundary must have at least 3 points if provided.");

            RuleFor(x => x.Dto.Notes)
                .NotEmpty().WithMessage("Notes are invalid.")
                .When(x => x.Dto.Notes is not null);
        }
    }
}
