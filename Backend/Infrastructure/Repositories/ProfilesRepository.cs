using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain.Entities;
using Domain.Interfaces;
using Domain.Requests.Profiles;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories
{
    public class ProfilesRepository(ApplicationDbContext context, ICaching cachingService)
        : IProfile
    {
        private readonly ApplicationDbContext _context = context;
        private readonly ICaching _cachingService = cachingService;

        public async Task<Profile> CreateProfile(Profile profile)
        {
            var result = await _context.Profiles.AddAsync(profile);
            await _context.SaveChangesAsync();
            return result.Entity;
        }

        public async Task<Profile?> GetProfileByUserId(string userId)
        {
            var key = $"profile_{userId}";
            var result = await _cachingService.GetOrSetAsync(
                key,
                async token =>
                {
                    return await _context
                        .Profiles.Include(x => x.User)
                        .Include(x => x.Upload)
                        .FirstOrDefaultAsync(x => x.UserId == userId, token);
                },
                TimeSpan.FromMinutes(10),
                ["user_profile"]
            );
            return result;
        }

        public async Task<bool?> UpdateProfile(string userId, UpdateProfileRequest request)
        {
            var affectedRow = await _context
                .Profiles.Where(x => x.UserId == userId)
                .ExecuteUpdateAsync(p =>
                    p.SetProperty(x => x.FirstName, request.FirstName)
                        .SetProperty(x => x.LastName, request.LastName)
                        .SetProperty(x => x.Bio, request.Bio)
                        .SetProperty(x => x.UpdatedAt, DateTime.UtcNow)
                );
            return affectedRow == 0 ? null : true;
        }
    }
}
