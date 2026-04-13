using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Emails.Commands;
using Domain.Entities;
using Domain.Interfaces;
using MediatR;

namespace Application.Emails.Handlers
{
    public class EmailCreationHandler(IOutboxEmail _outboxEmailService)
        : IRequestHandler<EmailCreationCommand, OutboxEmail>
    {
        private readonly IOutboxEmail outboxEmailService = _outboxEmailService;

        public async Task<OutboxEmail> Handle(
            EmailCreationCommand request,
            CancellationToken cancellationToken
        )
        {
            var emailRequest = request.Dto.MapToRequest();

            return await outboxEmailService.CreateAndSendAsync(emailRequest);
        }
    }
}
