using System;
using System.Threading.Tasks;

namespace Services.Interfaces
{
    public interface IRedisCacheService
    {
        Task SetAsync<T>(string key, T value, TimeSpan expiration);
        Task<T> GetAsync<T>(string key);
        Task RemoveAsync(string key);
    }
}
