import { useEffect } from 'react';
import PostCard from './PostCard';

const SocialFeed = ({ posts, isLoading, error, hasMore, onFetchMore, onToggleLike }) => {
  
  if (error) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
        <div className="text-amber-500 bg-amber-50 dark:bg-amber-500/10 p-3.5 rounded-full border border-amber-100 dark:border-amber-500/10">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 font-label">
            Lỗi khi tải thêm bài viết
          </h3>
        </div>
        <button 
          onClick={() => onFetchMore(1, 10, true)}
          className="bg-emerald-400 hover:bg-emerald-500 text-white font-extrabold px-6 py-2.5 rounded-full text-xs shadow-md shadow-emerald-400/20 active:scale-95 transition-all cursor-pointer"
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (isLoading && posts.length === 0) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white dark:bg-card-dark rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-border-dark/60 animate-pulse">
            <div className="flex gap-3 items-center mb-4">
              <div className="h-10 w-10 bg-gray-200 dark:bg-white/10 rounded-full" />
              <div className="space-y-2">
                <div className="h-4 w-32 bg-gray-200 dark:bg-white/10 rounded" />
                <div className="h-3 w-20 bg-gray-200 dark:bg-white/10 rounded" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-full bg-gray-200 dark:bg-white/10 rounded" />
              <div className="h-4 w-5/6 bg-gray-200 dark:bg-white/10 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="py-12 text-center bg-white dark:bg-card-dark rounded-3xl border border-gray-100 dark:border-border-dark/60">
        <div className="w-16 h-16 bg-emerald-50 dark:bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Chưa có bài viết nào</h3>
        <p className="text-sm text-gray-500">Hãy là người đầu tiên chia sẻ thông tin hoặc tìm đối thủ!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-cascade-down">
      {posts.map((post, index) => (
        <div key={post.postId || index} style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }} className="animate-slide-up opacity-0">
          <PostCard 
            post={post} 
            onToggleLike={onToggleLike} 
          />
        </div>
      ))}
      
      {hasMore && (
        <div className="pt-4 text-center">
          <button
            onClick={() => onFetchMore()}
            disabled={isLoading}
            className="px-6 py-2.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 font-semibold rounded-full text-sm transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Đang tải...' : 'Tải thêm bài viết'}
          </button>
        </div>
      )}
      
      {!hasMore && posts.length > 0 && (
        <div className="pt-6 pb-2 text-center text-sm text-gray-400">
          Bạn đã xem hết tin tức.
        </div>
      )}
    </div>
  );
};

export default SocialFeed;
