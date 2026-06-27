import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../network/api_config.dart';

class AppMediaImage extends StatelessWidget {
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
  Widget build(BuildContext context) {
    if (fileId.isEmpty) {
      return errorWidget ?? Container(
        width: width,
        height: height,
        color: Colors.transparent,
      );
    }

    final imageUrl = ApiConfig.getFileUrl(fileId);

    if (imageUrl.isEmpty) {
      return errorWidget ?? Container(
        width: width,
        height: height,
        color: Colors.transparent,
      );
    }

    return CachedNetworkImage(
      imageUrl: imageUrl,
      fit: fit,
      width: width,
      height: height,
      placeholder: (context, url) => placeholder ?? Container(
        width: width,
        height: height,
        color: Colors.transparent,
      ),
      errorWidget: (context, url, error) => errorWidget ?? Container(
        width: width,
        height: height,
        color: Colors.transparent,
      ),
    );
  }
}

