using Repositories.Context;

namespace Repositories;

public class UnitOfWork : IDisposable
{
    private readonly SmashClubContext _context;
    
    public SmashClubContext Context => _context;

    public UserRepository Users { get; }
    public SportRepository Sports { get; }
    public SportLevelRepository SportLevels { get; }
    public UserSportProfileRepository UserSportProfiles { get; }
    public TeamRepository Teams { get; }
    public TeamMemberRepository TeamMembers { get; }
    public TeamInviteRepository TeamInvites { get; }
    public ScheduleRepository Schedules { get; }
    public ScheduleParticipantRepository ScheduleParticipants { get; }
    public BookingRepository Booking { get; }
    public FacilityRepository Facilities { get; }
    public CourtRepository Courts { get; }
    public CourtCostRepository CourtCosts { get; }
    public PaymentRepository Payments { get; }
    public PayoutRepository Payouts { get; }
    public FacilityBankAccountRepository FacilityBankAccounts { get; }
    public SubscriptionPlanRepository SubscriptionPlans { get; }
    public UserSubscriptionRepository UserSubscriptions { get; }
    public MatchChallengeRepository MatchChallenges { get; }
    public MatchAcceptanceRepository MatchAcceptances { get; }
    public SystemSettingRepository SystemSettings { get; }

    public UnitOfWork(SmashClubContext context)
    {
        _context = context;
        Users = new UserRepository(context);
        Sports = new SportRepository(context);
        SportLevels = new SportLevelRepository(context);
        UserSportProfiles = new UserSportProfileRepository(context);
        Teams = new TeamRepository(context);
        TeamMembers = new TeamMemberRepository(context);
        TeamInvites = new TeamInviteRepository(context);
        Schedules = new ScheduleRepository(context);
        ScheduleParticipants = new ScheduleParticipantRepository(context);
        Booking = new BookingRepository(context);
        Facilities = new FacilityRepository(context);
        Courts = new CourtRepository(context);
        CourtCosts = new CourtCostRepository(context);
        Payments = new PaymentRepository(context);
        Payouts = new PayoutRepository(context);
        FacilityBankAccounts = new FacilityBankAccountRepository(context);
        SubscriptionPlans = new SubscriptionPlanRepository(context);
        UserSubscriptions = new UserSubscriptionRepository(context);
        MatchChallenges = new MatchChallengeRepository(context);
        MatchAcceptances = new MatchAcceptanceRepository(context);
        SystemSettings = new SystemSettingRepository(context);
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
