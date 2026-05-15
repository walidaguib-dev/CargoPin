using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Domain.Entities;
using Domain.Interfaces;
using Domain.Requests.Tokens;
using Infrastructure.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace Infrastructure.Repositories
{
    public class TokensRepository(
        ApplicationDbContext _context,
        UserManager<User> _userManager,
        IConfiguration _config
    ) : ITokens
    {
        private readonly ApplicationDbContext context = _context;
        private readonly UserManager<User> userManager = _userManager;
        private readonly IConfiguration config = _config;

        public async Task<TokenPairDto?> GenerateAccessToken(
            GenerateAccessTokenRequest tokenRequest
        )
        {
            var refreshToken = await context.RefreshTokens.FirstOrDefaultAsync(rt =>
                rt.UserId == tokenRequest.UserId && rt.Token == tokenRequest.Token
            );

            if (
                refreshToken is null
                || refreshToken.RevokedAt != null
                || refreshToken.ExpiresAt < DateTime.UtcNow
            )
                return null;

            var user = await context.Users.FirstOrDefaultAsync(u => u.Id == tokenRequest.UserId);
            if (user is null)
                return null;

            refreshToken.RevokedAt = DateTime.UtcNow;
            var newRefreshToken = await GenerateRefreshToken(user);
            await context.SaveChangesAsync();

            var accessToken = await GenerateToken(user);
            return new TokenPairDto
            {
                Access_Token = accessToken,
                Refresh_Token = newRefreshToken.Token,
            };
        }

        public async Task<RefreshToken> GenerateRefreshToken(User user)
        {
            if (user == null)
                throw new ArgumentNullException(nameof(user));

            // Generate secure token
            var randomBytes = new byte[64];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomBytes);
            var tokenString = Convert.ToBase64String(randomBytes);

            var existingToken = await context.RefreshTokens.FirstOrDefaultAsync(rt =>
                rt.UserId == user.Id
            );

            if (existingToken != null)
            {
                // ✅ UPDATE existing token
                existingToken.Token = tokenString;
                existingToken.CreatedAt = DateTime.UtcNow;
                existingToken.ExpiresAt = DateTime.UtcNow.AddDays(7);
                existingToken.RevokedAt = null;
            }
            else
            {
                // ✅ CREATE new token
                existingToken = new RefreshToken
                {
                    Token = tokenString,
                    UserId = user.Id,
                    CreatedAt = DateTime.UtcNow,
                    ExpiresAt = DateTime.UtcNow.AddDays(7),
                };

                await context.RefreshTokens.AddAsync(existingToken);
            }

            await context.SaveChangesAsync();
            return existingToken;
        }

        public async Task<string> GenerateToken(User user)
        {
            var roles = await userManager.GetRolesAsync(user);
            var claims = new List<Claim>
            {
                new(JwtRegisteredClaimNames.Sub, user.Id),
                new(JwtRegisteredClaimNames.Email, user.Email ?? ""),
            };

            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["JWT:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var accessTokenExpirationMinutes = int.Parse(
                config["JWT:AccessTokenExpirationMinutes"] ?? "15"
            );
            var jwtToken = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddMinutes(accessTokenExpirationMinutes),
                SigningCredentials = creds,
                Issuer = config["JWT:Issuer"],
                Audience = config["JWT:Audience"],
            };
            var tokenHandler = new JwtSecurityTokenHandler();
            var tk = tokenHandler.CreateToken(jwtToken);
            var result = tokenHandler.WriteToken(tk);
            return result;
        }
    }
}
