using System.Threading.Tasks;

namespace Services.Interfaces
{
    public interface IContentModerationService
    {
        Task<bool> IsContentCleanAsync(string content);
    }
}
