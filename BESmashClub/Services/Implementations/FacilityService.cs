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
            Latitude = request.Latitude,
            Longitude = request.Longitude,
            BusinessCode = request.BusinessCode,
            StatusId = 1, // Pending as default
            CreatedAt = DateTime.Now
        };

        await _unitOfWork.Facilities.CreateAsync(facility);

        return await GetFacilityDetailAsync(facility.FacilityId);
    }

    public async Task<List<FacilityResponse>> GetAllFacilitiesAsync()
    {
        var facilities = await _unitOfWork.Facilities.GetAllWithDetailsAsync();
        return facilities.Where(f => f.StatusId != 3).Select(MapToResponse).ToList();
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

        if (request.Latitude.HasValue)
            facility.Latitude = request.Latitude.Value;

        if (request.Longitude.HasValue)
            facility.Longitude = request.Longitude.Value;

        if (request.BusinessCode != null)
            facility.BusinessCode = request.BusinessCode;

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

    public async Task<List<OperatingHourResponse>> GetOperatingHoursAsync(int facilityId)
    {
        var context = _unitOfWork.Facilities.GetContext();
        var hours = await context.Set<FacilityOperatingHour>()
            .Where(oh => oh.FacilityId == facilityId)
            .OrderBy(oh => oh.DayOfWeek)
            .ToListAsync();

        return hours.Select(oh => new OperatingHourResponse
        {
            OperatingHourId = oh.OperatingHourId,
            FacilityId = oh.FacilityId,
            DayOfWeek = oh.DayOfWeek,
            OpenTime = oh.OpenTime.ToString("HH:mm"),
            CloseTime = oh.CloseTime.ToString("HH:mm")
        }).ToList();
    }

    public async Task<List<OperatingHourResponse>> UpdateOperatingHoursAsync(Guid userId, int facilityId, List<OperatingHourRequest> request)
    {
        var facility = await _unitOfWork.Facilities.GetByIdAsync(facilityId);
        if (facility == null) throw new KeyNotFoundException("Không tìm thấy cơ sở.");
        if (facility.OwnerId != userId) throw new UnauthorizedAccessException("Bạn không có quyền cập nhật giờ hoạt động.");

        var context = _unitOfWork.Facilities.GetContext();
        
        var oldHours = await context.Set<FacilityOperatingHour>()
            .Where(oh => oh.FacilityId == facilityId).ToListAsync();
        context.Set<FacilityOperatingHour>().RemoveRange(oldHours);

        var newHours = request.Select(r => new FacilityOperatingHour
        {
            FacilityId = facilityId,
            DayOfWeek = r.DayOfWeek,
            OpenTime = TimeOnly.Parse(r.OpenTime),
            CloseTime = TimeOnly.Parse(r.CloseTime)
        }).ToList();

        await context.Set<FacilityOperatingHour>().AddRangeAsync(newHours);
        await context.SaveChangesAsync();

        return await GetOperatingHoursAsync(facilityId);
    }

    public async Task<List<SportPriceDetailResponse>> GetSportPricesAsync(int facilityId)
    {
        var context = _unitOfWork.Facilities.GetContext();
        var courts = await context.Set<Court>()
            .Include(c => c.Sport)
            .Include(c => c.CourtCosts)
            .Where(c => c.FacilityId == facilityId && c.IsActive && c.Sport != null)
            .ToListAsync();

        var result = new List<SportPriceDetailResponse>();
        var grouped = courts.GroupBy(c => new { c.SportId, c.Sport.SportName });

        foreach (var group in grouped)
        {
            var costs = group.SelectMany(c => c.CourtCosts).Where(cc => cc.IsActive).ToList();
            
            var uniqueDetails = costs
                .GroupBy(cc => new { cc.StartTime, cc.EndTime, cc.Cost, cc.DurationMinutes })
                .Select(g => new SportPriceDetailResponse.PriceDetail
                {
                    StartTime = g.Key.StartTime.ToString("HH:mm"),
                    EndTime = g.Key.EndTime.ToString("HH:mm"),
                    Cost = g.Key.Cost,
                    DurationMinutes = g.Key.DurationMinutes
                })
                .OrderBy(d => d.StartTime).ThenBy(d => d.Cost)
                .ToList();

            result.Add(new SportPriceDetailResponse
            {
                SportId = group.Key.SportId,
                SportName = group.Key.SportName,
                PriceDetails = uniqueDetails
            });
        }

        return result;
    }

    #region Helpers

    private static FacilityResponse MapToResponse(Facility f)
    {
        var response = new FacilityResponse
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
            BusinessCode = f.BusinessCode,
            StatusId = f.StatusId,
            StatusName = f.Status?.StatusName,
            CreatedAt = f.CreatedAt
        };

        if (f.Courts != null && f.Courts.Any())
        {
            var sportGroups = f.Courts
                .Where(c => c.IsActive && c.Sport != null && c.CourtCosts != null)
                .GroupBy(c => new { c.SportId, c.Sport.SportName });

            foreach (var group in sportGroups)
            {
                var costs = group.SelectMany(c => c.CourtCosts).Where(cc => cc.IsActive).ToList();
                if (costs.Any())
                {
                    response.SportPrices.Add(new SportPriceSummary
                    {
                        SportId = group.Key.SportId,
                        SportName = group.Key.SportName,
                        MinPrice = costs.Min(cc => cc.Cost),
                        MaxPrice = costs.Max(cc => cc.Cost)
                    });
                }
            }
        }

        return response;
    }

    private static FacilityBankAccountResponse MapToBankAccountResponse(FacilityBankAccount a, string facilityName)
    {
        return new FacilityBankAccountResponse
        {
            BankAccountId = a.BankAccountId,
            FacilityId = a.FacilityId,
            FacilityName = facilityName,
            BankName = a.BankName,
            AccountNumber = a.AccountNumber,
            AccountHolder = a.AccountHolder,
            IsPrimary = a.IsPrimary,
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
            .Include(f => f.Courts).ThenInclude(c => c.Sport)
            .Include(f => f.Courts).ThenInclude(c => c.CourtCosts)
            .Include(f => f.FacilityOperatingHours)
            .AsSplitQuery()
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
            query = query.Where(f => f.City == request.City);
        }
        if (!string.IsNullOrWhiteSpace(request.District))
        {
            query = query.Where(f => f.District == request.District);
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

        // [OPTIMIZATION 1] Group bookings by CourtId to O(1) lookup
        var bookingsByCourt = bookings.ToLookup(b => b.CourtId);

        // [OPTIMIZATION 2] Fetch OperatingHours once outside the loop (Resolve N+1 Query)
        var dayOfWeekInt = targetDate.DayOfWeek == DayOfWeek.Sunday ? 8 : (int)targetDate.DayOfWeek + 1;
        var operatingHour = await context.Set<FacilityOperatingHour>()
            .FirstOrDefaultAsync(oh => oh.FacilityId == facilityId && oh.DayOfWeek == dayOfWeekInt);

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

            var courtBookings = bookingsByCourt[court.CourtId];

            if (court.CourtCosts != null && court.CourtCosts.Any())
            {
                foreach (var cc in court.CourtCosts.Where(cc => cc.IsActive).OrderBy(x => x.StartTime))
                {
                    // [OPTIMIZATION 3] Use TimeSpan to prevent Infinite Loop Wrap Around
                    var currentSpan = cc.StartTime.ToTimeSpan();
                    var endSpan = cc.EndTime.ToTimeSpan();

                    while (currentSpan < endSpan)
                    {
                        var nextSpan = currentSpan.Add(TimeSpan.FromMinutes(30));
                        if (nextSpan > endSpan) nextSpan = endSpan;

                        var startStr = $"{(int)currentSpan.TotalHours:00}:{currentSpan.Minutes:00}";
                        var endStr = $"{(int)nextSpan.TotalHours:00}:{nextSpan.Minutes:00}";
                        if (endStr == "24:00") endStr = "23:59";

                        var slotStart = targetDate.Add(currentSpan);
                        var slotEnd = targetDate.Add(nextSpan);

                        var booking = courtBookings.FirstOrDefault(b => b.StartTime < slotEnd && b.EndTime > slotStart);

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

                        // Calculate cost proportionally
                        var durationMinutes = (nextSpan - currentSpan).TotalMinutes;
                        var costPerSlot = cc.Cost;
                        if (cc.DurationMinutes > 0) 
                        {
                            costPerSlot = (cc.Cost / cc.DurationMinutes) * (decimal)durationMinutes;
                        }

                        courtResp.TimeSlots.Add(new TimeSlotStatus
                        {
                            StartTime = startStr,
                            EndTime = endStr,
                            Cost = costPerSlot,
                            Status = slotStatus,
                            BookingId = bookingId,
                            BookedByUserName = bookedByUser
                        });

                        currentSpan = nextSpan;
                    }
                }
            }
            else
            {
                if (operatingHour != null)
                {
                    var currentSpan = operatingHour.OpenTime.ToTimeSpan();
                    var endSpan = operatingHour.CloseTime.ToTimeSpan();

                    while (currentSpan < endSpan)
                    {
                        var nextSpan = currentSpan.Add(TimeSpan.FromMinutes(30));
                        if (nextSpan > endSpan) nextSpan = endSpan;

                        var startStr = $"{(int)currentSpan.TotalHours:00}:{currentSpan.Minutes:00}";
                        var endStr = $"{(int)nextSpan.TotalHours:00}:{nextSpan.Minutes:00}";
                        if (endStr == "24:00") endStr = "23:59";

                        var slotStart = targetDate.Add(currentSpan);
                        var slotEnd = targetDate.Add(nextSpan);

                        var booking = courtBookings.FirstOrDefault(b => b.StartTime < slotEnd && b.EndTime > slotStart);

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

                        currentSpan = nextSpan;
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

    public async Task ApproveRejectFacilityAsync(int facilityId, int statusId)
    {
        var facility = await _unitOfWork.Facilities.GetByIdAsync(facilityId);
        if (facility == null)
            throw new KeyNotFoundException("Không tìm thấy cơ sở.");

        facility.StatusId = statusId;
        await _unitOfWork.Facilities.UpdateAsync(facility);
    }

    #endregion
}
