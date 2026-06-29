class NotificationModel {
  final String notificationId;
  final String userId;
  final String title;
  final String content;
  final String notificationType;
  final String? relatedEntityId;
  final bool isRead;
  final DateTime? createdAt;

  NotificationModel({
    required this.notificationId,
    required this.userId,
    required this.title,
    required this.content,
    required this.notificationType,
    this.relatedEntityId,
    required this.isRead,
    this.createdAt,
  });

  factory NotificationModel.fromJson(Map<String, dynamic> json) {
    return NotificationModel(
      notificationId: json['notificationId'] ?? '',
      userId: json['userId'] ?? '',
      title: json['title'] ?? '',
      content: json['content'] ?? '',
      notificationType: json['notificationType'] ?? '',
      relatedEntityId: json['relatedEntityId'],
      isRead: json['isRead'] ?? false,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'notificationId': notificationId,
      'userId': userId,
      'title': title,
      'content': content,
      'notificationType': notificationType,
      'relatedEntityId': relatedEntityId,
      'isRead': isRead,
      'createdAt': createdAt?.toIso8601String(),
    };
  }
}
