/// DTO gửi đi để yêu cầu tạo Câu lạc bộ (Team) mới.
class CreateTeamRequest {
  final String teamName;
  final String description;

  CreateTeamRequest({
    required this.teamName,
    required this.description,
  });

  Map<String, dynamic> toJson() {
    return {
      'teamName': teamName,
      'description': description,
    };
  }
}

/// DTO gửi đi để cập nhật thông tin Câu lạc bộ.
class UpdateTeamRequest {
  final String teamName;
  final String description;

  UpdateTeamRequest({
    required this.teamName,
    required this.description,
  });

  Map<String, dynamic> toJson() {
    return {
      'teamName': teamName,
      'description': description,
    };
  }
}

/// DTO phản hồi chứa thông tin rút gọn của Câu lạc bộ từ Backend.
class TeamResponse {
  final String teamId;
  final String teamName;
  final String description;
  final DateTime? createdAt;
  final bool isActive;
  final int memberCount;

  TeamResponse({
    required this.teamId,
    required this.teamName,
    required this.description,
    this.createdAt,
    required this.isActive,
    required this.memberCount,
  });

  factory TeamResponse.fromJson(Map<String, dynamic> json) {
    return TeamResponse(
      teamId: json['teamId'] as String? ?? '',
      teamName: json['teamName'] as String? ?? '',
      description: json['description'] as String? ?? '',
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'] as String)
          : null,
      isActive: json['isActive'] as bool? ?? false,
      memberCount: json['memberCount'] as int? ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'teamId': teamId,
      'teamName': teamName,
      'description': description,
      'createdAt': createdAt?.toIso8601String(),
      'isActive': isActive,
      'memberCount': memberCount,
    };
  }
}

/// DTO phản hồi chi tiết Thành viên trong Câu lạc bộ.
class TeamMemberResponse {
  final String userId;
  final String fullName;
  final String roleName;
  final int wins;
  final int losses;
  final DateTime? joinedAt;

  TeamMemberResponse({
    required this.userId,
    required this.fullName,
    required this.roleName,
    required this.wins,
    required this.losses,
    this.joinedAt,
  });

  factory TeamMemberResponse.fromJson(Map<String, dynamic> json) {
    return TeamMemberResponse(
      userId: json['userId'] as String? ?? '',
      fullName: json['fullName'] as String? ?? '',
      roleName: json['roleName'] as String? ?? '',
      wins: json['wins'] as int? ?? 0,
      losses: json['losses'] as int? ?? 0,
      joinedAt: json['joinedAt'] != null
          ? DateTime.parse(json['joinedAt'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'userId': userId,
      'fullName': fullName,
      'roleName': roleName,
      'wins': wins,
      'losses': losses,
      'joinedAt': joinedAt?.toIso8601String(),
    };
  }
}

/// DTO phản hồi thông tin chi tiết đầy đủ của Câu lạc bộ (bao gồm danh sách thành viên).
class TeamDetailResponse {
  final String teamId;
  final String teamName;
  final String description;
  final DateTime? createdAt;
  final bool isActive;
  final List<TeamMemberResponse> members;

  TeamDetailResponse({
    required this.teamId,
    required this.teamName,
    required this.description,
    this.createdAt,
    required this.isActive,
    required this.members,
  });

  factory TeamDetailResponse.fromJson(Map<String, dynamic> json) {
    final rawMembers = json['members'] as List<dynamic>? ?? [];
    final membersList = rawMembers
        .map((m) => TeamMemberResponse.fromJson(m as Map<String, dynamic>))
        .toList();

    return TeamDetailResponse(
      teamId: json['teamId'] as String? ?? '',
      teamName: json['teamName'] as String? ?? '',
      description: json['description'] as String? ?? '',
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'] as String)
          : null,
      isActive: json['isActive'] as bool? ?? false,
      members: membersList,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'teamId': teamId,
      'teamName': teamName,
      'description': description,
      'createdAt': createdAt?.toIso8601String(),
      'isActive': isActive,
      'members': members.map((m) => m.toJson()).toList(),
    };
  }
}
