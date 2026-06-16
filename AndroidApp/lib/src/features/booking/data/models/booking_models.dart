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
