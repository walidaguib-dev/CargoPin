using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain.Entities;
using Domain.Enums;
using Domain.Requests.Emails;

namespace Domain.Interfaces
{
    public interface IOutboxEmail
    {
        // Domain/Interfaces/IOutboxEmail.cs

        public Task<OutboxEmail> CreateAndSendAsync(EmailCreationRequest request);
        public Task DispatchAsync(int outboxEmailId);
    }
}
