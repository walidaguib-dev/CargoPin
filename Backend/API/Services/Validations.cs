using Application.Users.Validators;
using FluentValidation;

namespace API.Services
{
    public static class Validations
    {
        public static void AddValidations(this IServiceCollection services)
        {
            // register user auth validations
            services.AddValidatorsFromAssemblyContaining<RegisterUserValidations>();
            // services.AddValidatorsFromAssembly(typeof(RefreshTokenRequestValidation).Assembly);
            // services.AddValidatorsFromAssembly(typeof(SignInValidations).Assembly);
            // services.AddValidatorsFromAssembly(typeof(PasswordResetValidations).Assembly);

            // services.AddValidatorsFromAssembly(typeof(SendEmailValidation).Assembly);
            // services.AddValidatorsFromAssembly(typeof(ForgetPasswordResetValidator).Assembly);

            // //register user profile validations
            // services.AddValidatorsFromAssembly(typeof(CreateUserProfileValidations).Assembly);
            // services.AddValidatorsFromAssembly(typeof(UpdateUserProfileValidations).Assembly);
            // // register ships validations
            // services.AddValidatorsFromAssembly(typeof(CreateShipValidation).Assembly);
            // services.AddValidatorsFromAssembly(typeof(UpdateShipValidation).Assembly);

            // // register Merchandise validations
            // services.AddValidatorsFromAssembly(typeof(CreateMerchandiseValidation).Assembly);
            // services.AddValidatorsFromAssembly(typeof(UpdateMerchandiseValidation).Assembly);

            // // register clients validations
            // services.AddValidatorsFromAssembly(typeof(CreateClientValidation).Assembly);
            // services.AddValidatorsFromAssembly(typeof(UpdateClientValidation).Assembly);
            // services.AddValidatorsFromAssembly(typeof(ClientsFilteringValidation).Assembly);

            // //register trucks validations
            // services.AddValidatorsFromAssembly(typeof(CreateTruckValidation).Assembly);
            // services.AddValidatorsFromAssembly(typeof(UpdateTruckValidation).Assembly);

            // // register tally sheets validations
            // services.AddValidatorsFromAssembly(typeof(CreateTallySheetDtoValidator).Assembly);
            // services.AddValidatorsFromAssembly(typeof(UpdatetallySheetValidation).Assembly);

            // // register pagination validationscls

            // services.AddValidatorsFromAssembly(typeof(PaginationParamsValidator).Assembly);
        }
    }
}
