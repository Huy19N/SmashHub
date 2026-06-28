import { useEffect, useCallback, useState, useRef } from 'react';
import { useSocial } from '../hooks/useSocial';
import CreatePostWidget from '../components/CreatePostWidget';
import SocialFeed from '../components/SocialFeed';
import { Flame } from 'lucide-react';
import Sidebar from '../../../components/layout/Sidebar';
import SportyWatermarks from '../../../components/ui/SportyWatermarks';
import { useTheme } from '../../../contexts/ThemeContext';

const SocialPage = () => {
  const { theme } = useTheme();
  const {
    posts,
    isLoading,
    error,
    hasMore,
    pageNumber,
    fetchPosts,
    createPost,
    toggleLike
  } = useSocial();

  const [isWidgetVisible, setIsWidgetVisible] = useState(true);
  const lastScrollTopRef = useRef(0);

  // Initial fetch
  useEffect(() => {
    fetchPosts(1, 10, true);
  }, [fetchPosts]);

  const handleFetchMore = useCallback(() => {
    fetchPosts(pageNumber + 1, 10, false);
  }, [fetchPosts, pageNumber]);

  const handleScroll = useCallback((e) => {
    const scrollTop = e.target.scrollTop;
    const lastScrollTop = lastScrollTopRef.current;

    // Require a minimum scroll threshold of 10px to prevent jitter
    if (Math.abs(scrollTop - lastScrollTop) > 10) {
      if (scrollTop > lastScrollTop && scrollTop > 80) {
        // Scrolling down -> hide
        setIsWidgetVisible(false);
      } else {
        // Scrolling up -> show
        setIsWidgetVisible(true);
      }
      lastScrollTopRef.current = scrollTop;
    }
  }, []);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#0c0f17]' : 'bg-gray-50'} flex relative overflow-hidden`}>
      <SportyWatermarks />
      <Sidebar activeMenu="social" />

      <div
        className="flex-1 h-screen overflow-y-auto custom-scrollbar relative"
        onScroll={handleScroll}
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-page pb-44 md:pb-36">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="h-12 w-12 rounded-full bg-emerald-50 dark:bg-primary/10 flex items-center justify-center shadow-sm overflow-hidden mb-3">
              <img src="/Logo.png" alt="Logo" className="h-full w-full object-cover" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-primary font-display">
              Cộng đồng SmashHub
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium max-w-xl mt-1.5 leading-relaxed">
              Kết nối, tìm đối thủ và giao lưu với những người đam mê thể thao tại sân chơi SmashHub lớn nhất Việt Nam.
            </p>
          </div>

          {/* Main Layout */}
          <div className="space-y-8 relative">
            {/* Feed Section */}
            <section className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-border-dark/40 pb-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 font-label flex items-center gap-1.5">
                  Bảng tin mới nhất
                  <span className="text-[10px] text-emerald-500">▶</span>
                </h2>
                <button
                  onClick={() => fetchPosts(1, 10, true)}
                  className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 dark:text-primary transition-colors uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                >
                  Làm mới
                  <span className="text-xs">⟳</span>
                </button>
              </div>
              <SocialFeed
                posts={posts}
                isLoading={isLoading}
                error={error}
                hasMore={hasMore}
                onFetchMore={handleFetchMore}
                onToggleLike={toggleLike}
              />
            </section>

            {/* Footer */}
            <footer className="pt-12 pb-6 border-t border-gray-150 dark:border-border-dark/20 text-center relative z-10">
              <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium font-label">
                © 2026 SmashHub Community. All rights reserved.
              </p>
            </footer>

            {/* Flame Watermark bottom right of page */}
            <div className="absolute right-0 bottom-8 opacity-[0.03] dark:opacity-[0.06] pointer-events-none transform translate-y-6 translate-x-4 select-none">
              <Flame className="w-36 h-36 text-emerald-500" />
            </div>
          </div>
        </div>

        {/* Sticky Create Post Box directly under scroll container */}
        <div className={`sticky bottom-2 z-40 max-w-3xl mx-auto px-4 transition-all duration-500 ease-out transform ${
          isWidgetVisible 
            ? 'translate-y-0 opacity-100 pointer-events-auto' 
            : 'translate-y-44 opacity-0 pointer-events-none'
        }`}>
          <CreatePostWidget onCreatePost={createPost} />
        </div>
      </div>
    </div>
  );
};

export default SocialPage;
