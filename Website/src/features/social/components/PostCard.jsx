import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Share2, MoreHorizontal, MapPin, Users, Flame } from 'lucide-react';
import toast from 'react-hot-toast';
import CommentSection from './CommentSection';
import MediaImage from '../../../components/ui/MediaImage';
import PostMediaGrid from './PostMediaGrid';
import PostLightbox from './PostLightbox';

const PostCard = ({ post, onToggleLike, isSinglePostView = false }) => {
  const navigate = useNavigate();
  const [showComments, setShowComments] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [lightboxData, setLightboxData] = useState({ isOpen: false, initialIndex: 0 });

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    await onToggleLike(post.postId, post.isLikedByCurrentUser);
    setIsLiking(false);
  };

  const handleShare = () => {
    const postUrl = `${window.location.origin}/social/post/${post.postId}`;
    if (navigator.share) {
      navigator.share({
        title: 'SmashHub Post',
        url: postUrl
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(postUrl);
      toast.success('Đã sao chép liên kết bài viết!');
    }
  };

  const getPostTypeBadge = (type) => {
    // Backend types: 1: FacilityPromo (Promotion), 2: TeamRecruitment (FindOpponent), 3: General (General)
    switch (type) {
      case 2:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-100 dark:border-amber-500/10">
            <Users className="w-3 h-3" /> Tìm đối thủ
          </span>
        );
      case 1:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-100 dark:border-blue-500/10">
            <MapPin className="w-3 h-3" /> Quảng cáo sân
          </span>
        );
      default:
        return null;
    }
  };

  const getFormattedTime = (dateString) => {
    if (!dateString) return 'Vừa xong';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHrs < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return `${diffMins > 0 ? diffMins : 1} phút trước`;
    }
    if (diffHrs < 24) {
      return `${diffHrs} giờ trước`;
    }
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getSubtextLocation = () => {
    const time = getFormattedTime(post.createdAt);
    if (post.postType === 1) {
      return `${time} • Quảng cáo`;
    }
    if (post.postType === 2) {
      return `${time} • Tìm đối thủ`;
    }
    return `${time} • ${post.facilityName || post.teamName || 'Quận 7, HCM'}`;
  };

  // Generate a mock views count based on post info
  const viewsCount = (post.content ? post.content.length * 13 + 87 : 124) % 1900 + 35;

  return (
    <div id={`post-${post.postId}`} className="bg-white dark:bg-card-dark rounded-3xl p-5 shadow-md border border-gray-150/40 dark:border-border-dark/40 hover:shadow-lg transition-all duration-300">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
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
            <Link to={`/social/post/${post.postId}`} className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 mt-0.5 hover:underline decoration-gray-400 block">
              {getSubtextLocation()}
            </Link>
          </div>
        </div>

        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 cursor-pointer">
          <MoreHorizontal className="w-4.5 h-4.5" />
        </button>
      </div>

      {/* Content */}
      <div className="mb-4">
        <p className="text-gray-800 dark:text-gray-200 text-[13px] whitespace-pre-wrap leading-relaxed">
          {post.content}
        </p>

        {/* Custom Promo Deal block for promotion posts */}
        {post.postType === 1 && (
          <div className="mt-3 p-3.5 bg-[#f0fdf4] dark:bg-primary/[0.03] border border-emerald-100/60 dark:border-primary/10 rounded-2xl flex items-start gap-3 shadow-inner">
            <div className="p-2 rounded-xl bg-emerald-500/10 dark:bg-primary/15 text-emerald-600 dark:text-primary shrink-0">
              <Flame className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-black bg-emerald-100 text-emerald-800 dark:bg-primary/20 dark:text-primary mb-1">
                HOT DEAL
              </span>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold font-label">
                Khuyến mãi cực hot săn liền tay.
              </p>
            </div>
          </div>
        )}

        {/* Render attached image(s) if any exist */}
        {post.mediaFileIds?.length > 0 ? (
          <div className="mt-3">
            <PostMediaGrid 
              mediaFileIds={post.mediaFileIds} 
              onImageClick={(index) => {
                if (isSinglePostView) {
                  setLightboxData({ isOpen: true, initialIndex: index });
                } else {
                  navigate(`/social/post/${post.postId}`);
                }
              }}
            />
          </div>
        ) : post.mediaFileId ? (
          <div 
            className="mt-3 rounded-2xl overflow-hidden border border-gray-150 dark:border-white/5 shadow-sm cursor-pointer hover:opacity-95 transition-opacity"
            onClick={() => {
              if (isSinglePostView) {
                setLightboxData({ isOpen: true, initialIndex: 0 });
              } else {
                navigate(`/social/post/${post.postId}`);
              }
            }}
          >
            <MediaImage fileId={post.mediaFileId} alt="Post media" className="w-full h-auto object-cover max-h-[350px]" />
          </div>
        ) : null}
      </div>

      {/* Interaction Counts */}
      <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 pb-3 border-b border-gray-100 dark:border-border-dark/40 mb-1">
        <div className="flex items-center gap-3.5">
          <button onClick={handleLike} className="flex items-center gap-1 hover:text-emerald-600 transition-colors">
            <Heart className={`w-4.5 h-4.5 ${post.isLikedByCurrentUser ? 'text-emerald-600 dark:text-primary fill-current' : ''}`} />
            <span>{post.likeCount || 0}</span>
          </button>

          <button onClick={() => setShowComments(!showComments)} className="flex items-center gap-1 hover:text-emerald-600 transition-colors">
            <MessageCircle className="w-4.5 h-4.5" />
            <span>{post.commentCount || 0}</span>
          </button>

          <button onClick={handleShare} className="flex items-center gap-1 hover:text-emerald-600 transition-colors">
            <Share2 className="w-4.5 h-4.5" />
            <span>Chia sẻ</span>
          </button>
        </div>

        <div className="text-[10px] font-bold text-gray-400">
          {viewsCount} lượt xem
        </div>
      </div>

      {/* Comments Area */}
      {showComments && (
        <CommentSection postId={post.postId} />
      )}

      {/* Full Screen Lightbox */}
      {lightboxData.isOpen && (
        <PostLightbox 
          post={post}
          initialIndex={lightboxData.initialIndex}
          onClose={() => setLightboxData({ isOpen: false, initialIndex: 0 })}
          onToggleLike={onToggleLike}
        />
      )}
    </div>
  );
};

export default PostCard;
