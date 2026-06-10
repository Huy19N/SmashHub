using Entites.DTOs.Facilities;
using Entites.Models;
using Microsoft.EntityFrameworkCore;
using Repositories;
using Services.Interfaces;

namespace Services.Implementations;

public class FacilityService : IFacilityService
{
    private readonly UnitOfWork _unitOfWork;

    public FacilityService(UnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<FacilityResponse> CreateFacilityAsync(Guid userId, CreateFacilityRequest request)
    {
        var facility = new Facility
        {
            OwnerId = userId,
            Name = request.Name,
            City = request.City,
            District = request.District,
            Address = request.Address,
            CreatedAt = DateTime.Now
        };

        await _unitOfWork.Facilities.CreateAsync(facility);

        return await GetFacilityDetailAsync(facility.FacilityId);
    }

    public async Task<List<FacilityResponse>> GetAllFacilitiesAsync()
    {
        var facilities = await _unitOfWork.Facilities.GetAllWithDetailsAsync();
        return facilities.Select(MapToResponse).ToList();
    }

    public async Task<List<FacilityResponse>> GetFacilitiesByOwnerAsync(Guid userId)
    {
        var facilities = await _unitOfWork.Facilities.GetByOwnerIdAsync(userId);
        return facilities.Select(MapToResponse).ToList();
    }

    public async Task<FacilityResponse> GetFacilityDetailAsync(int facilityId)
    {
        var facility = await _unitOfWork.Facilities.GetDetailAsync(facilityId);
        if (facility == null)
            throw new KeyNotFoundException("Không tìm thấy cơ sở.");

        return MapToResponse(facility);
    }

    public async Task<FacilityResponse> UpdateFacilityAsync(Guid userId, int facilityId, UpdateFacilityRequest request)
    {
        var facility = await _unitOfWork.Facilities.GetDetailAsync(facilityId);
        if (facility == null)
            throw new KeyNotFoundException("Không tìm thấy cơ sở.");

        if (facility.OwnerId != userId)
            throw new UnauthorizedAccessException("Bạn không có quyền cập nhật cơ sở này.");

        if (!string.IsNullOrWhiteSpace(request.Name))
            facility.Name = request.Name;

        if (!string.IsNullOrWhiteSpace(request.City))
            facility.City = request.City;

        if (!string.IsNullOrWhiteSpace(request.District))
            facility.District = request.District;

        if (request.Address != null)
            facility.Address = request.Address;

        await _unitOfWork.Facilities.UpdateAsync(facility);

        return await GetFacilityDetailAsync(facilityId);
    }

    public async Task<FacilityBankAccountResponse> AddBankAccountAsync(Guid userId, int facilityId, FacilityBankAccountRequest request)
    {
        var facility = await _unitOfWork.Facilities.GetByIdAsync(facilityId);
        if (facility == null)
            throw new KeyNotFoundException("Không tìm thấy cơ sở.");

        if (facility.OwnerId != userId)
            throw new UnauthorizedAccessException("Bạn không có quyền chỉnh sửa cơ sở này.");

        var account = new FacilityBankAccount
        {
            FacilityId = facilityId,
            BankName = request.BankName,
            AccountNumber = request.AccountNumber,
            AccountHolder = request.AccountHolder,
            IsPrimary = true,
            IsActive = true,
            CreatedAt = DateTime.Now
        };

        await _unitOfWork.FacilityBankAccounts.CreateAsync(account);

        return MapToBankAccountResponse(account, facility.Name);
    }

    public async Task<FacilityBankAccountResponse> UpdateBankAccountAsync(Guid userId, int facilityId, int bankAccountId, FacilityBankAccountRequest request)
    {
        var account = await _unitOfWork.FacilityBankAccounts.GetByIdAsync(bankAccountId);
        if (account == null)
            throw new KeyNotFoundException("Không tìm thấy tài khoản ngân hàng.");

        var facility = await _unitOfWork.Facilities.GetByIdAsync(account.FacilityId);
        if (facility == null || facility.OwnerId != userId)
            throw new UnauthorizedAccessException("Bạn không có quyền cập nhật tài khoản ngân hàng này.");

        account.BankName = request.BankName;
        account.AccountNumber = request.AccountNumber;
        account.AccountHolder = request.AccountHolder;
        account.UpdatedAt = DateTime.Now;

        await _unitOfWork.FacilityBankAccounts.UpdateAsync(account);

        return MapToBankAccountResponse(account, facility.Name);
    }

    public async Task DeleteBankAccountAsync(Guid userId, int facilityId, int bankAccountId)
    {
        var account = await _unitOfWork.FacilityBankAccounts.GetByIdAsync(bankAccountId);
        if (account == null)
            throw new KeyNotFoundException("Không tìm thấy tài khoản ngân hàng.");

        var facility = await _unitOfWork.Facilities.GetByIdAsync(account.FacilityId);
        if (facility == null || facility.OwnerId != userId)
            throw new UnauthorizedAccessException("Bạn không có quyền xóa tài khoản ngân hàng này.");

        await _unitOfWork.FacilityBankAccounts.RemoveAsync(account);
    }

    public async Task<List<FacilityBankAccountResponse>> GetBankAccountsAsync(Guid userId, int facilityId)
    {
        var facility = await _unitOfWork.Facilities.GetByIdAsync(facilityId);
        if (facility == null)
            throw new KeyNotFoundException("Không tìm thấy cơ sở.");

        if (facility.OwnerId != userId)
            throw new UnauthorizedAccessException("Bạn không có quyền xem tài khoản ngân hàng của cơ sở này.");

        var context = _unitOfWork.Facilities.GetContext();
        var accounts = await context.Set<FacilityBankAccount>()
            .Where(b => b.FacilityId == facilityId && b.IsActive)
            .ToListAsync();

        return accounts.Select(a => MapToBankAccountResponse(a, facility.Name)).ToList();
    }

    #region Helpers

    private static FacilityResponse MapToResponse(Facility f)
    {
        return new FacilityResponse
        {
            FacilityId = f.FacilityId,
            OwnerId = f.OwnerId,
            OwnerName = f.Owner?.FullName,
            Name = f.Name,
            City = f.City,
            District = f.District,
            Address = f.Address,
            CourtCount = f.Courts?.Count ?? 0,
            Latitude = f.Latitude,
            Longitude = f.Longitude,
            CreatedAt = f.CreatedAt
        };
    }

    private static FacilityBankAccountResponse MapToBankAccountResponse(FacilityBankAccount a, string facilityName)
    {
        return new FacilityBankAccountResponse
        {
            FacilityId = a.FacilityId,
            FacilityName = facilityName,
            BankName = a.BankName,
            AccountNumber = a.AccountNumber,
            AccountHolder = a.AccountHolder,
            IsActive = a.IsActive,
            CreatedAt = a.CreatedAt,
            UpdatedAt = a.UpdatedAt
        };
    }

    public async Task<List<FacilityResponse>> GetFilteredFacilitiesAsync(FacilityFilterRequest request)
    {
        var context = _unitOfWork.Facilities.GetContext();
        var query = context.Set<Facility>()
            .Include(f => f.Owner)
            .Include(f => f.Courts).ThenInclude(c => c.CourtCosts)
            .Include(f => f.FacilityOperatingHours)
            .AsQueryable();

        // 1. Filter by SportId
        if (request.SportId.HasValue)
        {
            query = query.Where(f => f.Courts.Any(c => c.SportId == request.SportId.Value && c.IsActive));
        }

        // 2. Filter by Price Range
        if (request.MinPrice.HasValue)
        {
            query = query.Where(f => f.Courts.Any(c => c.CourtCosts.Any(cc => cc.Cost >= request.MinPrice.Value && cc.IsActive)));
        }
        if (request.MaxPrice.HasValue)
        {
            query = query.Where(f => f.Courts.Any(c => c.CourtCosts.Any(cc => cc.Cost <= request.MaxPrice.Value && cc.IsActive)));
        }

        // 3. Filter by Location Area
        if (!string.IsNullOrWhiteSpace(request.City))
        {
            query = query.Where(f => f.City.Contains(request.City));
        }
        if (!string.IsNullOrWhiteSpace(request.District))
        {
            query = query.Where(f => f.District.Contains(request.District));
        }

        // 4. Filter by Date and Time slots
        if (request.Date.HasValue && !string.IsNullOrEmpty(request.StartTime) && !string.IsNullOrEmpty(request.EndTime))
        {
            var date = request.Date.Value.Date;
            if (TimeOnly.TryParse(request.StartTime, out var start) && TimeOnly.TryParse(request.EndTime, out var end))
            {
                var slotStart = date.Add(start.ToTimeSpan());
                var slotEnd = date.Add(end.ToTimeSpan());
                int dayOfWeekInt = date.DayOfWeek == DayOfWeek.Sunday ? 8 : (int)date.DayOfWeek + 1;

                query = query.Where(f =>
                    (!f.FacilityOperatingHours.Any(oh => oh.DayOfWeek == dayOfWeekInt) ||
                     f.FacilityOperatingHours.Any(oh => oh.DayOfWeek == dayOfWeekInt && oh.OpenTime <= start && oh.CloseTime >= end))
                    &&
                    f.Courts.Any(c => c.IsActive && c.StatusId == 1 &&
                        (request.SportId == null || c.SportId == request.SportId.Value) &&
                        !c.Bookings.Any(b => b.StatusId != 3 && b.StartTime < slotEnd && b.EndTime > slotStart)
                    )
                );
            }
        }

        var facilities = await query.ToListAsync();
        var responses = facilities.Select(MapToResponse).ToList();

        // 5. Filter & Sort by Distance (in-memory)
        if (request.Latitude.HasValue && request.Longitude.HasValue)
        {
            var userLat = (double)request.Latitude.Value;
            var userLon = (double)request.Longitude.Value;

            foreach (var resp in responses)
            {
                if (resp.Latitude.HasValue && resp.Longitude.HasValue)
                {
                    resp.DistanceKm = CalculateDistance(userLat, userLon, (double)resp.Latitude.Value, (double)resp.Longitude.Value);
                }
            }

            if (request.MaxDistanceKm.HasValue)
            {
                responses = responses.Where(r => r.DistanceKm <= request.MaxDistanceKm.Value).ToList();
            }

            responses = responses.OrderBy(r => r.DistanceKm ?? double.MaxValue).ToList();
        }

        return responses;
    }

    public async Task<List<CourtAvailabilityResponse>> GetCourtAvailabilitiesAsync(int facilityId, DateTime date)
    {
        var context = _unitOfWork.Facilities.GetContext();
        
        var courts = await context.Set<Court>()
            .Include(c => c.Sport)
            .Include(c => c.Status)
            .Include(c => c.CourtCosts)
            .Where(c => c.FacilityId == facilityId && c.IsActive)
            .ToListAsync();

        var targetDate = date.Date;
        var bookings = await context.Set<Booking>()
            .Include(b => b.BookedByUser)
            .Where(b => b.Court.FacilityId == facilityId 
                && b.StatusId != 3 
                && b.StartTime >= targetDate 
                && b.StartTime < targetDate.AddDays(1))
            .ToListAsync();

        var results = new List<CourtAvailabilityResponse>();

        foreach (var court in courts)
        {
            var courtResp = new CourtAvailabilityResponse
            {
                CourtId = court.CourtId,
                CourtName = court.CourtName,
                SportName = court.Sport?.SportName,
                IsActive = court.IsActive
            };

            if (court.CourtCosts != null && court.CourtCosts.Any())
            {
                foreach (var cc in court.CourtCosts.Where(cc => cc.IsActive).OrderBy(x => x.StartTime))
                {
                    var startStr = cc.StartTime.ToString("HH:mm");
                    var endStr = cc.EndTime.ToString("HH:mm");
                    var slotStart = targetDate.Add(cc.StartTime.ToTimeSpan());
                    var slotEnd = targetDate.Add(cc.EndTime.ToTimeSpan());

                    var booking = bookings.FirstOrDefault(b => b.CourtId == court.CourtId && b.StartTime < slotEnd && b.EndTime > slotStart);

                    string slotStatus = "Available";
                    Guid? bookingId = null;
                    string bookedByUser = null;

                    if (court.StatusId == 2 || !court.IsActive)
                    {
                        slotStatus = "Maintenance";
                    }
                    else if (booking != null)
                    {
                        slotStatus = "Booked";
                        bookingId = booking.BookingId;
                        bookedByUser = booking.BookedByUser?.FullName ?? booking.CustomerNameOffline ?? "Đối tác đặt";
                    }

                    courtResp.TimeSlots.Add(new TimeSlotStatus
                    {
                        StartTime = startStr,
                        EndTime = endStr,
                        Cost = cc.Cost,
                        Status = slotStatus,
                        BookingId = bookingId,
                        BookedByUserName = bookedByUser
                    });
                }
            }
            else
            {
                var dayOfWeekInt = targetDate.DayOfWeek == DayOfWeek.Sunday ? 8 : (int)targetDate.DayOfWeek + 1;
                var operatingHour = await context.Set<FacilityOperatingHour>()
                    .FirstOrDefaultAsync(oh => oh.FacilityId == facilityId && oh.DayOfWeek == dayOfWeekInt);

                if (operatingHour != null)
                {
                    var current = operatingHour.OpenTime;
                    while (current < operatingHour.CloseTime)
                    {
                        var next = current.AddHours(1);
                        if (next > operatingHour.CloseTime) next = operatingHour.CloseTime;

                        var startStr = current.ToString("HH:mm");
                        var endStr = next.ToString("HH:mm");
                        var slotStart = targetDate.Add(current.ToTimeSpan());
                        var slotEnd = targetDate.Add(next.ToTimeSpan());

                        var booking = bookings.FirstOrDefault(b => b.CourtId == court.CourtId && b.StartTime < slotEnd && b.EndTime > slotStart);

                        string slotStatus = "Available";
                        Guid? bookingId = null;
                        string bookedByUser = null;

                        if (court.StatusId == 2 || !court.IsActive)
                        {
                            slotStatus = "Maintenance";
                        }
                        else if (booking != null)
                        {
                            slotStatus = "Booked";
                            bookingId = booking.BookingId;
                            bookedByUser = booking.BookedByUser?.FullName ?? booking.CustomerNameOffline ?? "Đối tác đặt";
                        }

                        courtResp.TimeSlots.Add(new TimeSlotStatus
                        {
                            StartTime = startStr,
                            EndTime = endStr,
                            Cost = 0,
                            Status = slotStatus,
                            BookingId = bookingId,
                            BookedByUserName = bookedByUser
                        });

                        current = next;
                    }
                }
            }

            results.Add(courtResp);
        }

        return results;
    }

    private static double CalculateDistance(double lat1, double lon1, double lat2, double lon2)
    {
        var r = 6371; // Earth radius in km
        var dLat = (lat2 - lat1) * Math.PI / 180;
        var dLon = (lon2 - lon1) * Math.PI / 180;
        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(lat1 * Math.PI / 180) * Math.Cos(lat2 * Math.PI / 180) *
                Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
        return r * c;
    }

    #endregion
}
