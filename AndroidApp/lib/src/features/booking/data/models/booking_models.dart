/// DTO gửi đi để yêu cầu đặt sân mới.
class CreateBookingRequest {
  final int courtId;
  final DateTime startTime;
  final DateTime endTime;

  CreateBookingRequest({
    required this.courtId,
    required this.startTime,
    required this.endTime,
  });

  Map<String, dynamic> toJson() {
    return {
      'courtId': courtId,
      'startTime': startTime.toIso8601String(),
      'endTime': endTime.toIso8601String(),
    };
  }
}

/// DTO gửi đi để cập nhật lịch đặt sân hiện tại.
class UpdateBookingRequest {
  final int courtId;
  final DateTime startTime;
  final DateTime endTime;

  UpdateBookingRequest({
    required this.courtId,
    required this.startTime,
    required this.endTime,
  });

  Map<String, dynamic> toJson() {
    return {
      'courtId': courtId,
      'startTime': startTime.toIso8601String(),
      'endTime': endTime.toIso8601String(),
    };
  }
}

/// DTO phản hồi thông tin Đặt sân từ Backend.
class BookingResponse {
  final String bookingId;
  final int courtId;
  final String? courtName;
  final String? facilityName;
  final String? sportName;
  final String? bookedByUserId;
  final String? bookedByUserName;
  final DateTime startTime;
  final DateTime endTime;
  final double? totalCost;
  final int statusId;
  final String? statusName;
  final String? paymentUrl;
  final DateTime? createdAt;

  BookingResponse({
    required this.bookingId,
    required this.courtId,
    this.courtName,
    this.facilityName,
    this.sportName,
    this.bookedByUserId,
    this.bookedByUserName,
    required this.startTime,
    required this.endTime,
    this.totalCost,
    required this.statusId,
    this.statusName,
    this.paymentUrl,
    this.createdAt,
  });

  factory BookingResponse.fromJson(Map<String, dynamic> json) {
    return BookingResponse(
      bookingId: json['bookingId'] as String? ?? '',
      courtId: json['courtId'] as int? ?? 0,
      courtName: json['courtName'] as String?,
      facilityName: json['facilityName'] as String?,
      sportName: json['sportName'] as String?,
      bookedByUserId: json['bookedByUserId'] as String?,
      bookedByUserName: json['bookedByUserName'] as String?,
      startTime: json['startTime'] != null
          ? DateTime.parse(json['startTime'] as String)
          : DateTime.now(),
      endTime: json['endTime'] != null
          ? DateTime.parse(json['endTime'] as String)
          : DateTime.now(),
      totalCost: (json['totalCost'] as num?)?.toDouble(),
      statusId: json['statusId'] as int? ?? 0,
      statusName: json['statusName'] as String?,
      paymentUrl: json['paymentUrl'] as String?,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'bookingId': bookingId,
      'courtId': courtId,
      'courtName': courtName,
      'facilityName': facilityName,
      'sportName': sportName,
      'bookedByUserId': bookedByUserId,
      'bookedByUserName': bookedByUserName,
      'startTime': startTime.toIso8601String(),
      'endTime': endTime.toIso8601String(),
      'totalCost': totalCost,
      'statusId': statusId,
      'statusName': statusName,
      'paymentUrl': paymentUrl,
      'createdAt': createdAt?.toIso8601String(),
    };
  }
}

/// DTO phản hồi thông tin chi tiết của một Sân.
class CourtResponse {
  final int courtId;
  final int facilityId;
  final String? facilityName;
  final int sportId;
  final String? sportName;
  final String? courtName;
  final int statusId;
  final String? statusName;
  final bool isActive;

  CourtResponse({
    required this.courtId,
    required this.facilityId,
    this.facilityName,
    required this.sportId,
    this.sportName,
    this.courtName,
    required this.statusId,
    this.statusName,
    required this.isActive,
  });

  factory CourtResponse.fromJson(Map<String, dynamic> json) {
    return CourtResponse(
      courtId: json['courtId'] as int? ?? 0,
      facilityId: json['facilityId'] as int? ?? 0,
      facilityName: json['facilityName'] as String?,
      sportId: json['sportId'] as int? ?? 0,
      sportName: json['sportName'] as String?,
      courtName: json['courtName'] as String?,
      statusId: json['statusId'] as int? ?? 0,
      statusName: json['statusName'] as String?,
      isActive: json['isActive'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'courtId': courtId,
      'facilityId': facilityId,
      'facilityName': facilityName,
      'sportId': sportId,
      'sportName': sportName,
      'courtName': courtName,
      'statusId': statusId,
      'statusName': statusName,
      'isActive': isActive,
    };
  }
}

class SportPriceSummary {
  final int sportId;
  final String sportName;
  final double minPrice;
  final double maxPrice;

  SportPriceSummary({
    required this.sportId,
    required this.sportName,
    required this.minPrice,
    required this.maxPrice,
  });

