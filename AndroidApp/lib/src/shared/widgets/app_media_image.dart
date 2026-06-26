import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../network/api_client.dart';

class AppMediaImage extends StatefulWidget {
  final String fileId;
  final BoxFit fit;
  final double? width;
  final double? height;
  final Widget? errorWidget;
  final Widget? placeholder;

  const AppMediaImage({
    super.key,
    required this.fileId,
    this.fit = BoxFit.cover,
    this.width,
    this.height,
    this.errorWidget,
    this.placeholder,
  });

  @override
  State<AppMediaImage> createState() => _AppMediaImageState();
}

class _AppMediaImageState extends State<AppMediaImage> {
  String? _imageUrl;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchImageUrl();
  }

  @override
  void didUpdateWidget(AppMediaImage oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.fileId != widget.fileId) {
      _fetchImageUrl();
    }
  }

  Future<void> _fetchImageUrl() async {
    if (widget.fileId.isEmpty) {
      if (mounted) setState(() => _isLoading = false);
      return;
    }
    
    if (mounted) setState(() => _isLoading = true);

    try {
      final apiClient = ApiClient();
      final res = await apiClient.get('/api/files/${widget.fileId}');
      
      if (mounted) {
        if (res.data != null && res.data['data'] != null && res.data['data']['url'] != null) {
          setState(() {
            _imageUrl = res.data['data']['url'] as String;
            _isLoading = false;
          });
        } else {
          setState(() => _isLoading = false);
        }
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return widget.placeholder ?? Container(
        width: widget.width,
        height: widget.height,
        color: Colors.transparent,
      );
    }

    if (_imageUrl == null || _imageUrl!.isEmpty) {
      return widget.errorWidget ?? Container(
        width: widget.width,
        height: widget.height,
        color: Colors.transparent,
      );
    }

    return CachedNetworkImage(
      imageUrl: _imageUrl!,
      fit: widget.fit,
      width: widget.width,
      height: widget.height,
      placeholder: (context, url) => widget.placeholder ?? Container(
        width: widget.width,
        height: widget.height,
        color: Colors.transparent,
      ),
      errorWidget: (context, url, error) => widget.errorWidget ?? Container(
        width: widget.width,
        height: widget.height,
        color: Colors.transparent,
      ),
    );
  }
}
