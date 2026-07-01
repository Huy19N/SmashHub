import { useState, useEffect } from 'react';
import { Send, UserCircle } from 'lucide-react';
import { useComments } from '../hooks/useSocial';
import { useGetUserId } from '../../Auth/hooks/useAuth';
import MediaImage from '../../../components/ui/MediaImage';
import { deleteCommentAPI } from '../api/social.api';
import toast from 'react-hot-toast';

const CommentSection = ({ postId }) => {
  const { user: apiUser } = useGetUserId();
  const { comments, isLoading, hasMore, fetchComments, addComment } = useComments(postId);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchComments(1, 5, true);
  }, [fetchComments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    const success = await addComment(content.trim());
    if (success) {
      setContent('');
    }
    setIsSubmitting(false);
  };

  const currentUserName = apiUser?.data?.fullName || localStorage.getItem('name') || 'User';
  const currentUserAvatarFileId = apiUser?.data?.avatarFileId;
  const currentUserId = apiUser?.data?.userId;
  const isAdmin = apiUser?.data?.roleId === 1;

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Bạn có chắc muốn xóa bình luận này?")) return;
    try {
      await deleteCommentAPI(commentId);
      toast.success("Đã xóa bình luận");
      fetchComments(1, 5, true); // reload comments
    } catch (error) {
      toast.error("Không thể xóa bình luận");
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-border-dark/40">
      {/* Comments List */}
      <div className="space-y-3 mb-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
        {isLoading && comments.length === 0 ? (
          <div className="flex justify-center py-4">
            <div className="h-5 w-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : comments.length > 0 ? (
          <>
            {comments.map((comment) => (
              <div key={comment.commentId} className="flex gap-3 text-sm">
                <div className="h-8 w-8 shrink-0 rounded-full bg-emerald-50 dark:bg-primary/10 flex items-center justify-center overflow-hidden">
                  {comment.userAvatarId ? (
                    <MediaImage 
                      fileId={comment.userAvatarId}
                      alt={comment.userName || 'User'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserCircle className="w-5 h-5 text-emerald-400 dark:text-primary/70" />
                  )}
                </div>
                <div className="flex-1 bg-gray-50 dark:bg-white/5 rounded-2xl rounded-tl-sm px-3.5 py-2.5 relative group">
                  <div className="flex items-baseline justify-between mb-0.5">
                    <span className="font-bold text-gray-900 dark:text-white text-[13px]">
                      {comment.userName || 'Người dùng'}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {new Date(comment.createdAt).toLocaleDateString('vi-VN', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-[13px]">
                    {comment.content}
                  </p>

                  {/* Delete button (visible on hover) */}
                  {(currentUserId === comment.userId || isAdmin) && (
                    <button
                      onClick={() => handleDeleteComment(comment.commentId)}
                      className="absolute -right-2 -top-2 bg-white dark:bg-gray-800 rounded-full p-1 shadow-sm border border-gray-100 dark:border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 text-gray-400"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
            {hasMore && (
              <button 
                onClick={() => fetchComments(1, comments.length + 5, true)}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-primary dark:hover:text-primary-dark ml-11"
              >
                Xem thêm bình luận...
              </button>
            )}
          </>
        ) : (
          <p className="text-xs text-gray-400 text-center py-2 italic">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
        )}
      </div>

      {/* Add Comment Input */}
      <form onSubmit={handleSubmit} className="flex gap-2 items-end">
        <div className="h-8 w-8 shrink-0 rounded-full bg-emerald-100 dark:bg-primary/20 flex items-center justify-center overflow-hidden border border-emerald-100 dark:border-primary/10 shadow-inner">
          {currentUserAvatarFileId ? (
            <MediaImage 
              fileId={currentUserAvatarFileId}
              alt={currentUserName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-emerald-700 dark:text-primary font-bold text-xs">
              {currentUserName.charAt(0) || 'U'}
            </span>
          )}
        </div>
        <div className="flex-1 relative">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Viết bình luận..."
            className="w-full bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-gray-300 rounded-full pl-4 pr-10 py-2 text-sm focus:ring-2 focus:ring-emerald-500/30 outline-none border border-transparent focus:border-emerald-200 dark:focus:border-primary/30 transition-all"
            disabled={isSubmitting}
          />
          <button
            type="submit"
            disabled={!content.trim() || isSubmitting}
            className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 text-emerald-600 dark:text-primary hover:bg-emerald-50 dark:hover:bg-primary/10 rounded-full transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
          >
            {isSubmitting ? (
              <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommentSection;
