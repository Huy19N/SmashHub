import 'package:flutter/material.dart';
import '../../../../shared/theme/app_theme.dart';
import '../../../../shared/network/api_client.dart';
import '../../data/data_sources/community_remote_data_source.dart';
import '../../data/repositories/community_repository_impl.dart';
import '../controllers/messages_controller.dart';
import '../../../../shared/widgets/app_card.dart';

class MessagesScreen extends StatefulWidget {
  const MessagesScreen({super.key});

  @override
  State<MessagesScreen> createState() => _MessagesScreenState();
}

class _MessagesScreenState extends State<MessagesScreen> {
  late final MessagesController _controller;

  @override
  void initState() {
    super.initState();
    final apiClient = ApiClient();
    final dataSource = CommunityRemoteDataSource(apiClient);
    final repository = CommunityRepositoryImpl(dataSource);
    _controller = MessagesController(communityRepository: repository);

    _controller.addListener(_onControllerUpdate);
    _controller.fetchTeams();
  }

  void _onControllerUpdate() {
    if (mounted) setState(() {});
  }

  @override
  void dispose() {
    _controller.removeListener(_onControllerUpdate);
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'TIN NHẮN',
          style: TextStyle(fontWeight: FontWeight.w900),
        ),
      ),
      body: _controller.isLoading
          ? const Center(child: CircularProgressIndicator())
          : _controller.errorMessage != null
              ? Center(child: Text(_controller.errorMessage!))
              : _controller.teams.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.chat_bubble_outline_rounded,
                            size: 80,
                            color: AppTheme.primaryColor.withValues(alpha: 0.5),
                          ),
                          const SizedBox(height: 20),
                          const Text(
                            'Chưa có cuộc trò chuyện',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 10),
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 40.0),
                            child: Text(
                              'Bạn chưa tham gia câu lạc bộ nào. Hãy tham gia hoặc tạo nhóm để bắt đầu trò chuyện!',
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                color: isDark ? Colors.grey[400] : Colors.grey[600],
                              ),
                            ),
                          ),
                        ],
                      ),
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      itemCount: _controller.teams.length,
                      itemBuilder: (context, index) {
                        final team = _controller.teams[index];
                        return InkWell(
                          onTap: () {
                            // Chuyển hướng đến chi tiết tin nhắn câu lạc bộ (Chưa hiện thực)
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Tính năng chat đang được phát triển!')),
                            );
                          },
                          child: Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                            child: Row(
                              children: [
                                // Avatar
                                Container(
                                  width: 56,
                                  height: 56,
                                  decoration: BoxDecoration(
                                    color: AppTheme.primaryColor.withValues(alpha: 0.1),
                                    shape: BoxShape.circle,
                                  ),
                                  alignment: Alignment.center,
                                  child: Text(
                                    team.teamName.isNotEmpty ? team.teamName.substring(0, 1).toUpperCase() : 'C',
                                    style: const TextStyle(
                                      fontSize: 20,
                                      fontWeight: FontWeight.bold,
                                      color: AppTheme.primaryColor,
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 16),
                                
                                // Info
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        children: [
                                          Expanded(
                                            child: Text(
                                              team.teamName,
                                              style: const TextStyle(
                                                fontWeight: FontWeight.bold,
                                                fontSize: 16,
                                              ),
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                          ),
                                          const Text(
                                            'Vừa xong',
                                            style: TextStyle(
                                              fontSize: 12,
                                              color: Colors.grey,
                                            ),
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 4),
                                      Row(
                                        children: [
                                          Expanded(
                                            child: Text(
                                              team.description.isNotEmpty ? team.description : 'Câu lạc bộ mới được tạo!',
                                              style: TextStyle(
                                                fontSize: 14,
                                                color: isDark ? Colors.white70 : Colors.black87,
                                              ),
                                              maxLines: 1,
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                          ),
                                          if (team.memberCount > 0)
                                            Container(
                                              padding: const EdgeInsets.all(4),
                                              margin: const EdgeInsets.only(left: 8),
                                              decoration: const BoxDecoration(
                                                color: AppTheme.primaryColor,
                                                shape: BoxShape.circle,
                                              ),
                                              child: Text(
                                                team.memberCount.toString(),
                                                style: const TextStyle(
                                                  color: Colors.white,
                                                  fontSize: 10,
                                                  fontWeight: FontWeight.bold,
                                                ),
                                              ),
                                            ),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
    );
  }
}
