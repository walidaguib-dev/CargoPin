using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Profiles.Commands;
using Domain.Entities;
using Domain.Interfaces;
using MediatR;

namespace Application.Profiles.Handlers
{
    public class CreateProfileHandler(IProfile _profilesService)
        : IRequestHandler<CreateProfileCommand, Profile>
    {
        private readonly IProfile profilesService = _profilesService;

        public async Task<Profile> Handle(
            CreateProfileCommand request,
            CancellationToken cancellationToken
        )
        {
            var profile = request.Dto.MapToEntity();
            return await profilesService.CreateProfile(profile);
        }
    }
}
