import 'package:flutter/material.dart';
import 'package:flutter_webrtc/flutter_webrtc.dart';
import 'package:signalr_netcore/signalr_client.dart';
import '../../../../shared/theme/app_theme.dart';
import '../../../../shared/network/api_config.dart';

import '../../../../shared/services/signalr_service.dart';
import 'dart:async';
import 'dart:convert';
import 'dart:developer' as developer;

class VideoCallScreen extends StatefulWidget {
  final String teamId;
  final String roomId;
  final bool isInitiator;

  const VideoCallScreen({
    super.key,
    required this.teamId,
    required this.roomId,
    required this.isInitiator,
  });

  @override
  State<VideoCallScreen> createState() => _VideoCallScreenState();
}

class _VideoCallScreenState extends State<VideoCallScreen> {
  MediaStream? _localStream;
  final Map<String, MediaStream> _remoteStreams = {};
  final Map<String, RTCPeerConnection> _peers = {};

  final RTCVideoRenderer _localRenderer = RTCVideoRenderer();
  final Map<String, RTCVideoRenderer> _remoteRenderers = {};

  HubConnection? _connection;

  bool _isAudioMuted = false;
  bool _isVideoMuted = false;
  bool _isConnecting = true;

  final Map<String, dynamic> _iceServers = ApiConfig.iceServers;
  StreamSubscription<Map<String, dynamic>>? _callEventSubscription;

