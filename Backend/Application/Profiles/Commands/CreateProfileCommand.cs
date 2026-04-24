using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Profiles.Dtos;
using Domain.Entities;
using Domain.Interfaces;
using MediatR;

namespace Application.Profiles.Commands
{
    public record CreateProfileCommand(CreateProfileDto Dto) : IRequest<Profile>, IInvalidateCache
    {
        public List<string> CacheKeys => [""];

        public List<string> CacheTags => ["user_profile"];
    }
}
