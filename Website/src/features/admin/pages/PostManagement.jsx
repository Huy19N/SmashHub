import React, { useState, useEffect } from 'react';
import { Search, Filter, ShieldCheck, CheckCircle, XCircle, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { getPendingPostsAPI, approvePostAPI, rejectPostAPI } from '../api/admin.api';
import MediaImage from '../../../components/ui/MediaImage';

const PostManagement = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const response = await getPendingPostsAPI({ pageIndex: 1, pageSize: 50 });
      if (response.success) {
        setPosts(response.data.items || []);
      }
    } catch (error) {
      toast.error('Lỗi khi tải danh sách bài đăng chờ duyệt');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (postId) => {
    try {
      const response = await approvePostAPI(postId);
      if (response.success) {
        toast.success('Đã duyệt bài đăng');
        setPosts(posts.filter(p => p.postId !== postId));
      }
    } catch (error) {
      toast.error('Lỗi khi duyệt bài đăng');
    }
  };

  const handleReject = async (postId) => {
    if (!window.confirm('Bạn có chắc muốn từ chối bài đăng này?')) return;
    try {
      const response = await rejectPostAPI(postId);
      if (response.success) {
        toast.success('Đã từ chối bài đăng');
        setPosts(posts.filter(p => p.postId !== postId));
      }
    } catch (error) {
      toast.error('Lỗi khi từ chối bài đăng');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <ShieldCheck className="w-7 h-7 text-emerald-600" />
            Duyệt bài viết cộng đồng
          </h1>
          <p className="text-gray-500 mt-1">Quản lý và kiểm duyệt các bài viết từ người dùng trước khi hiển thị</p>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center p-8 text-gray-500">
            Không có bài đăng nào đang chờ duyệt.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 border-b border-gray-100">
                  <th className="py-3 px-4 font-semibold text-sm">Tác giả</th>
                  <th className="py-3 px-4 font-semibold text-sm">Nội dung</th>
                  <th className="py-3 px-4 font-semibold text-sm text-center">Hình ảnh</th>
                  <th className="py-3 px-4 font-semibold text-sm">Thời gian</th>
                  <th className="py-3 px-4 font-semibold text-sm text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.postId} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{post.authorName}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="max-w-md">
                        <p className="text-sm text-gray-700 line-clamp-2">{post.content}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {post.mediaFileIds?.length > 0 ? (
                        <div className="flex items-center justify-center gap-1 flex-wrap w-32 mx-auto">
                          {post.mediaFileIds.slice(0, 3).map((id, index) => (
                            <div key={index} className="w-8 h-8 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                              <MediaImage fileId={id} className="w-full h-full object-cover" />
                            </div>
                          ))}
                          {post.mediaFileIds.length > 3 && (
                            <div className="w-8 h-8 rounded-md bg-gray-200 flex items-center justify-center text-xs text-gray-600 font-medium">
                              +{post.mediaFileIds.length - 3}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 text-center block">Không có</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {new Date(post.createdAt).toLocaleDateString('vi-VN', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleApprove(post.postId)}
                          className="p-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                          title="Duyệt bài"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleReject(post.postId)}
                          className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="Từ chối"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostManagement;
