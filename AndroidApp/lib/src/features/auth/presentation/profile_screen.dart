import 'package:flutter/material.dart';
import '../../../shared/theme/app_theme.dart';
import '../../../shared/widgets/app_button.dart';
import '../../../shared/widgets/app_card.dart';
import '../../../shared/widgets/app_badge.dart';
import '../../../shared/widgets/app_dropdown.dart';

import '../../../shared/network/api_client.dart';
import '../data/data_sources/profile_remote_data_source.dart';
import '../data/repositories/profile_repository_impl.dart';
import '../presentation/controllers/profile_controller.dart';

class ProfileScreen extends StatefulWidget {
  final bool isEmbedded;
  const ProfileScreen({super.key, this.isEmbedded = false});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  late final ProfileController _controller;

  // General User Information
  bool _isEditingInfo = false;
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _nameController;
  late TextEditingController _phoneController;

  // Sport levels state
  final List<SportItem> _availableSports = [
    SportItem(id: 1, name: 'Cầu Lông'),
    SportItem(id: 2, name: 'Bóng Bàn'),
    SportItem(id: 3, name: 'Pickleball'),
  ];

  final List<SportLevelItem> _sportLevels = [
    SportLevelItem(rankValue: 1, name: 'Cơ bản'),
    SportLevelItem(rankValue: 2, name: 'Nâng cao'),
    SportLevelItem(rankValue: 3, name: 'Tuyển thủ'),
  ];

  // Editing state for inline sport profiles
  int? _editingSportId;
  int? _editingRankValue;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController();
    _phoneController = TextEditingController();

    final apiClient = ApiClient();
    final dataSource = ProfileRemoteDataSource(apiClient);
    final repository = ProfileRepositoryImpl(dataSource);
    _controller = ProfileController(profileRepository: repository);
    
