using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain.Entities;
using Domain.Requests.Profiles;

namespace Domain.Interfaces
{
    public interface IProfile
    {
        public Task<Profile> CreateProfile(Profile profile);
        public Task<Profile?> GetProfileByUserId(string userId);
        public Task<bool?> UpdateProfile(string userId, UpdateProfileRequest request);
    }
}
