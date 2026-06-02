using Repositories.Context;

namespace Repositories;

public class UnitOfWork : IDisposable
{
    private readonly SmashClubContext _context;

    public UserRepository Users { get; }
    public RefreshTokenRepository RefreshTokens { get; }
    public SportRepository Sports { get; }
    public SportLevelRepository SportLevels { get; }
    public UserSportProfileRepository UserSportProfiles { get; }
    public TeamRepository Teams { get; }
    public TeamMemberRepository TeamMembers { get; }
    public TeamMessageRepository TeamMessages { get; }
    public TeamInviteRepository TeamInvites { get; }
    public ScheduleRepository Schedules { get; }
    public ScheduleParticipantRepository ScheduleParticipants { get; }
    public BookingRepository Booking { get; }
    public EmailConfirmRepository EmailConfirms { get; }

    public UnitOfWork(SmashClubContext context)
    {
        _context = context;
        Users = new UserRepository(context);
        RefreshTokens = new RefreshTokenRepository(context);
        Sports = new SportRepository(context);
        SportLevels = new SportLevelRepository(context);
        UserSportProfiles = new UserSportProfileRepository(context);
        Teams = new TeamRepository(context);
        TeamMembers = new TeamMemberRepository(context);
        TeamMessages = new TeamMessageRepository(context);
        TeamInvites = new TeamInviteRepository(context);
        Schedules = new ScheduleRepository(context);
        ScheduleParticipants = new ScheduleParticipantRepository(context);
        Booking = new BookingRepository(context);
        EmailConfirms = new EmailConfirmRepository(context);
    }

    public async Task<int> SaveChangesAsync()
    {
        return await _context.SaveChangesAsync();
    }

    public void Dispose()
    {
        _context.Dispose();
    }
}