    _controller.addListener(_onControllerUpdate);
    _controller.fetchProfileData();
  }

  void _onControllerUpdate() {
    if (mounted) {
      setState(() {
        if (_controller.userProfile != null) {
          _nameController.text = _controller.userProfile!.fullName;
          _phoneController.text = _controller.userProfile!.phoneNumber;
        }
      });
    }
  }

  @override
  void dispose() {
    _controller.removeListener(_onControllerUpdate);
    _controller.dispose();
    _nameController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  // Handle saving general user info changes
  Future<void> _handleSaveInfo() async {
    if (!_formKey.currentState!.validate()) return;

    final success = await _controller.updateProfile(
      _nameController.text,
      _phoneController.text,
    );

    if (success) {
      setState(() {
        _isEditingInfo = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Cập nhật thông tin cá nhân thành công!')),
        );
      }
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(_controller.errorMessage ?? 'Cập nhật thất bại')),
      );
    }
  }

  // Handle deleting a sport level profile
  void _handleDeleteSport(int sportId, String sportName) {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: Text(
            'Xóa trình độ',
            style: TextStyle(
              fontWeight: FontWeight.bold,
              color: Theme.of(context).brightness == Brightness.dark
                  ? Colors.white
                  : Colors.black,
            ),
          ),
          content: Text('Bạn có chắc chắn muốn xóa trình độ môn $sportName?'),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Hủy', style: TextStyle(color: Colors.grey)),
            ),
            TextButton(
              onPressed: () async {
                Navigator.of(context).pop();
                final success = await _controller.deleteSportProfile(sportId);
                if (success && mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Đã xóa trình độ môn $sportName.')),
                  );
                } else if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text(_controller.errorMessage ?? 'Xóa thất bại')),
                  );
                }
              },
              child: const Text(
                'Xóa',
                style: TextStyle(
                  color: Colors.red,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        );
      },
    );
  }

  // Handle saving inline level edit
  Future<void> _handleUpdateSportLevel(int sportId) async {
    if (_editingRankValue == null) return;

    final success = await _controller.updateSportRank(sportId, _editingRankValue!);

    if (success) {
      setState(() {
        _editingSportId = null;
        _editingRankValue = null;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Cập nhật cấp độ chơi thành công!')),
        );
      }
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(_controller.errorMessage ?? 'Cập nhật thất bại')),
      );
    }
  }

  // Handle adding new sport profile
  void _showAddSportBottomSheet() {
    int? selectedSportId;
    int? selectedRankValue;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            final profiles = _controller.sportProfiles ?? [];
            final undeclaredSports = _availableSports
                .where(
                  (sport) => !profiles.any(
                    (profile) => profile.sportId == sport.id,
                  ),
                )
                .toList();

            return Container(
              decoration: BoxDecoration(
                color: Theme.of(context).brightness == Brightness.dark
                    ? AppTheme.darkSurfaceColor
                    : Colors.white,
                borderRadius: const BorderRadius.vertical(
                  top: Radius.circular(28),
                ),
              ),
              padding: EdgeInsets.only(
                left: 24,
                right: 24,
                top: 24,
                bottom: MediaQuery.of(context).viewInsets.bottom + 24,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Khai báo trình độ mới',
                            style: Theme.of(context).textTheme.titleLarge
                                ?.copyWith(fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 4),
                          const Text(
                            'Thêm một môn chơi cùng cấp độ vào hồ sơ',
                            style: TextStyle(fontSize: 12, color: Colors.grey),
                          ),
                        ],
                      ),
                      IconButton(
                        onPressed: () => Navigator.of(context).pop(),
                        icon: const Icon(Icons.close_rounded),
                        constraints: const BoxConstraints(
                          minWidth: 48,
                          minHeight: 48,
                        ), // touch target
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),

                  // Step 1: Select Sport
                  const Text(
                    '1. Chọn môn thể thao',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: Colors.grey,
                    ),
                  ),
                  const SizedBox(height: 8),
                  AppDropdown<int>(
                    value: selectedSportId,
                    labelText: 'Chọn môn thể thao',
                    items: undeclaredSports.map((s) {
                      return DropdownMenuItem<int>(
                        value: s.id,
                        child: Text(s.name),
                      );
                    }).toList(),
                    onChanged: (val) {
                      setModalState(() {
                        selectedSportId = val;
                        selectedRankValue = null; // Reset rank selection
                      });
                    },
                  ),
                  const SizedBox(height: 20),

                  // Step 2: Select Level (Only visible when sport is selected)
                  if (selectedSportId != null) ...[
                    const Text(
                      '2. Chọn trình độ của bạn',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: Colors.grey,
                      ),
                    ),
                    const SizedBox(height: 8),
                    AppDropdown<int>(
                      value: selectedRankValue,
                      labelText: 'Chọn trình độ chơi',
                      items: _sportLevels.map((l) {
                        return DropdownMenuItem<int>(
                          value: l.rankValue,
                          child: Text('${l.name} (Rank: ${l.rankValue})'),
                        );
                      }).toList(),
                      onChanged: (val) {
                        setModalState(() {
                          selectedRankValue = val;
                        });
                      },
                    ),
                    const SizedBox(height: 24),
                  ],

                  // Actions
                  Row(
                    children: [
                      Expanded(
                        child: AppButton(
                          onPressed:
                              (selectedSportId != null &&
                                  selectedRankValue != null)
                              ? () async {
                                  final sportName = _availableSports
                                      .firstWhere(
                                        (s) => s.id == selectedSportId,
                                      )
                                      .name;

                                  final success = await _controller.addSportProfile(
                                    selectedSportId!,
                                    selectedRankValue!,
                                  );

                                  if (success && mounted) {
                                    Navigator.of(context).pop();
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(
                                        content: Text(
                                          'Đã thêm trình độ môn $sportName.',
                                        ),
                                      ),
                                    );
                                  } else if (mounted) {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(content: Text(_controller.errorMessage ?? 'Thêm thất bại')),
                                    );
                                  }
                                }
                              : null,
                          text: 'Xác nhận thêm',
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: AppButton(
                          onPressed: () => Navigator.of(context).pop(),
                          text: 'Hủy',
                          type: AppButtonType.secondary,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final profiles = _controller.sportProfiles ?? [];
    final undeclaredSports = _availableSports
        .where(
          (sport) =>
              !profiles.any((profile) => profile.sportId == sport.id),
        )
        .toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Trang cá nhân',
          style: TextStyle(fontWeight: FontWeight.w900, letterSpacing: 1.0),
        ),
        leading: widget.isEmbedded
            ? null
            : IconButton(
                onPressed: () => Navigator.of(context).pop(),
                icon: const Icon(Icons.arrow_back_ios_new_rounded),
                constraints: const BoxConstraints(
                  minWidth: 48,
                  minHeight: 48,
                ), // Touch target
              ),
      ),
      body: _controller.isLoading && _controller.userProfile == null
          ? const Center(child: CircularProgressIndicator())
          : SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Hero Profile Card
              AppCard(
                padding: const EdgeInsets.all(24.0),
                backgroundColor: isDark ? null : Colors.white,
                child: Row(
                  children: [
                    // Avatar Badge (No Gradient)
                    Container(
                      width: 80,
                      height: 80,
                      decoration: const BoxDecoration(
                        shape: BoxShape.circle,
                        color: AppTheme.primaryColor,
                      ),
                      alignment: Alignment.center,
                      child: Text(
                        _controller.userProfile?.fullName.isNotEmpty == true
                            ? _controller.userProfile!.fullName.substring(0, 1).toUpperCase()
                            : 'U',
                        style: const TextStyle(
                          fontSize: 28,
                          fontWeight: FontWeight.w900,
                          color: Colors.white,
                        ),
                      ),
                    ),
                    const SizedBox(width: 20),

                    // User identity info
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Flexible(
                                child: Text(
                                  _controller.userProfile?.fullName ?? 'Đang tải...',
                                  style: const TextStyle(
                                    fontSize: 20,
                                    fontWeight: FontWeight.w900,
                                    letterSpacing: 0.2,
                                  ),
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                              const SizedBox(width: 8),
                              AppBadge(
                                label: _controller.userProfile?.roleName ?? 'Thành viên',
                                icon: Icons.shield_outlined,
                                backgroundColor: isDark
                                    ? AppTheme.primaryColor.withValues(
                                        alpha: 0.1,
                                      )
                                    : AppTheme.primaryColor.withValues(
                                        alpha: 0.15,
                                      ),
                                textColor: isDark
                                    ? AppTheme.primaryColor
                                    : const Color(0xFF007E3A),
                              ),
                            ],
                          ),
                          const SizedBox(height: 6),
                          Row(
                            children: [
                              const Icon(
                                Icons.mail_outline_rounded,
                                size: 14,
                                color: Colors.grey,
                              ),
                              const SizedBox(width: 6),
                              Expanded(
                                child: Text(
                                  _controller.userProfile?.email ?? 'Chưa cập nhật',
                                  style: const TextStyle(
                                    color: Colors.grey,
                                    fontSize: 13,
                                  ),
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Text(
                            'Đã tham gia: ${_controller.userProfile?.createdAt != null ? _formatDate(_controller.userProfile!.createdAt!) : ''}',
                            style: TextStyle(
                              fontSize: 11,
                              color: isDark ? Colors.white38 : Colors.black38,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Layout grid for larger layout/mobile scroll
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Personal Info Section Card
                  AppCard(
                    backgroundColor: isDark ? null : Colors.white,
                    child: Form(
                      key: _formKey,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text(
                                'Thông tin cá nhân',
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              if (!_isEditingInfo)
                                TextButton.icon(
                                  onPressed: () {
                                    setState(() {
                                      _isEditingInfo = true;
                                      _nameController.text = _controller.userProfile?.fullName ?? '';
                                      _phoneController.text = _controller.userProfile?.phoneNumber ?? '';
                                    });
                                  },
                                  icon: const Icon(
                                    Icons.edit_rounded,
                                    size: 14,
                                  ),
                                  label: const Text('Chỉnh sửa'),
                                  style: TextButton.styleFrom(
                                    foregroundColor: AppTheme.primaryColor,
                                    minimumSize: const Size(
                                      48,
                                      48,
                                    ), // touch target
                                  ),
                                ),
                            ],
                          ),
                          const SizedBox(height: 16),

                          if (_isEditingInfo) ...[
                            // Edit Fields
                            TextFormField(
                              controller: _nameController,
                              decoration: const InputDecoration(
                                labelText: 'Tên hiển thị',
                                prefixIcon: Icon(Icons.person_outline_rounded),
                              ),
                              validator: (val) {
                                if (val == null || val.trim().isEmpty) {
                                  return 'Tên hiển thị không được để trống';
                                }
                                return null;
                              },
                            ),
                            const SizedBox(height: 16),
                            TextFormField(
                              initialValue: _controller.userProfile?.email ?? '',
                              decoration: const InputDecoration(
                                labelText: 'Email',
                                prefixIcon: Icon(Icons.mail_outline_rounded),
                              ),
                              enabled: false, // Read only as email is key login
                            ),
                            const SizedBox(height: 16),
                            TextFormField(
                              controller: _phoneController,
                              keyboardType: TextInputType.phone,
                              decoration: const InputDecoration(
                                labelText: 'Số điện thoại',
                                prefixIcon: Icon(Icons.phone_outlined),
                              ),
                            ),
                            const SizedBox(height: 24),

                            // Actions
                            Row(
                              children: [
                                Expanded(
                                  child: AppButton(
                                    onPressed: _handleSaveInfo,
                                    text: 'Lưu thay đổi',
                                    isLoading: _controller.isLoading,
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: AppButton(
                                    onPressed: () {
                                      setState(() {
                                        _isEditingInfo = false;
                                      });
                                    },
                                    text: 'Hủy',
                                    type: AppButtonType.secondary,
                                  ),
                                ),
                              ],
                            ),
                          ] else ...[
                            // Display Info Details
                            _buildInfoItem(
                              Icons.person_outline_rounded,
                              'Tên đầy đủ',
                              _controller.userProfile?.fullName ?? 'Đang tải...',
                            ),
                            const SizedBox(height: 16),
                            _buildInfoItem(
                              Icons.mail_outline_rounded,
                              'Địa chỉ email',
                              _controller.userProfile?.email ?? 'Chưa cập nhật',
                            ),
                            const SizedBox(height: 16),
                            _buildInfoItem(
                              Icons.phone_outlined,
                              'Số điện thoại',
                              _controller.userProfile?.phoneNumber.isNotEmpty == true
                                  ? _controller.userProfile!.phoneNumber
                                  : 'Chưa cập nhật',
                            ),
                          ],
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Sports Level (Taste Skill) Card
                  AppCard(
                    backgroundColor: isDark ? null : Colors.white,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Icon(
                                      Icons.fitness_center_rounded,
                                      size: 18,
                                      color: AppTheme.primaryColor,
                                    ),
                                    const SizedBox(width: 8),
                                    const Text(
                                      'Trình độ thể thao',
                                      style: TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 2),
                                const Text(
                                  'Độ tương thích khi ghép cặp, đặt sân giao lưu',
                                  style: TextStyle(
                                    fontSize: 10,
                                    color: Colors.grey,
                                  ),
                                ),
                              ],
                            ),
                            if (undeclaredSports.isNotEmpty &&
                                profiles.isNotEmpty)
                              TextButton.icon(
                                onPressed: _showAddSportBottomSheet,
                                icon: const Icon(Icons.add_rounded, size: 16),
                                label: const Text('Thêm môn'),
                                style: TextButton.styleFrom(
                                  foregroundColor: AppTheme.primaryColor,
                                  minimumSize: const Size(
                                    48,
                                    48,
                                  ), // touch target
                                ),
                              ),
                          ],
                        ),
                        const SizedBox(height: 20),

                        // List of profiles or empty state
                        if (profiles.isEmpty)
                          _buildEmptyState()
                        else ...[
                          ListView.separated(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            itemCount: profiles.length,
                            separatorBuilder: (context, index) =>
                                const SizedBox(height: 16),
                            itemBuilder: (context, index) {
                              final profile = profiles[index];
                              final isEditingThis =
                                  _editingSportId == profile.sportId;

                              return Container(
                                padding: const EdgeInsets.all(16),
                                decoration: BoxDecoration(
                                  color: isDark
                                      ? Colors.white.withValues(alpha: 0.03)
                                      : Colors.black.withValues(alpha: 0.02),
                                  borderRadius: BorderRadius.circular(16),
                                  border: Border.all(
                                    color: isDark
                                        ? Colors.white.withValues(alpha: 0.05)
                                        : Colors.black.withValues(alpha: 0.05),
                                    width: 1,
                                  ),
                                ),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      mainAxisAlignment:
                                          MainAxisAlignment.spaceBetween,
                                      children: [
                                        Row(
                                          children: [
                                            Container(
                                              padding: const EdgeInsets.all(8),
                                              decoration: BoxDecoration(
                                                color: AppTheme.primaryColor
                                                    .withValues(alpha: 0.1),
                                                borderRadius:
                                                    BorderRadius.circular(10),
                                              ),
                                              child: const Icon(
                                                Icons.trending_up_rounded,
                                                color: AppTheme.primaryColor,
                                                size: 16,
                                              ),
                                            ),
                                            const SizedBox(width: 12),
                                            Column(
                                              crossAxisAlignment:
                                                  CrossAxisAlignment.start,
                                              children: [
                                                Text(
                                                  profile.sportName,
                                                  style: const TextStyle(
                                                    fontWeight: FontWeight.bold,
                                                    fontSize: 14,
                                                  ),
                                                ),
                                                Text(
                                                  'Cập nhật: ${profile.updatedAt != null ? _formatDate(profile.updatedAt!) : 'Không rõ'}',
                                                  style: const TextStyle(
                                                    fontSize: 9,
                                                    color: Colors.grey,
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ],
                                        ),
                                        if (!isEditingThis)
                                          Row(
                                            children: [
                                              IconButton(
                                                onPressed: () {
                                                  setState(() {
                                                    _editingSportId =
                                                        profile.sportId;
                                                    _editingRankValue =
                                                        profile.rankValue;
                                                  });
                                                },
                                                icon: const Icon(
                                                  Icons.edit_outlined,
                                                  size: 16,
                                                ),
                                                color: Colors.grey,
                                                constraints:
                                                    const BoxConstraints(
                                                      minWidth: 48,
                                                      minHeight: 48,
                                                    ), // touch target
                                              ),
                                              IconButton(
                                                onPressed: () =>
                                                    _handleDeleteSport(
                                                      profile.sportId,
                                                      profile.sportName,
                                                    ),
                                                icon: const Icon(
                                                  Icons.delete_outline_rounded,
                                                  size: 16,
                                                ),
                                                color: Colors.red[300],
                                                constraints:
                                                    const BoxConstraints(
                                                      minWidth: 48,
                                                      minHeight: 48,
                                                    ), // touch target
                                              ),
                                            ],
                                          ),
                                      ],
                                    ),
                                    const SizedBox(height: 12),

                                    if (isEditingThis) ...[
                                      // Inline Level Selector dropdown
                                      AppDropdown<int>(
                                        value: _editingRankValue,
                                        labelText: 'Chọn cấp độ chơi',
                                        items: _sportLevels.map((l) {
                                          return DropdownMenuItem<int>(
                                            value: l.rankValue,
                                            child: Text(
                                              '${l.name} (Rank: ${l.rankValue})',
                                            ),
                                          );
                                        }).toList(),
                                        onChanged: (val) {
                                          setState(() {
                                            _editingRankValue = val;
                                          });
                                        },
                                      ),
                                      const SizedBox(height: 12),
                                      Row(
                                        children: [
                                          Expanded(
                                            child: AppButton(
                                              onPressed: () =>
                                                  _handleUpdateSportLevel(
                                                    profile.sportId,
                                                  ),
                                              text: 'Lưu',
                                              height: 40,
                                            ),
                                          ),
                                          const SizedBox(width: 8),
                                          Expanded(
                                            child: AppButton(
                                              onPressed: () {
                                                setState(() {
                                                  _editingSportId = null;
                                                  _editingRankValue = null;
                                                });
                                              },
                                              text: 'Hủy',
                                              type: AppButtonType.secondary,
                                              height: 40,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ] else ...[
                                      // Display Level Badge
                                      const Text(
                                        'Trình độ hiện tại',
                                        style: TextStyle(
                                          fontSize: 10,
                                          color: Colors.grey,
                                        ),
                                      ),
                                      const SizedBox(height: 4),
                                      AppBadge(
                                        label: profile.levelName,
                                        icon: Icons.emoji_events_rounded,
                                        backgroundColor: AppTheme.primaryColor,
                                        textColor: Colors.black,
                                      ),
                                    ],
                                  ],
                                ),
                              );
                            },
                          ),

                          // Notice banner if all active sports are declared
                          if (undeclaredSports.isEmpty) ...[
                            const SizedBox(height: 20),
                            Container(
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: AppTheme.primaryColor.withValues(
                                  alpha: 0.1,
                                ),
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(
                                  color: AppTheme.primaryColor.withValues(
                                    alpha: 0.2,
                                  ),
                                ),
                              ),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Icon(
                                    Icons.check_circle_outline_rounded,
                                    color: AppTheme.primaryColor,
                                    size: 20,
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Text(
                                      'Bạn đã khai báo đầy đủ trình độ cho toàn bộ các môn thể thao hoạt động trong hệ thống SmashHub!',
                                      style: TextStyle(
                                        fontSize: 11,
                                        color: isDark
                                            ? Colors.white70
                                            : Colors.black87,
                                        height: 1.4,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ],
                      ],
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  // Display Item Row Helper
  Widget _buildInfoItem(IconData icon, String label, String value) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 36,
          height: 36,
          decoration: BoxDecoration(
            color: isDark
                ? Colors.white.withValues(alpha: 0.05)
                : Colors.black.withValues(alpha: 0.03),
            borderRadius: BorderRadius.circular(10),
          ),
          alignment: Alignment.center,
          child: Icon(icon, size: 18, color: Colors.grey),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: const TextStyle(
                  fontSize: 10,
                  color: Colors.grey,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                value,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  // Empty state widget
  Widget _buildEmptyState() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 32, horizontal: 16),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: Theme.of(context).brightness == Brightness.dark
              ? Colors.white10
              : Colors.black12,
          style: BorderStyle.solid,
        ),
      ),
      child: Column(
        children: [
          const Icon(Icons.emoji_events_outlined, size: 40, color: Colors.grey),
          const SizedBox(height: 12),
          const Text(
            'Chưa khai báo trình độ',
            style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 6),
          const Text(
            'Khai báo các bộ môn thể thao bạn chơi kèm trình độ để mọi người dễ dàng ghép cặp ghép sân khi tạo lịch trình giao lưu.',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 11, color: Colors.grey, height: 1.4),
          ),
          const SizedBox(height: 16),
          AppButton(
            onPressed: _showAddSportBottomSheet,
            text: 'Khai báo ngay',
            height: 40,
          ),
        ],
      ),
    );
  }

  String _formatDate(DateTime date) {
    return '${date.day.toString().padLeft(2, '0')}/${date.month.toString().padLeft(2, '0')}/${date.year}';
  }
}

class SportItem {
  final int id;
  final String name;

  SportItem({required this.id, required this.name});
}

class SportLevelItem {
  final int rankValue;
  final String name;

  SportLevelItem({required this.rankValue, required this.name});
}

class UserSportProfile {
  final int sportId;
  final String sportName;
  final int rankValue;
  final String levelName;
  final DateTime updatedAt;

  UserSportProfile({
    required this.sportId,
    required this.sportName,
    required this.rankValue,
    required this.levelName,
    required this.updatedAt,
  });
}
