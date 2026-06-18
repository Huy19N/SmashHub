/// Lớp dữ liệu đại diện cho Banner quảng cáo trên Trang chủ.
class HomeBanner {
  final String id;
  final String title;
  final String subtitle;
  final String imageUrl;
  final String? actionButtonText;
  final String? actionUrl;

  HomeBanner({
    required this.id,
    required this.title,
    required this.subtitle,
    required this.imageUrl,
    this.actionButtonText,
    this.actionUrl,
  });

  factory HomeBanner.fromJson(Map<String, dynamic> json) {
    return HomeBanner(
      id: json['id'] as String? ?? '',
      title: json['title'] as String? ?? '',
      subtitle: json['subtitle'] as String? ?? '',
      imageUrl: json['imageUrl'] as String? ?? '',
      actionButtonText: json['actionButtonText'] as String?,
      actionUrl: json['actionUrl'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'subtitle': subtitle,
      'imageUrl': imageUrl,
      'actionButtonText': actionButtonText,
      'actionUrl': actionUrl,
    };
  }
}

/// Lớp dữ liệu đại diện cho bài viết cộng đồng (Community Post) trên Trang chủ.
/// Kết hợp dữ liệu từ Backend (các trận đấu cần ghép cặp hoặc nhóm thể thao) để hiển thị.
class CommunityPost {
  final String id;
  final String userAvatarUrl;
  final String userName;
  final String timeAgo;
  final String content;
  final String? featuredImageUrl;
  final int likeCount;
  final int commentCount;
  final int shareCount;
  final bool isLiked;
  final String? tag;

  CommunityPost({
    required this.id,
    required this.userAvatarUrl,
    required this.userName,
    required this.timeAgo,
    required this.content,
    this.featuredImageUrl,
    this.likeCount = 0,
    this.commentCount = 0,
    this.shareCount = 0,
    this.isLiked = false,
    this.tag,
  });

  factory CommunityPost.fromJson(Map<String, dynamic> json) {
    return CommunityPost(
      id: json['id'] as String? ?? '',
      userAvatarUrl: json['userAvatarUrl'] as String? ?? '',
      userName: json['userName'] as String? ?? '',
      timeAgo: json['timeAgo'] as String? ?? '',
      content: json['content'] as String? ?? '',
      featuredImageUrl: json['featuredImageUrl'] as String?,
      likeCount: json['likeCount'] as int? ?? 0,
      commentCount: json['commentCount'] as int? ?? 0,
      shareCount: json['shareCount'] as int? ?? 0,
      isLiked: json['isLiked'] as bool? ?? false,
      tag: json['tag'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userAvatarUrl': userAvatarUrl,
      'userName': userName,
      'timeAgo': timeAgo,
      'content': content,
      'featuredImageUrl': featuredImageUrl,
      'likeCount': likeCount,
      'commentCount': commentCount,
      'shareCount': shareCount,
      'isLiked': isLiked,
      'tag': tag,
    };
  }
}
