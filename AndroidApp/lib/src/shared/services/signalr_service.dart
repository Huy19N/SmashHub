import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:signalr_netcore/signalr_client.dart';
import '../network/api_config.dart';
import '../network/api_client.dart';
import 'notification_service.dart';

/// Service quản lý kết nối SignalR toàn cục cho ứng dụng
class SignalRService {
  SignalRService._();
  static final SignalRService instance = SignalRService._();

  HubConnection? _connection;
  HubConnection? get connection => _connection;
  bool get isConnected => _connection?.state == HubConnectionState.Connected;

  /// ID của nhóm chat hiện tại mà user đang mở màn hình chat (để tránh hiện notification)
  String? currentChatTeamId;

  /// StreamController để broadcast sự kiện có tin nhắn mới cho TeamChatScreen
  final _messageStreamController = StreamController<Map<String, dynamic>>.broadcast();
  Stream<Map<String, dynamic>> get messageStream => _messageStreamController.stream;

  /// StreamController để broadcast sự kiện cuộc gọi
  final _callEventStreamController = StreamController<Map<String, dynamic>>.broadcast();
  Stream<Map<String, dynamic>> get callEventStream => _callEventStreamController.stream;

  /// Khởi tạo và kết nối SignalR (Gọi sau khi đăng nhập thành công)
  Future<void> connect() async {
    if (isConnected) return;

    final token = ApiClient.accessToken ?? '';
    if (token.isEmpty) {
      debugPrint('[SignalRService] Cannot connect: Missing token');
      return;
    }

    try {
      _connection = HubConnectionBuilder()
          .withUrl(ApiConfig.chatHubUrl,
              options: HttpConnectionOptions(
                accessTokenFactory: () async => token,
              ))
          .withAutomaticReconnect()
          .build();

      // Đăng ký nhận sự kiện
      _connection!.on('ReceiveTeamMessage', _onReceiveTeamMessage);
      _connection!.on('MemberJoined', _onMemberJoined);
      _connection!.on('CallStarted', _onCallStarted);
      _connection!.on('CallEnded', _onCallEnded);
      // Có thể thêm các sự kiện khác: ScheduleCreated...

      await _connection!.start();
      debugPrint('[SignalRService] Connected successfully');
    } catch (e) {
      debugPrint('[SignalRService] Connection error: $e');
    }
  }

  /// Ngắt kết nối SignalR (Gọi khi đăng xuất)
  Future<void> disconnect() async {
    if (_connection != null) {
      await _connection!.stop();
      _connection = null;
      debugPrint('[SignalRService] Disconnected');
    }
  }

  /// Xử lý sự kiện khi có tin nhắn mới trong nhóm
  void _onReceiveTeamMessage(List<dynamic>? args) {
    if (args == null || args.isEmpty) return;

    try {
      final data = args[0] as Map<String, dynamic>;
      final teamId = data['teamId']?.toString();
      final senderName = data['senderName']?.toString() ?? 'Người dùng';
      final content = data['content']?.toString() ?? 'Tin nhắn hình ảnh/tệp đính kèm';
      final messageType = data['messageType'] as int?;

      // Nếu đang mở đúng màn hình chat của nhóm này thì KHÔNG hiện notification, chỉ gửi data qua stream
      if (currentChatTeamId == teamId) {
        _messageStreamController.add(data);
        return;
      }

      // Hiện local notification
      String notifyBody = content;
      if (messageType != null && messageType != 0) {
        notifyBody = '[Hình ảnh/Tệp tin]';
      }

      NotificationService.instance.showNotification(
        id: teamId.hashCode, // Dùng hash của teamId làm ID để các tin nhắn cùng nhóm gộp lại (tùy config Android)
        title: 'Tin nhắn mới từ $senderName',
        body: notifyBody,
        payload: teamId,
      );
    } catch (e) {
      debugPrint('[SignalRService] Error parsing ReceiveTeamMessage: $e');
    }
  }

  /// Xử lý sự kiện khi có thành viên mới tham gia nhóm
  void _onMemberJoined(List<dynamic>? args) {
    if (args == null || args.length < 4) return;

    try {
      final teamId = args[0]?.toString();
      final newUserName = args[2]?.toString() ?? 'Thành viên mới';
      final teamName = args[3]?.toString() ?? 'Nhóm';

      if (currentChatTeamId == teamId) {
        // Đang ở trong nhóm, có thể trigger refresh danh sách thành viên hoặc gửi một event riêng
        // Ở đây tạm bỏ qua, vì user sẽ thấy sự thay đổi nếu reload hoặc ta có thể fetch lại thông tin.
      }

      NotificationService.instance.showNotification(
        id: teamId.hashCode + 1, // Dùng ID khác với tin nhắn
        title: teamName,
        body: '$newUserName vừa tham gia nhóm!',
        payload: teamId,
      );
    } catch (e) {
      debugPrint('[SignalRService] Error parsing MemberJoined: $e');
    }
  }

  /// Xử lý sự kiện khi có cuộc gọi mới
  void _onCallStarted(List<dynamic>? args) {
    if (args == null || args.isEmpty) return;
    try {
      final roomId = args[0]?.toString();
      final callerId = args.length > 1 ? args[1]?.toString() : null;
      final teamId = roomId; // Trong hệ thống hiện tại, roomId thường trùng với teamId

      _callEventStreamController.add({'event': 'CallStarted', 'roomId': roomId, 'callerId': callerId});

      if (currentChatTeamId != teamId) {
        NotificationService.instance.showNotification(
          id: teamId.hashCode + 2,
          title: 'Cuộc gọi video nhóm',
          body: 'Đồng đội đang gọi video trong nhóm, hãy tham gia ngay!',
          payload: teamId,
        );
      }
    } catch (e) {
      debugPrint('[SignalRService] Error parsing CallStarted: $e');
    }
  }

  /// Xử lý sự kiện khi kết thúc cuộc gọi
  void _onCallEnded(List<dynamic>? args) {
    if (args == null || args.isEmpty) return;
    try {
      final roomId = args[0]?.toString();
      _callEventStreamController.add({'event': 'CallEnded', 'roomId': roomId});
    } catch (e) {
      debugPrint('[SignalRService] Error parsing CallEnded: $e');
    }
  }
}
