using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain.Entities;
using Domain.Requests.Tokens;

namespace Domain.Interfaces
{
    public interface ITokens
    {
        public Task<string?> GenerateAccessToken(GenerateAccessTokenRequest tokenRequest);

        public Task<string> GenerateToken(User user);
        public Task<RefreshToken> GenerateRefreshToken(User user);
    }
}
