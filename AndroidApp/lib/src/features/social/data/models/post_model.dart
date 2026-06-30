class PostModel {
  final String postId;
  final String authorUserId;
  final String authorName;
  final String? authorAvatarId;
  final int? facilityId;
  final String? facilityName;
  final String? teamId;
  final String? teamName;
  final int postType;
  final String content;
  final String? mediaFileId;
  final String? mediaUrl;
  final List<String> mediaFileIds;
  final bool isBoosted;
  final DateTime? createdAt;
  final DateTime? updatedAt;
  final int likeCount;
  final int commentCount;
  final bool isLikedByCurrentUser;

  PostModel({
    required this.postId,
    required this.authorUserId,
    required this.authorName,
    this.authorAvatarId,
    this.facilityId,
    this.facilityName,
    this.teamId,
    this.teamName,
    required this.postType,
    required this.content,
    this.mediaFileId,
    this.mediaUrl,
    this.mediaFileIds = const [],
    required this.isBoosted,
    this.createdAt,
    this.updatedAt,
    this.likeCount = 0,
    this.commentCount = 0,
    this.isLikedByCurrentUser = false,
  });

  factory PostModel.fromJson(Map<String, dynamic> json) {
    return PostModel(
      postId: json['postId'] ?? '',
      authorUserId: json['authorUserId'] ?? '',
      authorName: json['authorName'] ?? '',
      authorAvatarId: json['authorAvatarId'],
      facilityId: json['facilityId'],
      facilityName: json['facilityName'],
      teamId: json['teamId'],
      teamName: json['teamName'],
      postType: json['postType'] ?? 0,
      content: json['content'] ?? '',
      mediaFileId: json['mediaFileId'],
      mediaUrl: json['mediaUrl'],
      mediaFileIds: json['mediaFileIds'] != null
          ? (json['mediaFileIds'] as List).map((e) => e.toString()).toList()
          : [],
      isBoosted: json['isBoosted'] ?? false,
      createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt']) : null,
      updatedAt: json['updatedAt'] != null ? DateTime.parse(json['updatedAt']) : null,
      likeCount: json['likeCount'] ?? 0,
      commentCount: json['commentCount'] ?? 0,
      isLikedByCurrentUser: json['isLikedByCurrentUser'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'postId': postId,
      'authorUserId': authorUserId,
      'authorName': authorName,
      'authorAvatarId': authorAvatarId,
      'facilityId': facilityId,
      'facilityName': facilityName,
      'teamId': teamId,
      'teamName': teamName,
      'postType': postType,
      'content': content,
      'mediaFileId': mediaFileId,
      'mediaUrl': mediaUrl,
      'mediaFileIds': mediaFileIds,
      'isBoosted': isBoosted,
      'createdAt': createdAt?.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
      'likeCount': likeCount,
      'commentCount': commentCount,
      'isLikedByCurrentUser': isLikedByCurrentUser,
    };
  }

  PostModel copyWith({
    String? postId,
    String? authorUserId,
    String? authorName,
    String? authorAvatarId,
    int? facilityId,
    String? facilityName,
    String? teamId,
    String? teamName,
    int? postType,
    String? content,
    String? mediaFileId,
    String? mediaUrl,
    List<String>? mediaFileIds,
    bool? isBoosted,
    DateTime? createdAt,
    DateTime? updatedAt,
    int? likeCount,
    int? commentCount,
    bool? isLikedByCurrentUser,
  }) {
    return PostModel(
      postId: postId ?? this.postId,
      authorUserId: authorUserId ?? this.authorUserId,
      authorName: authorName ?? this.authorName,
      authorAvatarId: authorAvatarId ?? this.authorAvatarId,
      facilityId: facilityId ?? this.facilityId,
      facilityName: facilityName ?? this.facilityName,
      teamId: teamId ?? this.teamId,
      teamName: teamName ?? this.teamName,
      postType: postType ?? this.postType,
      content: content ?? this.content,
      mediaFileId: mediaFileId ?? this.mediaFileId,
      mediaUrl: mediaUrl ?? this.mediaUrl,
      mediaFileIds: mediaFileIds ?? this.mediaFileIds,
      isBoosted: isBoosted ?? this.isBoosted,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      likeCount: likeCount ?? this.likeCount,
      commentCount: commentCount ?? this.commentCount,
      isLikedByCurrentUser: isLikedByCurrentUser ?? this.isLikedByCurrentUser,
    );
  }
}
