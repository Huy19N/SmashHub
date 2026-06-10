using Entites.DTOs.Matchmaking;

namespace Services.Interfaces;

public interface IMatchmakingService
{
    Task<MatchChallengeResponse> CreateChallengeAsync(Guid userId, CreateMatchChallengeRequest request);
    Task<List<MatchChallengeResponse>> GetActiveChallengesAsync(int? sportId, string? city, string? district);
    Task<List<MatchChallengeMapResponse>> GetChallengesForMapAsync();
    Task<MatchAcceptanceResponse> JoinChallengeAsync(Guid userId, Guid challengeId, Guid challengerTeamId);
    Task<List<MatchAcceptanceResponse>> GetAcceptancesAsync(Guid userId, Guid challengeId);
    Task RespondToAcceptanceAsync(Guid userId, Guid acceptanceId, bool accept);
}
