using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Profiles.Commands;
using Domain.Interfaces;
using MediatR;

namespace Application.Profiles.Handlers
{
    public class UpdateProfileHandler(IProfile _profilesService)
        : IRequestHandler<UpdateProfileCommand, bool?>
    {
        private readonly IProfile profilesService = _profilesService;

        public async Task<bool?> Handle(
            UpdateProfileCommand request,
            CancellationToken cancellationToken
        )
        {
            var profileRequest = request.Dto.MapToRequest();
            return await profilesService.UpdateProfile(request.userId, profileRequest);
        }
    }
}
