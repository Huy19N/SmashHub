import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:dio/dio.dart';
import '../../../../shared/theme/app_theme.dart';
import '../../../../shared/network/api_client.dart';
import '../../../../shared/network/api_config.dart';
import '../../../auth/data/data_sources/profile_remote_data_source.dart';
import '../../../auth/data/repositories/profile_repository_impl.dart';
import '../../../auth/presentation/controllers/profile_controller.dart';
import '../../data/data_sources/social_remote_data_source.dart';
import '../../data/repositories/social_repository_impl.dart';

class CreatePostScreen extends StatefulWidget {
  const CreatePostScreen({super.key});

  @override
  State<CreatePostScreen> createState() => _CreatePostScreenState();
}

class _CreatePostScreenState extends State<CreatePostScreen> {
  final TextEditingController _contentController = TextEditingController();
  late final SocialRepositoryImpl _repository;
  late final ProfileController _profileController;

  bool _isLoading = false;
  bool _isProfileLoading = true;
  bool _isFacilityOwner = false;
  int _selectedPostType = 3; // Default: Thảo luận chung (3)

  final List<File> _selectedImages = [];
  final ImagePicker _picker = ImagePicker();

  @override
  void initState() {
    super.initState();
    final apiClient = ApiClient();
    _repository = SocialRepositoryImpl(SocialRemoteDataSource(apiClient));

    final profileRemoteDataSource = ProfileRemoteDataSource(apiClient);
    final profileRepository = ProfileRepositoryImpl(profileRemoteDataSource);
    _profileController = ProfileController(profileRepository: profileRepository);

    _loadUserProfile();
  }

  Future<void> _loadUserProfile() async {
    try {
      await _profileController.fetchProfileData();
      if (mounted) {
        setState(() {
          final role = _profileController.userProfile?.roleName;
          _isFacilityOwner = role != null && role.toLowerCase() == 'facilityowner';
          _isProfileLoading = false;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _isProfileLoading = false;
        });
      }
    }
  }

  @override
  void dispose() {
    _contentController.dispose();
    super.dispose();
  }

  Future<void> _pickImages() async {
    try {
      final List<XFile> images = await _picker.pickMultiImage(
        imageQuality: 80,
      );
      if (images.isNotEmpty) {
        setState(() {
          _selectedImages.addAll(images.map((img) => File(img.path)));
        });
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Lỗi khi mở thư viện ảnh.')),
      );
    }
  }

  void _removeImage(int index) {
    setState(() {
      _selectedImages.removeAt(index);
    });
  }

  Future<List<String>> _uploadImages() async {
    final List<String> fileIds = [];
    final apiClient = ApiClient();

    for (var imageFile in _selectedImages) {
      try {
        final fileName = imageFile.path.split('/').last;
        final formData = FormData.fromMap({
          'file': await MultipartFile.fromFile(imageFile.path, filename: fileName),
        });

        final response = await apiClient.post(
          '/api/files/upload?purpose=ChatMedia',
          data: formData,
          options: Options(
            headers: {'Content-Type': 'multipart/form-data'},
          ),
        );

        if (response.statusCode == 200 && response.data != null) {
          final data = response.data['data'];
          if (data != null && data['fileId'] != null) {
            fileIds.add(data['fileId'] as String);
          }
        }
      } catch (e) {
        debugPrint('Upload image error: $e');
      }
    }
    return fileIds;
  }

