using System;
using System.Text.Json;
using System.Threading.Tasks;
using Entites.Redis;
using StackExchange.Redis;

namespace Repositories.Redis
{
    public interface IRedisTokenRepository
    {
        Task SetRefreshTokenAsync(string token, RefreshToken refreshToken, TimeSpan expiration);
        Task<RefreshToken> GetRefreshTokenAsync(string token);
        Task DeleteRefreshTokenAsync(string token);
    }

    public class RedisTokenRepository : IRedisTokenRepository
    {
        private readonly IDatabase _database;

        public RedisTokenRepository(IConnectionMultiplexer redis)
        {
            _database = redis.GetDatabase();
        }

        public async Task SetRefreshTokenAsync(string token, RefreshToken refreshToken, TimeSpan expiration)
        {
            var json = JsonSerializer.Serialize(refreshToken);
            await _database.StringSetAsync($"refreshtoken:{token}", json, expiration);
        }

        public async Task<RefreshToken> GetRefreshTokenAsync(string token)
        {
            var json = await _database.StringGetAsync($"refreshtoken:{token}");
            if (json.IsNullOrEmpty) return null;
            return JsonSerializer.Deserialize<RefreshToken>(json);
        }

        public async Task DeleteRefreshTokenAsync(string token)
        {
            await _database.KeyDeleteAsync($"refreshtoken:{token}");
        }
    }

    public interface IRedisEmailConfirmRepository
    {
        Task SetEmailConfirmAsync(string email, EmailConfirm emailConfirm, TimeSpan expiration);
        Task<EmailConfirm> GetEmailConfirmAsync(string email);
        Task DeleteEmailConfirmAsync(string email);
    }

    public class RedisEmailConfirmRepository : IRedisEmailConfirmRepository
    {
        private readonly IDatabase _database;

        public RedisEmailConfirmRepository(IConnectionMultiplexer redis)
        {
            _database = redis.GetDatabase();
        }

        public async Task SetEmailConfirmAsync(string email, EmailConfirm emailConfirm, TimeSpan expiration)
        {
            var json = JsonSerializer.Serialize(emailConfirm);
            await _database.StringSetAsync($"emailconfirm:{email}", json, expiration);
        }

        public async Task<EmailConfirm> GetEmailConfirmAsync(string email)
        {
            var json = await _database.StringGetAsync($"emailconfirm:{email}");
            if (json.IsNullOrEmpty) return null;
            return JsonSerializer.Deserialize<EmailConfirm>(json);
        }

        public async Task DeleteEmailConfirmAsync(string email)
        {
            await _database.KeyDeleteAsync($"emailconfirm:{email}");
        }
    }
}
