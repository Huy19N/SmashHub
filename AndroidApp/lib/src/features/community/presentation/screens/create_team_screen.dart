import 'package:flutter/material.dart';
import '../../../../shared/theme/app_theme.dart';
import '../../../../shared/network/api_client.dart';
import '../../data/data_sources/community_remote_data_source.dart';
import '../../data/repositories/community_repository_impl.dart';
import '../../data/models/community_models.dart';

/// Giới hạn tối đa số thành viên trong mỗi nhóm (đồng bộ với Website).
const int _kMaxMembers = 20;

/// Giới hạn tối đa số ký tự cho tên nhóm.
const int _kMaxTeamNameLength = 255;

/// Màn hình tạo Nhóm / Câu lạc bộ mới.
/// Gọi API `POST /api/teams` qua lớp `CommunityRepository` đã có sẵn.
/// Sau khi tạo thành công sẽ pop quay về và truyền `true` qua Navigator.pop
/// để màn hình cha biết cần reload dữ liệu.
class CreateTeamScreen extends StatefulWidget {
  const CreateTeamScreen({super.key});

  @override
  State<CreateTeamScreen> createState() => _CreateTeamScreenState();
}

class _CreateTeamScreenState extends State<CreateTeamScreen> {
  // ── Controllers ───────────────────────────────────────────────
  final _formKey = GlobalKey<FormState>();
  final _teamNameController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _teamNameFocus = FocusNode();

  // ── State ─────────────────────────────────────────────────────
  bool _isLoading = false;
  String? _errorMessage;

  // ── Repository (khởi tạo theo pattern hiện có của project) ───
  late final CommunityRepositoryImpl _repository;

  @override
  void initState() {
    super.initState();
    final apiClient = ApiClient();
    final dataSource = CommunityRemoteDataSource(apiClient);
    _repository = CommunityRepositoryImpl(dataSource);
  }

  @override
  void dispose() {
    _teamNameController.dispose();
    _descriptionController.dispose();
    _teamNameFocus.dispose();
    super.dispose();
  }

