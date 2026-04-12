// Infrastructure/Repositories/OutboxEmailRepository.cs
using Domain.Entities;
using Domain.Enums;
using Domain.Helpers;
using Domain.Interfaces;
using Domain.Requests.Emails;
using FluentEmail.Core;
using Hangfire;
using Infrastructure.Data;

namespace Infrastructure.Repositories
{
    public class OutboxEmailRepository(
        ApplicationDbContext _context,
        IFluentEmail _fluentEmail,
        IBackgroundJobClient _jobClient
    ) : IOutboxEmail
    {
        public async Task<OutboxEmail> CreateAndSendAsync(EmailCreationRequest request)
        {
            var type = ParseEmailType(request.Type);

            var outbox = new OutboxEmail
            {
                To = request.To,
                Subject = request.Subject,
                HtmlBody = EmailHtmlBuilder.HtmlBody(type, request.Token, request.UserId),
                Type = type,
                Token = request.Token,
                UserId = request.UserId,

                CreatedAt = DateTime.UtcNow,
            };

            await _context.OutboxEmails.AddAsync(outbox);
            await _context.SaveChangesAsync();

            _jobClient.Enqueue<IOutboxEmail>(r => r.DispatchAsync(outbox.Id));

            return outbox;
        }

        public async Task DispatchAsync(int outboxEmailId)
        {
            var outbox = await _context.OutboxEmails.FindAsync(outboxEmailId);
            if (outbox is null)
                return;

            try
            {
                var response = await _fluentEmail
                    .To(outbox.To)
                    .Subject(outbox.Subject)
                    .Body(outbox.HtmlBody, isHtml: true)
                    .SendAsync();

                if (response.Successful) { }
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
            finally
            {
                await _context.SaveChangesAsync();
            }
        }

        private static EmailType ParseEmailType(string? raw) =>
            Enum.TryParse<EmailType>(raw, ignoreCase: true, out var result)
                ? result
                : EmailType.Welcome;
    }
}
