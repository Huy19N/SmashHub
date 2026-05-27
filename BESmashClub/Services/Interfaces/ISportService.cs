using Entites.DTOs.Sports;

namespace Services.Interfaces;

public interface ISportService
{
    Task<List<SportResponse>> GetAllSportsAsync();
    Task<List<SportLevelResponse>> GetLevelsBySportAsync(int sportId);
}
