import { useState, useCallback } from 'react';
import * as socialApi from '../api/social.api';
import { toast } from 'react-hot-toast';

export const useSocial = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);

  const fetchPosts = useCallback(async (page = 1, pageSize = 10, reset = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await socialApi.getPostsAPI({ pageNumber: page, pageSize });
      const newPosts = response.data.items || [];
      
      setPosts(prev => reset ? newPosts : [...prev, ...newPosts]);
      setHasMore(response.data.hasNextPage);
      setPageNumber(page);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi tải bài viết');
      toast.error(err.response?.data?.message || 'Lỗi khi tải bài viết');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createPost = async (postData) => {
    try {
      const response = await socialApi.createPostAPI(postData);
      setPosts(prev => [response.data, ...prev]);
      toast.success('Đăng bài thành công');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi đăng bài');
      return false;
    }
  };

  const toggleLike = async (postId, isLiked) => {
    // Optimistic update
    setPosts(prev => prev.map(p => {
      if (p.postId === postId) {
        return {
          ...p,
          isLikedByCurrentUser: !isLiked,
          likeCount: isLiked ? p.likeCount - 1 : p.likeCount + 1
        };
      }
      return p;
    }));

    try {
      if (isLiked) {
        await socialApi.unlikePostAPI(postId);
      } else {
        await socialApi.likePostAPI(postId);
      }
    } catch (err) {
      // Revert on error
      setPosts(prev => prev.map(p => {
        if (p.postId === postId) {
          return {
            ...p,
            isLikedByCurrentUser: isLiked,
            likeCount: isLiked ? p.likeCount + 1 : p.likeCount - 1
          };
        }
        return p;
      }));
      toast.error('Lỗi khi thao tác');
    }
  };

  return {
    posts,
    isLoading,
    error,
    hasMore,
    pageNumber,
    fetchPosts,
    createPost,
    toggleLike
  };
};

export const useComments = (postId) => {
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);

  const fetchComments = useCallback(async (page = 1, pageSize = 10, reset = false) => {
    setIsLoading(true);
    try {
      const response = await socialApi.getCommentsAPI(postId, { pageNumber: page, pageSize });
      const newComments = response.data.items || [];
      
      setComments(prev => reset ? newComments : [...prev, ...newComments]);
      setHasMore(response.data.hasNextPage);
      setPageNumber(page);
    } catch (err) {
      toast.error('Lỗi khi tải bình luận');
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  const addComment = async (content) => {
    try {
      const response = await socialApi.addCommentAPI(postId, content);
      setComments(prev => [response.data, ...prev]);
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi gửi bình luận');
      return false;
    }
  };

  return {
    comments,
    isLoading,
    hasMore,
    pageNumber,
    fetchComments,
    addComment
  };
};
