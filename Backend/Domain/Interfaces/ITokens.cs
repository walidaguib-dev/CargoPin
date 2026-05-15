using Domain.Entities;
using Domain.Requests.Tokens;

namespace Domain.Interfaces
{
    public interface ITokens
    {
        public Task<TokenPairDto?> GenerateAccessToken(GenerateAccessTokenRequest tokenRequest);

        public Task<string> GenerateToken(User user);
        public Task<RefreshToken> GenerateRefreshToken(User user);
    }
}
