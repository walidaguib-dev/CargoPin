using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Profiles.Dtos;
using Domain.Entities;
using Domain.Requests.Profiles;

namespace Application.Profiles
{
    public static class ProfilesMapper
    {
        public static Profile MapToEntity(this CreateProfileDto model)
        {
            return new Profile
            {
                UserId = model.UserId,
                FirstName = model.FirstName,
                LastName = model.LastName,
                Bio = model.Bio,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = null,
                UploadId = model.UploadId,
            };
        }

        public static UpdateProfileRequest MapToRequest(this UpdateProfileDto dto)
        {
            return new UpdateProfileRequest
            {
                Bio = dto.Bio,
                FirstName = dto.FirstName,
                LastName = dto.LastName,
            };
        }
    }
}
