using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Profiles.Dtos;
using Domain.Interfaces;
using MediatR;

namespace Application.Profiles.Commands
{
    public record UpdateProfileCommand(UpdateProfileDto Dto, string userId)
        : IRequest<bool?>,
            IInvalidateCache
    {
        public List<string> CacheKeys => [$"user_profile_{userId}"];

        public List<string> CacheTags => ["user_profile"];
    }
}
