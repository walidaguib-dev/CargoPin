using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Emails.Dtos;
using Domain.Entities;
using Domain.Enums;
using Domain.Helpers;
using Domain.Requests.Emails;

namespace Application.Emails
{
    public static class EmailsMapper
    {
        public static OutboxEmail MapToEntity(this EmailCreationDto dto)
        {
            var type = Enum.TryParse<EmailType>(dto.Type, true, out var Type)
                ? Type
                : EmailType.Welcome;
            return new OutboxEmail
            {
                Subject = dto.Subject,
                To = dto.To,
                Type = Type,
                HtmlBody = dto.HtmlBody,
                Token = dto.Token,
                UserId = dto.UserId,
                CreatedAt = DateTime.UtcNow,
            };
        }

        public static EmailCreationRequest MapToRequest(this EmailCreationDto dto)
        {
            var type = Enum.TryParse<EmailType>(dto.Type, ignoreCase: true, out var result)
                ? result
                : EmailType.Welcome;
            return new EmailCreationRequest
            {
                HtmlBody = EmailHtmlBuilder.HtmlBody(type, dto.Token, dto.UserId),
                Subject = dto.Subject,
                To = dto.To,
                Token = dto.Token,
                Type = dto.Type,
                UserId = dto.UserId,
            };
        }
    }
}
