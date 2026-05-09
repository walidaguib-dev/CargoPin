using Application.Clients.Commands;
using FluentValidation;

namespace Application.Clients.Validators
{
    public class UpdateClientValidator : AbstractValidator<UpdateClientCommand>
    {
        public UpdateClientValidator()
        {
            RuleFor(x => x.Dto.Name)
                .NotEmpty().WithMessage("Client name is required.")
                .MaximumLength(200).WithMessage("Client name must not exceed 200 characters.");

            RuleFor(x => x.Dto.Email)
                .EmailAddress().WithMessage("Invalid email address.")
                .When(x => x.Dto.Email is not null);

            RuleFor(x => x.Dto.Phone)
                .MaximumLength(20).WithMessage("Phone must not exceed 20 characters.")
                .When(x => x.Dto.Phone is not null);
        }
    }
}
