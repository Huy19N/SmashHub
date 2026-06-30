import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { getPostDetailAPI, likePostAPI, unlikePostAPI } from '../api/social.api';
import PostCard from '../components/PostCard';
import Sidebar from '../../../components/layout/Sidebar';
import SportyWatermarks from '../../../components/ui/SportyWatermarks';
import { toast } from 'react-hot-toast';

const SinglePostPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await getPostDetailAPI(postId);
        setPost(res.data);
      } catch (error) {
        console.error(error);
        toast.error('Không thể tải bài viết hoặc bài viết không tồn tại.');
        navigate('/social');
      } finally {
        setIsLoading(false);
      }
    };
    if (postId) {
      fetchPost();
    }
  }, [postId, navigate]);

  const handleToggleLike = async (id, isLiked) => {
    try {
      if (isLiked) {
        await unlikePostAPI(id);
      } else {
        await likePostAPI(id);
      }
      // Re-fetch to update like count accurately or just mutate
      const res = await getPostDetailAPI(postId);
      setPost(res.data);
    } catch (error) {
      toast.error('Có lỗi xảy ra');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background-dark text-slate-900 dark:text-white pb-20 md:pb-0 font-sans selection:bg-emerald-200 dark:selection:bg-emerald-900/50">
      <div className="flex h-screen overflow-hidden relative">
        <SportyWatermarks />
        
        {/* Sidebar */}
        <Sidebar className="hidden md:flex flex-col w-64 shrink-0 bg-white dark:bg-card-dark border-r border-gray-200 dark:border-white/5 relative z-10" />

        {/* Main Content */}
        <div className="flex-1 flex flex-col h-screen overflow-y-auto custom-scrollbar relative z-10">
          
          <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16 md:mt-0">
            <button 
              onClick={() => navigate('/social')}
              className="flex items-center gap-2 text-emerald-600 dark:text-primary hover:underline font-semibold mb-6"
            >
              <ArrowLeft className="w-5 h-5" /> Quản lý bản tin
            </button>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
              </div>
            ) : post ? (
              <PostCard post={post} onToggleLike={handleToggleLike} isSinglePostView={true} />
            ) : null}
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default SinglePostPage;
