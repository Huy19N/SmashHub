import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, Heart, MessageCircle, Share2, MoreHorizontal, MapPin, Users, Flame } from 'lucide-react';
import MediaImage from '../../../components/ui/MediaImage';
import CommentSection from './CommentSection';

const PostLightbox = ({ post, initialIndex = 0, onClose, onToggleLike }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isLiking, setIsLiking] = useState(false);

  const mediaFileIds = post.mediaFileIds && post.mediaFileIds.length > 0 ? post.mediaFileIds : (post.mediaFileId ? [post.mediaFileId] : []);
  const count = mediaFileIds.length;

  useEffect(() => {
    // Prevent background scrolling when lightbox is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleNext = (e) => {
    e.stopPropagation();
    if (currentIndex < count - 1) setCurrentIndex(currentIndex + 1);
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    if (onToggleLike) {
      await onToggleLike(post.postId, post.isLikedByCurrentUser);
    }
    setIsLiking(false);
  };

  // Prevent clicks inside the panels from bubbling up to the backdrop
  const stopPropagation = (e) => e.stopPropagation();

  // Same badges logic from PostCard
  const getPostTypeBadge = (type) => {
    switch (type) {
      case 'FindOpponent':
        return <span className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 border border-orange-200 dark:border-orange-800/50"><Flame className="w-3 h-3" /> Tìm kèo</span>;
      case 'FindTeammate':
        return <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 border border-blue-200 dark:border-blue-800/50"><Users className="w-3 h-3" /> Tìm đồng đội</span>;
      default:
        return null;
    }
  };

  const getSubtextLocation = () => {
    const parts = [];
    if (post.createdAtText) parts.push(post.createdAtText);
    if (post.facilityName) parts.push(post.facilityName);
    return parts.length > 0 ? parts.join(' • ') : 'Vừa xong';
  };

  const viewsCount = (post.likeCount || 0) * 12 + (post.commentCount || 0) * 25 + 42; // Mock view count like in PostCard

  const lightboxContent = (
    <div className="fixed inset-0 z-[100] flex bg-black/95 animate-in fade-in duration-200" onClick={onClose}>
      
      {/* Left Panel - Image Carousel */}
      <div className="flex-1 flex flex-col relative h-full">
        {/* Close button top left */}
        <button 
          onClick={onClose}
          className="absolute top-4 left-4 z-10 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Carousel Content */}
        <div className="flex-1 flex items-center justify-center relative w-full h-full p-4" onClick={stopPropagation}>
          {count > 0 && (
            <MediaImage 
              fileId={mediaFileIds[currentIndex]} 
              alt={`Media ${currentIndex + 1}`}
              className="w-full h-full object-contain select-none"
            />
          )}

          {/* Prev Button */}
          {currentIndex > 0 && (
            <button 
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}

          {/* Next Button */}
          {currentIndex < count - 1 && (
            <button 
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          )}
        </div>
      </div>

      {/* Right Panel - Post Details & Comments */}
      <div className="w-[360px] md:w-[400px] h-full bg-white dark:bg-card-dark flex flex-col shrink-0 border-l border-gray-200 dark:border-white/10 shadow-2xl overflow-hidden" onClick={stopPropagation}>
        
        {/* Post Header */}
        <div className="p-4 border-b border-gray-100 dark:border-white/5 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex gap-3 items-center">
              <div className="h-10 w-10 shrink-0 rounded-full bg-emerald-50 dark:bg-primary/20 flex items-center justify-center overflow-hidden border border-emerald-100 dark:border-primary/10">
                {post.authorAvatarId ? (
                  <MediaImage
                    fileId={post.authorAvatarId}
                    alt={post.authorName || 'User'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-emerald-700 dark:text-primary font-bold text-sm">
                    {post.authorName?.charAt(0) || 'U'}
                  </span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-gray-900 dark:text-white text-[14px]">
                    {post.authorName || 'Người dùng'}
                  </h4>
                  {getPostTypeBadge(post.postType)}
                </div>
                <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 mt-0.5">
                  {getSubtextLocation()}
                </p>
              </div>
            </div>

            <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 cursor-pointer">
              <MoreHorizontal className="w-4.5 h-4.5" />
            </button>
          </div>

          <div className="mb-2">
            <p className="text-gray-800 dark:text-gray-200 text-[13px] whitespace-pre-wrap leading-relaxed max-h-[150px] overflow-y-auto custom-scrollbar">
              {post.content}
            </p>
          </div>
          
          {/* Interaction Counts */}
          <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-100 dark:border-white/5 mt-3">
            <div className="flex items-center gap-3.5">
              <button onClick={handleLike} className="flex items-center gap-1 hover:text-emerald-600 transition-colors">
                <Heart className={`w-4.5 h-4.5 ${post.isLikedByCurrentUser ? 'text-emerald-600 dark:text-primary fill-current' : ''}`} />
                <span>{post.likeCount || 0}</span>
              </button>

              <button className="flex items-center gap-1 hover:text-emerald-600 transition-colors">
                <MessageCircle className="w-4.5 h-4.5" />
                <span>{post.commentCount || 0}</span>
              </button>

              <button 
                onClick={() => {
                  const postUrl = `${window.location.origin}/social/post/${post.postId}`;
                  if (navigator.share) {
                    navigator.share({ title: 'SmashHub Post', url: postUrl }).catch(console.error);
                  } else {
                    navigator.clipboard.writeText(postUrl);
                  }
                }} 
                className="flex items-center gap-1 hover:text-emerald-600 transition-colors"
              >
                <Share2 className="w-4.5 h-4.5" />
                <span>Chia sẻ</span>
              </button>
            </div>

            <div className="text-[10px] font-bold text-gray-400">
              {viewsCount} lượt xem
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50 dark:bg-card-dark relative">
          <CommentSection postId={post.postId} />
        </div>

      </div>
    </div>
  );

  return createPortal(lightboxContent, document.body);
};

export default PostLightbox;