  Future<void> _submitPost() async {
    final content = _contentController.text.trim();
    if (content.isEmpty && _selectedImages.isEmpty) return;

    setState(() {
      _isLoading = true;
    });

    try {
      final mediaFileIds = await _uploadImages();
      final finalContent = content.isEmpty && mediaFileIds.isNotEmpty ? " " : content;

      final response = await _repository.createPost(
        content: finalContent,
        postType: _selectedPostType,
        mediaFileIds: mediaFileIds,
      );

      if (mounted) {
        setState(() {
          _isLoading = false;
        });

        if (response.success) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Đăng bài thành công!')),
          );
          Navigator.pop(context, true); // Reload community list
        } else {
          final errMsg = response.message.isEmpty ? 'Lỗi khi đăng bài' : response.message;
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(errMsg)),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Đã xảy ra lỗi không xác định')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final user = _profileController.userProfile;

    return Scaffold(
      backgroundColor: isDark ? AppTheme.darkBackgroundColor : AppTheme.lightBackgroundColor,
      appBar: AppBar(
        title: const Text('Tạo bài viết', style: TextStyle(fontWeight: FontWeight.bold)),
        centerTitle: true,
        backgroundColor: isDark ? AppTheme.darkSurfaceColor : Colors.white,
        elevation: 0.5,
        leading: IconButton(
          icon: const Icon(Icons.close_rounded),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 12, top: 10, bottom: 10),
            child: ElevatedButton(
              onPressed: _isLoading || _isProfileLoading ? null : _submitPost,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primaryColor,
                foregroundColor: Colors.black,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(20),
                ),
                padding: const EdgeInsets.symmetric(horizontal: 16),
                elevation: 0,
              ),
              child: const Text('Đăng', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ),
        ],
      ),
      body: _isProfileLoading
          ? const Center(child: CircularProgressIndicator())
          : Stack(
              children: [
                Column(
                  children: [
                    Expanded(
                      child: SingleChildScrollView(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // User Info and Topic Dropdown Selector
                            Row(
                              children: [
                                CircleAvatar(
                                  radius: 24,
                                  backgroundColor: AppTheme.primaryColor.withValues(alpha: 0.2),
                                  backgroundImage: user?.avatarFileId != null && user!.avatarFileId!.isNotEmpty
                                      ? NetworkImage(ApiClient().dio.options.baseUrl + ApiConfig.getFileUrl(user.avatarFileId!))
                                      : null,
                                  child: user?.avatarFileId == null || user!.avatarFileId!.isEmpty
                                      ? Text(
                                          user?.fullName.isNotEmpty == true ? user!.fullName[0].toUpperCase() : 'U',
                                          style: const TextStyle(
                                            color: AppTheme.primaryColor,
                                            fontWeight: FontWeight.bold,
                                            fontSize: 16,
                                          ),
                                        )
                                      : null,
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        user?.fullName ?? 'Người dùng',
                                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                                      ),
                                      const SizedBox(height: 4),
                                      // Custom Premium Topic Selector (DropdownButton)
                                      GestureDetector(
                                        onTap: () {
                                          _showTopicSelectorBottomSheet(context);
                                        },
                                        child: Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                          decoration: BoxDecoration(
                                            color: isDark ? Colors.grey[800] : Colors.grey[200],
                                            borderRadius: BorderRadius.circular(12),
                                          ),
                                          child: Row(
                                            mainAxisSize: MainAxisSize.min,
                                            children: [
                                              Icon(
                                                _getTopicIcon(_selectedPostType),
                                                size: 14,
                                                color: _getTopicColor(_selectedPostType),
                                              ),
                                              const SizedBox(width: 6),
                                              Text(
                                                _getTopicLabel(_selectedPostType),
                                                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                                              ),
                                              const SizedBox(width: 4),
                                              const Icon(Icons.arrow_drop_down, size: 16),
                                            ],
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 20),

                            // Content Editor
                            TextField(
                              controller: _contentController,
                              maxLines: null,
                              keyboardType: TextInputType.multiline,
                              style: const TextStyle(fontSize: 16, height: 1.4),
                              decoration: const InputDecoration(
                                hintText: 'Bạn đang nghĩ gì thế...',
                                border: InputBorder.none,
                              ),
                            ),
                            const SizedBox(height: 20),

                            // Selected Images Grid Preview
                            if (_selectedImages.isNotEmpty)
                              GridView.builder(
                                shrinkWrap: true,
                                physics: const NeverScrollableScrollPhysics(),
                                itemCount: _selectedImages.length,
                                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                                  crossAxisCount: 3,
                                  crossAxisSpacing: 8,
                                  mainAxisSpacing: 8,
                                ),
                                itemBuilder: (context, index) {
                                  return Stack(
                                    children: [
                                      Positioned.fill(
                                        child: ClipRRect(
                                          borderRadius: BorderRadius.circular(12),
                                          child: Image.file(
                                            _selectedImages[index],
                                            fit: BoxFit.cover,
                                          ),
                                        ),
                                      ),
                                      Positioned(
                                        top: 4,
                                        right: 4,
                                        child: GestureDetector(
                                          onTap: () => _removeImage(index),
                                          child: Container(
                                            padding: const EdgeInsets.all(4),
                                            decoration: const BoxDecoration(
                                              color: Colors.black54,
                                              shape: BoxShape.circle,
                                            ),
                                            child: const Icon(Icons.close, size: 16, color: Colors.white),
                                          ),
                                        ),
                                      ),
                                    ],
                                  );
                                },
                              ),
                          ],
                        ),
                      ),
                    ),

                    // Add Media Toolbar
                    Container(
                      padding: EdgeInsets.only(
                        left: 16,
                        right: 16,
                        top: 8,
                        bottom: MediaQuery.of(context).padding.bottom + 8,
                      ),
                      decoration: BoxDecoration(
                        color: isDark ? AppTheme.darkSurfaceColor : Colors.white,
                        border: Border(
                          top: BorderSide(color: Colors.grey.withValues(alpha: 0.2)),
                        ),
                      ),
                      child: Row(
                        children: [
                          const Text(
                            'Thêm vào bài viết của bạn',
                            style: TextStyle(fontWeight: FontWeight.bold, color: Colors.grey),
                          ),
                          const Spacer(),
                          IconButton(
                            icon: const Icon(Icons.image_outlined, color: Colors.green, size: 28),
                            onPressed: _pickImages,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                if (_isLoading)
                  Container(
                    color: Colors.black.withValues(alpha: 0.4),
                    child: const Center(child: CircularProgressIndicator()),
                  ),
              ],
            ),
    );
  }

  void _showTopicSelectorBottomSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return Container(
          padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Chọn chủ đề bài đăng',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),
              _buildTopicItem(3, context), // Thảo luận chung
              if (!_isFacilityOwner) _buildTopicItem(2, context), // Tìm đối thủ
              if (_isFacilityOwner) _buildTopicItem(1, context), // Quảng cáo sân
            ],
          ),
        );
      },
    );
  }

  Widget _buildTopicItem(int type, BuildContext context) {
    final isSelected = _selectedPostType == type;
    return ListTile(
      leading: Icon(_getTopicIcon(type), color: _getTopicColor(type)),
      title: Text(
        _getTopicLabel(type),
        style: TextStyle(
          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
        ),
      ),
      subtitle: Text(_getTopicSubtitle(type)),
      trailing: isSelected ? const Icon(Icons.check_circle, color: AppTheme.primaryColor) : null,
      onTap: () {
        setState(() {
          _selectedPostType = type;
        });
        Navigator.pop(context);
      },
    );
  }

  IconData _getTopicIcon(int type) {
    switch (type) {
      case 1:
        return Icons.campaign_rounded;
      case 2:
        return Icons.sports_tennis_rounded;
      default:
        return Icons.forum_rounded;
    }
  }

  Color _getTopicColor(int type) {
    switch (type) {
      case 1:
        return Colors.blue;
      case 2:
        return Colors.amber;
      default:
        return Colors.green;
    }
  }

  String _getTopicLabel(int type) {
    switch (type) {
      case 1:
        return 'Quảng cáo sân';
      case 2:
        return 'Tìm đối thủ';
      default:
        return 'Thảo luận chung';
    }
  }

  String _getTopicSubtitle(int type) {
    switch (type) {
      case 1:
        return 'Thông báo khuyến mãi, tiếp thị sân chơi (Chủ sân)';
      case 2:
        return 'Tìm người chơi, đối thủ ghép cặp thi đấu';
      default:
        return 'Chia sẻ ý kiến, thảo luận chung về thể thao';
    }
  }
}
