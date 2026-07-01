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
  final String? avatarFileId;

  TeamMemberResponse({
    required this.userId,
    required this.fullName,
    required this.roleName,
    required this.wins,
    required this.losses,
    this.joinedAt,
    this.avatarFileId,
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
      avatarFileId: json['avatarFileId'] as String?,
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

/// DTO phản hồi tin nhắn trong Câu lạc bộ.
class TeamMessageResponse {
  final String messageId;
  final String teamId;
  final String senderId;
  final String content;
  final String? senderName;
  final int messageType;
  final String? mediaFileId;
  final String? mediaUrl;
  final DateTime? sentAt;
  final String? roomId;
  final bool isEnded;

  TeamMessageResponse({
    required this.messageId,
    required this.teamId,
    required this.senderId,
    required this.content,
    this.senderName,
    required this.messageType,
    this.mediaFileId,
    this.mediaUrl,
    this.sentAt,
    this.roomId,
    this.isEnded = false,
  });

  factory TeamMessageResponse.fromJson(Map<String, dynamic> json) {
    return TeamMessageResponse(
      messageId: json['messageId'] as String? ?? '',
      teamId: json['teamId'] as String? ?? '',
      senderId: json['senderId'] as String? ?? '',
      content: json['content'] as String? ?? '',
      senderName: json['senderName'] as String?,
      messageType: json['messageType'] as int? ?? 0,
      mediaFileId: json['mediaFileId'] as String?,
      mediaUrl: json['mediaUrl'] as String?,
      sentAt: json['sentAt'] != null
          ? DateTime.parse(json['sentAt'] as String)
          : null,
      roomId: json['roomId'] as String?,
      isEnded: json['isEnded'] as bool? ?? false,
    );
  }
}

/// DTO gửi đi để tạo tin nhắn mới.
class SendMessageRequest {
  final String teamId;
  final String content;
  final int messageType;
  final String? mediaFileId;

  SendMessageRequest({
    required this.teamId,
    required this.content,
    this.messageType = 0,
    this.mediaFileId,
  });

  Map<String, dynamic> toJson() {
    return {
      'teamId': teamId,
      'content': content,
      'messageType': messageType,
      'mediaFileId': mediaFileId,
    };
  }
}
