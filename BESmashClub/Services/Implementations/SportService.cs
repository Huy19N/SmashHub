using Entites.DTOs.Sports;
using Repositories;
using Services.Interfaces;

namespace Services.Implementations;

public class SportService : ISportService
{
    private readonly UnitOfWork _unitOfWork;

    public SportService(UnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<SportResponse>> GetAllSportsAsync()
    {
        var sports = await _unitOfWork.Sports.GetAllAsync();
        return sports.Select(s => new SportResponse
        {
            SportId = s.SportId,
            SportName = s.SportName,
            Description = s.Description
        }).ToList();
    }

    public async Task<List<SportLevelResponse>> GetLevelsBySportAsync(int sportId)
    {
        var levels = await _unitOfWork.SportLevels.GetBySportIdAsync(sportId);
        return levels.Select(l => new SportLevelResponse
        {
            LevelId = l.LevelId,
            SportId = l.SportId,
            LevelName = l.LevelName,
            RankValue = l.RankValue
        }).ToList();
    }
}
