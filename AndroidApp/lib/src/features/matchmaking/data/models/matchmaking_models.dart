/// DTO gửi đi để yêu cầu ghép đối thủ (Challenge) mới cho trận đấu.
class CreateMatchChallengeRequest {
  final String scheduleId;
  final String hostTeamId;
  final int sportId;
  final bool isCostSplit;
  final String? message;

  CreateMatchChallengeRequest({
    required this.scheduleId,
    required this.hostTeamId,
    required this.sportId,
    this.isCostSplit = true,
    this.message,
  });

  Map<String, dynamic> toJson() {
    return {
      'scheduleId': scheduleId,
      'hostTeamId': hostTeamId,
      'sportId': sportId,
      'isCostSplit': isCostSplit,
      'message': message,
    };
  }
}

/// DTO gửi đi để xin tham gia ghép đấu (đối thủ gửi).
class JoinMatchRequest {
  final String challengerTeamId;

  JoinMatchRequest({
    required this.challengerTeamId,
  });

  Map<String, dynamic> toJson() {
    return {
      'challengerTeamId': challengerTeamId,
    };
  }
}

/// DTO phản hồi thông tin chi tiết của tin ghép đấu (Match Challenge).
class MatchChallengeResponse {
  final String challengeId;
  final String scheduleId;
  final String scheduleTitle;
  final String hostTeamId;
  final String hostTeamName;
  final int sportId;
  final String sportName;
  final int statusId;
  final String statusName;
  final double totalCost;
  final bool isCostSplit;
  final String? message;
  final DateTime? createdAt;
  final String? facilityName;
  final String? courtName;
  final DateTime startTime;
  final DateTime endTime;

  MatchChallengeResponse({
    required this.challengeId,
    required this.scheduleId,
    required this.scheduleTitle,
    required this.hostTeamId,
    required this.hostTeamName,
    required this.sportId,
    required this.sportName,
    required this.statusId,
    required this.statusName,
    required this.totalCost,
    required this.isCostSplit,
    this.message,
    this.createdAt,
    this.facilityName,
    this.courtName,
    required this.startTime,
    required this.endTime,
  });

  factory MatchChallengeResponse.fromJson(Map<String, dynamic> json) {
    return MatchChallengeResponse(
      challengeId: json['challengeId'] as String? ?? '',
      scheduleId: json['scheduleId'] as String? ?? '',
      scheduleTitle: json['scheduleTitle'] as String? ?? '',
      hostTeamId: json['hostTeamId'] as String? ?? '',
      hostTeamName: json['hostTeamName'] as String? ?? '',
      sportId: json['sportId'] as int? ?? 0,
      sportName: json['sportName'] as String? ?? '',
      statusId: json['statusId'] as int? ?? 0,
      statusName: json['statusName'] as String? ?? '',
      totalCost: (json['totalCost'] as num?)?.toDouble() ?? 0.0,
      isCostSplit: json['isCostSplit'] as bool? ?? true,
      message: json['message'] as String?,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'] as String)
          : null,
      facilityName: json['facilityName'] as String?,
      courtName: json['courtName'] as String?,
      startTime: json['startTime'] != null
          ? DateTime.parse(json['startTime'] as String)
          : DateTime.now(),
      endTime: json['endTime'] != null
          ? DateTime.parse(json['endTime'] as String)
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'challengeId': challengeId,
      'scheduleId': scheduleId,
      'scheduleTitle': scheduleTitle,
      'hostTeamId': hostTeamId,
      'hostTeamName': hostTeamName,
      'sportId': sportId,
      'sportName': sportName,
      'statusId': statusId,
      'statusName': statusName,
      'totalCost': totalCost,
      'isCostSplit': isCostSplit,
      'message': message,
      'createdAt': createdAt?.toIso8601String(),
      'facilityName': facilityName,
      'courtName': courtName,
      'startTime': startTime.toIso8601String(),
      'endTime': endTime.toIso8601String(),
    };
  }
}

/// DTO phản hồi thông tin cơ sở thể thao có tin ghép đấu hoạt động để vẽ trên bản đồ.
class MatchChallengeMapResponse {
  final int facilityId;
  final String facilityName;
  final double? latitude;
  final double? longitude;
  final int activeChallengeCount;

  MatchChallengeMapResponse({
    required this.facilityId,
    required this.facilityName,
    this.latitude,
    this.longitude,
    required this.activeChallengeCount,
  });

  factory MatchChallengeMapResponse.fromJson(Map<String, dynamic> json) {
    return MatchChallengeMapResponse(
      facilityId: json['facilityId'] as int? ?? 0,
      facilityName: json['facilityName'] as String? ?? '',
      latitude: (json['latitude'] as num?)?.toDouble(),
      longitude: (json['longitude'] as num?)?.toDouble(),
      activeChallengeCount: json['activeChallengeCount'] as int? ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'facilityId': facilityId,
      'facilityName': facilityName,
      'latitude': latitude,
      'longitude': longitude,
      'activeChallengeCount': activeChallengeCount,
    };
  }
}

/// DTO phản hồi yêu cầu đăng ký tham gia giao lưu từ đội khách.
class MatchAcceptanceResponse {
  final String acceptanceId;
  final String challengeId;
  final String challengerTeamId;
  final String challengerTeamName;
  final int statusId;
  final String statusName;
  final DateTime? decidedAt;
  final DateTime? createdAt;

  MatchAcceptanceResponse({
    required this.acceptanceId,
    required this.challengeId,
    required this.challengerTeamId,
    required this.challengerTeamName,
    required this.statusId,
    required this.statusName,
    this.decidedAt,
    this.createdAt,
  });

  factory MatchAcceptanceResponse.fromJson(Map<String, dynamic> json) {
    return MatchAcceptanceResponse(
      acceptanceId: json['acceptanceId'] as String? ?? '',
      challengeId: json['challengeId'] as String? ?? '',
      challengerTeamId: json['challengerTeamId'] as String? ?? '',
      challengerTeamName: json['challengerTeamName'] as String? ?? '',
      statusId: json['statusId'] as int? ?? 0,
      statusName: json['statusName'] as String? ?? '',
      decidedAt: json['decidedAt'] != null
          ? DateTime.parse(json['decidedAt'] as String)
          : null,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'acceptanceId': acceptanceId,
      'challengeId': challengeId,
      'challengerTeamId': challengerTeamId,
      'challengerTeamName': challengerTeamName,
      'statusId': statusId,
      'statusName': statusName,
      'decidedAt': decidedAt?.toIso8601String(),
      'createdAt': createdAt?.toIso8601String(),
    };
  }
}
