using Domain.Enums;
using Domain.Templates;

namespace Domain.Helpers
{
    public class EmailHtmlBuilder
    {
        public static string HtmlBody(EmailType emailType, string? token, string? userId)
        {
            return emailType switch
            {
                EmailType.EmailConfirmation => EmailConfirmation(token!, userId!),
                EmailType.PasswordReset => PasswordReset(token!),
                EmailType.Welcome => Welcome(),
                EmailType.Notification => Notification(),
                _ => string.Empty,
            };
        }

        // ─────────────────────────────────────────────────────────────
        // Email Confirmation
        // ─────────────────────────────────────────────────────────────
        private static string EmailConfirmation(string token, string userId) =>
            EmailConfirmationTemplate.GetTemplate(token!, userId!);

        // ─────────────────────────────────────────────────────────────
        // Password Reset
        // ─────────────────────────────────────────────────────────────
        private static string PasswordReset(string token) =>
            PasswordResetTemplate.GetTemplate(token);

        // ─────────────────────────────────────────────────────────────
        // Welcome
        // ─────────────────────────────────────────────────────────────
        private static string Welcome() => WelcomeTamplate.GetTemplate();

        // ─────────────────────────────────────────────────────────────
        // Notification
        // ─────────────────────────────────────────────────────────────
        private static string Notification() => NotificationsTamplate.GetTemplate();
    }
}
