using Entites.DTOs.Common;
using Entites.DTOs.Sports;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;

namespace APIWebApp.Controllers;

[ApiController]
[Route("api/sports")]
public class SportsController : ControllerBase
{
    private readonly ISportService _sportService;

    public SportsController(ISportService sportService)
    {
        _sportService = sportService;
    }

    /// <summary>
    /// Lấy danh sách các môn thể thao.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAllSports()
    {
        var result = await _sportService.GetAllSportsAsync();
        return Ok(ApiResponse<List<SportResponse>>.SuccessResponse(result));
    }

    /// <summary>
    /// Lấy danh sách các cấp độ (levels) của một môn cụ thể.
    /// </summary>
    [HttpGet("{sportId:int}/levels")]
    public async Task<IActionResult> GetLevels(int sportId)
    {
        var result = await _sportService.GetLevelsBySportAsync(sportId);
        return Ok(ApiResponse<List<SportLevelResponse>>.SuccessResponse(result));
    }
}