  // ── Xử lý tạo nhóm ──────────────────────────────────────────
  Future<void> _handleCreateTeam() async {
    // Validate form trước khi gửi
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final request = CreateTeamRequest(
        teamName: _teamNameController.text.trim(),
        description: _descriptionController.text.trim(),
      );

      final response = await _repository.createTeam(request);

      if (!mounted) return;

      if (response.success && response.data != null) {
        // Thành công → Hiển thị thông báo và quay về danh sách nhóm
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'Nhóm "${response.data!.teamName}" đã được tạo thành công! 🎉',
            ),
            backgroundColor: AppTheme.primaryColor,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
        );
        // Pop và truyền `true` để báo hiệu cần reload danh sách
        Navigator.of(context).pop(true);
      } else {
        // API trả về lỗi logic (success = false)
        setState(() {
          _errorMessage = response.message.isNotEmpty
              ? response.message
              : 'Không thể tạo nhóm. Vui lòng thử lại.';
        });
      }
    } catch (e) {
      // Lỗi mạng hoặc ngoại lệ không mong muốn
      if (mounted) {
        setState(() {
          _errorMessage = 'Lỗi kết nối. Vui lòng kiểm tra mạng và thử lại.';
        });
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  // ── Giao diện ─────────────────────────────────────────────────
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Tạo nhóm mới',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // ── Icon minh hoạ ở trên cùng ──────────────────
                Center(
                  child: Container(
                    width: 80,
                    height: 80,
                    decoration: BoxDecoration(
                      color: AppTheme.primaryColor.withValues(alpha: 0.12),
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: AppTheme.primaryColor.withValues(alpha: 0.3),
                        width: 2,
                      ),
                    ),
                    child: const Icon(
                      Icons.groups_rounded,
                      size: 40,
                      color: AppTheme.primaryColor,
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                Center(
                  child: Text(
                    'Xây dựng đội nhóm của riêng bạn',
                    style: TextStyle(
                      fontSize: 14,
                      color: isDark ? Colors.grey[400] : Colors.grey[600],
                    ),
                  ),
                ),
                const SizedBox(height: 32),

                // ── Hiển thị lỗi nếu có ────────────────────────
                if (_errorMessage != null) ...[
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: isDark
                          ? Colors.red.withValues(alpha: 0.1)
                          : Colors.red.withValues(alpha: 0.06),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: isDark
                            ? Colors.red.withValues(alpha: 0.3)
                            : Colors.red.withValues(alpha: 0.2),
                      ),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          Icons.error_outline_rounded,
                          color: isDark ? Colors.redAccent : Colors.red[700],
                          size: 20,
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            _errorMessage!,
                            style: TextStyle(
                              fontSize: 13,
                              color: isDark ? Colors.redAccent : Colors.red[700],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),
                ],

                // ── Trường nhập Tên nhóm (bắt buộc) ───────────
                Text(
                  'Tên nhóm',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: isDark ? Colors.grey[200] : Colors.grey[800],
                  ),
                ),
                const SizedBox(height: 2),
                Row(
                  children: [
                    Text(
                      'Bắt buộc',
                      style: TextStyle(
                        fontSize: 11,
                        color: isDark ? Colors.redAccent[100] : Colors.red[400],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                TextFormField(
                  controller: _teamNameController,
                  focusNode: _teamNameFocus,
                  maxLength: _kMaxTeamNameLength,
                  textInputAction: TextInputAction.next,
                  decoration: InputDecoration(
                    hintText: 'VD: Badminton Elite, Cầu Lông Thủ Đức...',
                    prefixIcon: const Icon(
                      Icons.group_outlined,
                      color: AppTheme.primaryColor,
                    ),
                    counterText: '', // Ẩn counter mặc định, dùng counter tự viết ở dưới
                  ),
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) {
                      return 'Tên nhóm không được để trống.';
                    }
                    if (value.length > _kMaxTeamNameLength) {
                      return 'Tên nhóm không được vượt quá $_kMaxTeamNameLength ký tự.';
                    }
                    return null;
                  },
                  onChanged: (_) => setState(() {}),
                ),
                const SizedBox(height: 4),
                Align(
                  alignment: Alignment.centerRight,
                  child: Text(
                    '${_teamNameController.text.length}/$_kMaxTeamNameLength ký tự',
                    style: TextStyle(
                      fontSize: 11,
                      color: isDark ? Colors.grey[500] : Colors.grey[500],
                    ),
                  ),
                ),
                const SizedBox(height: 20),

                // ── Trường nhập Mô tả (tùy chọn) ──────────────
                Text(
                  'Mô tả',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: isDark ? Colors.grey[200] : Colors.grey[800],
                  ),
                ),
                const SizedBox(height: 8),
                TextFormField(
                  controller: _descriptionController,
                  maxLines: 3,
                  textInputAction: TextInputAction.done,
                  decoration: const InputDecoration(
                    hintText: 'Mô tả ngắn về nhóm của bạn...',
                    prefixIcon: Padding(
                      padding: EdgeInsets.only(bottom: 48),
                      child: Icon(
                        Icons.description_outlined,
                        color: AppTheme.primaryColor,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 24),

                // ── Thông báo giới hạn thành viên ──────────────
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: AppTheme.primaryColor.withValues(alpha: 0.08),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: AppTheme.primaryColor.withValues(alpha: 0.2),
                    ),
                  ),
                  child: Row(
                    children: [
                      const Icon(
                        Icons.people_outline_rounded,
                        color: AppTheme.primaryColor,
                        size: 20,
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: RichText(
                          text: TextSpan(
                            style: TextStyle(
                              fontSize: 12,
                              color: isDark ? Colors.grey[300] : Colors.grey[700],
                            ),
                            children: const [
                              TextSpan(text: 'Giới hạn tối đa '),
                              TextSpan(
                                text: '$_kMaxMembers thành viên',
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  color: AppTheme.primaryColor,
                                ),
                              ),
                              TextSpan(text: ' mỗi nhóm.'),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 32),

                // ── Nút tạo nhóm ──────────────────────────────
                SizedBox(
                  height: 52,
                  child: ElevatedButton(
                    onPressed: _isLoading ? null : _handleCreateTeam,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primaryColor,
                      foregroundColor: Colors.white,
                      disabledBackgroundColor:
                          AppTheme.primaryColor.withValues(alpha: 0.5),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                      elevation: 2,
                    ),
                    child: _isLoading
                        ? const SizedBox(
                            width: 24,
                            height: 24,
                            child: CircularProgressIndicator(
                              color: Colors.white,
                              strokeWidth: 2.5,
                            ),
                          )
                        : const Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.group_add_rounded, size: 22),
                              SizedBox(width: 10),
                              Text(
                                'Tạo nhóm',
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
