using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Profiles.Queries;
using Domain.Entities;
using Domain.Interfaces;
using MediatR;

namespace Application.Profiles.Handlers
{
    public class GetProfileQueryHandler(IProfile _profilesService)
        : IRequestHandler<GetProfileQuery, Profile?>
    {
        private readonly IProfile profilesService = _profilesService;

        public async Task<Profile?> Handle(
            GetProfileQuery request,
            CancellationToken cancellationToken
        )
        {
            return await profilesService.GetProfileByUserId(request.userId);
        }
    }
}