  @override
  void initState() {
    super.initState();
    _initCall();

    _callEventSubscription = SignalRService.instance.callEventStream.listen((data) {
      if (mounted && data['event'] == 'CallEnded' && data['roomId'] == widget.roomId) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Cuộc gọi nhóm đã kết thúc.')),
        );
        _handleHangup();
      }
    });
  }

  Future<void> _initCall() async {
    await _localRenderer.initialize();

    try {
      // 1. Get local media with lower resolution to prevent lag
      _localStream = await navigator.mediaDevices.getUserMedia({
        'video': {
          'mandatory': {
            'minWidth': '480',
            'minHeight': '640',
            'minFrameRate': '30',
          },
          'facingMode': 'user',
          'optional': [],
        },
        'audio': true,
      });

      setState(() {
        _localRenderer.srcObject = _localStream;
      });

      // 2. Use existing SignalR Connection to reduce connection latency
      _connection = SignalRService.instance.connection;
      if (_connection == null || _connection!.state != HubConnectionState.Connected) {
        await SignalRService.instance.connect();
        _connection = SignalRService.instance.connection;
      }

      if (_connection == null) throw Exception("SignalR Connection failed");

      // 3. Register Events
      _connection!.on('UserJoinedCall', _onUserJoinedCall);
      _connection!.on('ReceiveSignal', _onReceiveSignal);
      _connection!.on('UserLeftCall', _onUserLeftCall);

      setState(() {
        _isConnecting = false;
      });

      // 4. Join room
      if (widget.isInitiator) {
        await _connection!.invoke('StartCall', args: [widget.teamId, widget.roomId]);
      } else {
        await _connection!.invoke('JoinCall', args: [widget.roomId]);
      }
    } catch (e) {
      developer.log('Error initializing call', error: e);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Lỗi khởi tạo video call. Vui lòng thử lại.')),
        );
        _handleHangup();
      }
    }
  }

  Future<void> _onUserJoinedCall(List<dynamic>? args) async {
    if (args == null || args.isEmpty) return;
    final String connId = args[0].toString();

    final peer = await _createPeer(connId);
    _peers[connId] = peer;

    final offer = await peer.createOffer();
    await peer.setLocalDescription(offer);

    await _connection!.invoke('SendSignal', args: [
      connId,
      jsonEncode({'type': 'offer', 'sdp': offer.toMap()})
    ]);
  }

  Future<void> _onReceiveSignal(List<dynamic>? args) async {
    if (args == null || args.length < 2) return;
    final String fromConnId = args[0].toString();
    final String signalDataRaw = args[1].toString();

    final signal = jsonDecode(signalDataRaw);
    RTCPeerConnection? peer = _peers[fromConnId];

    if (signal['type'] == 'offer') {
      if (peer == null) {
        peer = await _createPeer(fromConnId);
        _peers[fromConnId] = peer;
      }
      await peer.setRemoteDescription(
        RTCSessionDescription(signal['sdp']['sdp'], signal['sdp']['type']),
      );
      final answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);

      await _connection!.invoke('SendSignal', args: [
        fromConnId,
        jsonEncode({'type': 'answer', 'sdp': answer.toMap()})
      ]);
    } else if (signal['type'] == 'answer') {
      if (peer != null) {
        await peer.setRemoteDescription(
          RTCSessionDescription(signal['sdp']['sdp'], signal['sdp']['type']),
        );
      }
    } else if (signal['candidate'] != null) {
      if (peer != null) {
        final candidateMap = signal['candidate'];
        final candidate = RTCIceCandidate(
          candidateMap['candidate'],
          candidateMap['sdpMid'],
          candidateMap['sdpMLineIndex'],
        );
        await peer.addCandidate(candidate);
      }
    }
  }

  Future<void> _onUserLeftCall(List<dynamic>? args) async {
    if (args == null || args.isEmpty) return;
    final String connId = args[0].toString();

    if (_peers.containsKey(connId)) {
      await _peers[connId]!.close();
      _peers.remove(connId);
    }
    if (_remoteRenderers.containsKey(connId)) {
      final renderer = _remoteRenderers[connId]!;
      renderer.srcObject = null;
      await renderer.dispose();
      _remoteRenderers.remove(connId);
    }
    if (_remoteStreams.containsKey(connId)) {
      _remoteStreams.remove(connId);
    }
    if (mounted) setState(() {});
  }

  Future<RTCPeerConnection> _createPeer(String connId) async {
    final peer = await createPeerConnection(_iceServers);

    if (_localStream != null) {
      for (var track in _localStream!.getTracks()) {
        peer.addTrack(track, _localStream!);
      }
    }

    peer.onIceCandidate = (RTCIceCandidate candidate) {
      _connection!.invoke('SendSignal', args: [
        connId,
        jsonEncode({'candidate': candidate.toMap()})
      ]);
    };

    peer.onAddStream = (MediaStream stream) async {
      final renderer = RTCVideoRenderer();
      await renderer.initialize();
      renderer.srcObject = stream;

      setState(() {
        _remoteStreams[connId] = stream;
        _remoteRenderers[connId] = renderer;
      });
    };

    return peer;
  }

  void _toggleAudio() {
    if (_localStream != null) {
      final audioTracks = _localStream!.getAudioTracks();
      for (var track in audioTracks) {
        track.enabled = !track.enabled;
      }
      setState(() {
        _isAudioMuted = !_isAudioMuted;
      });
    }
  }

  void _toggleVideo() {
    if (_localStream != null) {
      final videoTracks = _localStream!.getVideoTracks();
      for (var track in videoTracks) {
        track.enabled = !track.enabled;
      }
      setState(() {
        _isVideoMuted = !_isVideoMuted;
      });
    }
  }

  Future<void> _handleHangup() async {
    if (_connection != null && _connection!.state == HubConnectionState.Connected) {
      try {
        await _connection!.invoke('LeaveCall', args: [widget.roomId]);
        // Bỏ đăng ký sự kiện để không bị trùng lặp khi vào lại phòng
        _connection!.off('UserJoinedCall', method: _onUserJoinedCall);
        _connection!.off('ReceiveSignal', method: _onReceiveSignal);
        _connection!.off('UserLeftCall', method: _onUserLeftCall);
        // KHÔNG TẮT (stop) KẾT NỐI VÌ ĐANG DÙNG CHUNG Ở SIGNALRSERVICE
      } catch (e) {
        developer.log('Error leaving call', error: e);
      }
    }

    if (_localStream != null) {
      for (var track in _localStream!.getTracks()) {
        track.stop();
      }
    }

    for (var peer in _peers.values) {
      await peer.close();
    }

    await _localRenderer.dispose();
    for (var renderer in _remoteRenderers.values) {
      await renderer.dispose();
    }

    if (mounted) {
      Navigator.of(context).pop();
    }
  }

  @override
  void dispose() {
    _callEventSubscription?.cancel();
    _handleHangup();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black87,
        iconTheme: const IconThemeData(color: Colors.white),
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: const BoxDecoration(
                color: Colors.green,
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.videocam_rounded, size: 16, color: Colors.white),
            ),
            const SizedBox(width: 8),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Cuộc gọi nhóm', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                Text(
                  '${_remoteStreams.length + 1} người',
                  style: const TextStyle(color: Colors.white70, fontSize: 12),
                ),
              ],
            ),
          ],
        ),
      ),
      body: SafeArea(
        child: Column(
          children: [
            if (_isConnecting)
              const Expanded(
                child: Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      CircularProgressIndicator(color: AppTheme.primaryColor),
                      SizedBox(height: 16),
                      Text('Đang kết nối...', style: TextStyle(color: Colors.white)),
                    ],
                  ),
                ),
              )
            else
              Expanded(
                child: _buildVideoGrid(),
              ),

            // Controls
            Container(
              padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
              color: Colors.black87,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  _buildControlButton(
                    icon: _isAudioMuted ? Icons.mic_off_rounded : Icons.mic_rounded,
                    color: _isAudioMuted ? Colors.redAccent : Colors.grey[800]!,
                    onPressed: _toggleAudio,
                  ),
                  _buildControlButton(
                    icon: Icons.call_end_rounded,
                    color: Colors.red,
                    iconSize: 32,
                    buttonSize: 64,
                    onPressed: _handleHangup,
                  ),
                  _buildControlButton(
                    icon: _isVideoMuted ? Icons.videocam_off_rounded : Icons.videocam_rounded,
                    color: _isVideoMuted ? Colors.redAccent : Colors.grey[800]!,
                    onPressed: _toggleVideo,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildVideoGrid() {
    final List<Widget> videoViews = [];

    // Local Video
    videoViews.add(
      _buildVideoContainer(
        renderer: _localRenderer,
        isLocal: true,
        isMuted: _isVideoMuted,
        label: 'Bạn ${(_isAudioMuted) ? '(Muted)' : ''}',
      ),
    );

    // Remote Videos
    _remoteRenderers.forEach((connId, renderer) {
      videoViews.add(
        _buildVideoContainer(
          renderer: renderer,
          isLocal: false,
          isMuted: false, // We don't have this state locally easily unless sent via signaling
          label: 'Đồng đội',
        ),
      );
    });

    if (videoViews.length == 1) {
      return videoViews[0];
    } else if (videoViews.length == 2) {
      return Column(
        children: videoViews.map((v) => Expanded(child: v)).toList(),
      );
    } else {
      return GridView.count(
        crossAxisCount: 2,
        mainAxisSpacing: 2,
        crossAxisSpacing: 2,
        children: videoViews,
      );
    }
  }

  Widget _buildVideoContainer({
    required RTCVideoRenderer renderer,
    required bool isLocal,
    required bool isMuted,
    required String label,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.grey[900],
        border: Border.all(color: Colors.white24, width: 0.5),
      ),
      child: Stack(
        fit: StackFit.expand,
        children: [
          if (isMuted)
            Center(
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.grey[800],
                  shape: BoxShape.circle,
                ),
                child: const Text('Bạn', style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
              ),
            )
          else
            RTCVideoView(
              renderer,
              objectFit: RTCVideoViewObjectFit.RTCVideoViewObjectFitCover,
              mirror: isLocal,
            ),
          Positioned(
            bottom: 8,
            left: 8,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: Colors.black54,
                borderRadius: BorderRadius.circular(4),
              ),
              child: Text(
                label,
                style: const TextStyle(color: Colors.white, fontSize: 12),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildControlButton({
    required IconData icon,
    required Color color,
    required VoidCallback onPressed,
    double iconSize = 24,
    double buttonSize = 56,
  }) {
    return GestureDetector(
      onTap: onPressed,
      child: Container(
        width: buttonSize,
        height: buttonSize,
        decoration: BoxDecoration(
          color: color,
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(
              color: Colors.black26,
              blurRadius: 8,
              offset: const Offset(0, 4),
            )
          ],
        ),
        child: Icon(icon, color: Colors.white, size: iconSize),
      ),
    );
  }
}
