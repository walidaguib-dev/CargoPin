using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Emails.Dtos;
using Domain.Entities;
using MediatR;

namespace Application.Emails.Commands
{
    public record EmailCreationCommand(EmailCreationDto Dto) : IRequest<OutboxEmail> { }
}