  factory SportPriceSummary.fromJson(Map<String, dynamic> json) {
    return SportPriceSummary(
      sportId: json['sportId'] as int? ?? 0,
      sportName: json['sportName'] as String? ?? '',
      minPrice: (json['minPrice'] as num?)?.toDouble() ?? 0.0,
      maxPrice: (json['maxPrice'] as num?)?.toDouble() ?? 0.0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'sportId': sportId,
      'sportName': sportName,
      'minPrice': minPrice,
      'maxPrice': maxPrice,
    };
  }
}

class FacilityResponse {
  final int facilityId;
  final String? ownerId;
  final String? ownerName;
  final String? name;
  final String? city;
  final String? district;
  final String? address;
  final int courtCount;
  final double? latitude;
  final double? longitude;
  final double? distanceKm;
  final String? businessCode;
  final int statusId;
  final String? statusName;
  final DateTime? createdAt;
  final List<SportPriceSummary> sportPrices;

  FacilityResponse({
    required this.facilityId,
    this.ownerId,
    this.ownerName,
    this.name,
    this.city,
    this.district,
    this.address,
    required this.courtCount,
    this.latitude,
    this.longitude,
    this.distanceKm,
    this.businessCode,
    required this.statusId,
    this.statusName,
    this.createdAt,
    required this.sportPrices,
  });

  factory FacilityResponse.fromJson(Map<String, dynamic> json) {
    return FacilityResponse(
      facilityId: json['facilityId'] as int? ?? 0,
      ownerId: json['ownerId'] as String?,
      ownerName: json['ownerName'] as String?,
      name: json['name'] as String?,
      city: json['city'] as String?,
      district: json['district'] as String?,
      address: json['address'] as String?,
      courtCount: json['courtCount'] as int? ?? 0,
      latitude: (json['latitude'] as num?)?.toDouble(),
      longitude: (json['longitude'] as num?)?.toDouble(),
      distanceKm: (json['distanceKm'] as num?)?.toDouble(),
      businessCode: json['businessCode'] as String?,
      statusId: json['statusId'] as int? ?? 0,
      statusName: json['statusName'] as String?,
      createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt'] as String) : null,
      sportPrices: (json['sportPrices'] as List<dynamic>?)
              ?.map((item) => SportPriceSummary.fromJson(item as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'facilityId': facilityId,
      'ownerId': ownerId,
      'ownerName': ownerName,
      'name': name,
      'city': city,
      'district': district,
      'address': address,
      'courtCount': courtCount,
      'latitude': latitude,
      'longitude': longitude,
      'distanceKm': distanceKm,
      'businessCode': businessCode,
      'statusId': statusId,
      'statusName': statusName,
      'createdAt': createdAt?.toIso8601String(),
      'sportPrices': sportPrices.map((x) => x.toJson()).toList(),
    };
  }
}

class TimeSlotStatus {
  final String startTime;
  final String endTime;
  final double cost;
  final String status;
  final String? bookingId;
  final String? bookedByUserName;

  TimeSlotStatus({
    required this.startTime,
    required this.endTime,
    required this.cost,
    required this.status,
    this.bookingId,
    this.bookedByUserName,
  });

  factory TimeSlotStatus.fromJson(Map<String, dynamic> json) {
    return TimeSlotStatus(
      startTime: json['startTime'] as String? ?? '',
      endTime: json['endTime'] as String? ?? '',
      cost: (json['cost'] as num?)?.toDouble() ?? 0.0,
      status: json['status'] as String? ?? 'Available',
      bookingId: json['bookingId'] as String?,
      bookedByUserName: json['bookedByUserName'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'startTime': startTime,
      'endTime': endTime,
      'cost': cost,
      'status': status,
      'bookingId': bookingId,
      'bookedByUserName': bookedByUserName,
    };
  }
}

class CourtAvailabilityResponse {
  final int courtId;
  final String courtName;
  final String sportName;
  final bool isActive;
  final List<TimeSlotStatus> timeSlots;

  CourtAvailabilityResponse({
    required this.courtId,
    required this.courtName,
    required this.sportName,
    required this.isActive,
    required this.timeSlots,
  });

  factory CourtAvailabilityResponse.fromJson(Map<String, dynamic> json) {
    return CourtAvailabilityResponse(
      courtId: json['courtId'] as int? ?? 0,
      courtName: json['courtName'] as String? ?? '',
      sportName: json['sportName'] as String? ?? '',
      isActive: json['isActive'] as bool? ?? false,
      timeSlots: (json['timeSlots'] as List<dynamic>?)
              ?.map((item) => TimeSlotStatus.fromJson(item as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'courtId': courtId,
      'courtName': courtName,
      'sportName': sportName,
      'isActive': isActive,
      'timeSlots': timeSlots.map((x) => x.toJson()).toList(),
    };
  }
}

class BatchBookingResponse {
  final List<BookingResponse> bookings;
  final String? paymentUrl;

  BatchBookingResponse({
    required this.bookings,
    this.paymentUrl,
  });

  factory BatchBookingResponse.fromJson(Map<String, dynamic> json) {
    return BatchBookingResponse(
      bookings: (json['bookings'] as List<dynamic>?)
              ?.map((item) => BookingResponse.fromJson(item as Map<String, dynamic>))
              .toList() ??
          [],
      paymentUrl: json['paymentUrl'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'bookings': bookings.map((x) => x.toJson()).toList(),
      'paymentUrl': paymentUrl,
    };
  }
}

