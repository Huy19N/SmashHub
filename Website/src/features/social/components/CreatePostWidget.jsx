import { useState, useRef } from 'react';
import { Send, Image as ImageIcon, X } from 'lucide-react';
import { useGetUserId } from '../../Auth/hooks/useAuth';
import MediaImage from '../../../components/ui/MediaImage';
import { uploadFileAPI } from '../../groups/api/files.api';
import toast from 'react-hot-toast';

const CreatePostWidget = ({ onCreatePost }) => {
  const { user: apiUser } = useGetUserId();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedType, setSelectedType] = useState('General'); // 'General', 'FindOpponent', 'Promotion'
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const roleId = apiUser?.data?.roleId?.toString() || localStorage.getItem('roleId');
  const isFacilityOwner = roleId === '3';

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Kích thước ảnh tối đa là 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Vui lòng chọn file hình ảnh');
        return;
      }
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !selectedImage) return;

    let postTypeInt = 3; // General
    if (selectedType === 'FindOpponent') postTypeInt = 2;
    else if (selectedType === 'Promotion') postTypeInt = 1;

    setIsSubmitting(true);
    let mediaFileId = null;

    if (selectedImage) {
      try {
        const uploadRes = await uploadFileAPI(selectedImage, 'General');
        mediaFileId = uploadRes?.data?.fileId || uploadRes?.fileId;
      } catch (err) {
        toast.error('Tải ảnh lên thất bại');
        setIsSubmitting(false);
        return;
      }
    }

    const success = await onCreatePost({
      content: content.trim(),
      postType: postTypeInt,
      visibility: 'Public',
      mediaFileId: mediaFileId
    });

    if (success) {
      setContent('');
      setSelectedType('General');
      clearImage();
    }
    setIsSubmitting(false);
  };

  const fullName = apiUser?.data?.fullName || localStorage.getItem('name') || 'User';
  const avatarFileId = apiUser?.data?.avatarFileId;

  // Define options based on user role
  const options = isFacilityOwner 
    ? [
        { value: 'General', label: 'Thảo luận chung' },
        { value: 'Promotion', label: 'Quảng cáo sân / Khuyến mãi' }
      ]
    : [
        { value: 'General', label: 'Thảo luận chung' },
        { value: 'FindOpponent', label: 'Tìm đối thủ / người chơi' }
      ];

  const getSelectedLabel = () => {
    return options.find(opt => opt.value === selectedType)?.label || 'Thảo luận chung';
  };

  return (
    <div className="bg-white dark:bg-card-dark rounded-[2.5rem] p-6 shadow-md border border-gray-150/60 dark:border-border-dark/60">
      <div className="flex gap-4">
        {/* Avatar */}
        <div className="h-11 w-11 shrink-0 rounded-full bg-emerald-50 dark:bg-primary/20 flex items-center justify-center overflow-hidden border border-emerald-100 dark:border-primary/10 shadow-inner">
          {avatarFileId ? (
            <MediaImage 
              fileId={avatarFileId}
              alt={fullName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-emerald-700 dark:text-primary font-bold text-sm">
              {fullName.charAt(0) || 'U'}
            </span>
          )}
        </div>

        {/* Input Area */}
        <div className="flex-1">
          <form onSubmit={handleSubmit}>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Bạn đang nghĩ gì? Bạn muốn tìm đối thủ hay đăng quảng cáo sân?"
              className="w-full bg-gray-50/70 dark:bg-gray-800/40 text-gray-700 dark:text-gray-300 rounded-[1.8rem] px-5 py-4 text-xs font-medium focus:ring-2 focus:ring-emerald-500/20 outline-none resize-none border border-gray-200/40 dark:border-white/5 min-h-[90px] placeholder:text-gray-400"
              disabled={isSubmitting}
            />

            {imagePreview && (
              <div className="relative mt-3 inline-block">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="h-32 object-contain rounded-xl border border-gray-200 dark:border-white/10"
                />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-md transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-3">
                {/* Custom Ellipse Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full pl-4 pr-8 py-2 text-[11px] text-gray-600 dark:text-gray-300 font-bold outline-none cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 transition-colors flex items-center gap-1.5 focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <span>{getSelectedLabel()}</span>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] text-gray-500 dark:text-gray-400 select-none">
                      {isDropdownOpen ? '▲' : '▼'}
                    </span>
                  </button>

                  {isDropdownOpen && (
                    <>
                      {/* Backdrop for closing */}
                      <div 
                        className="fixed inset-0 z-30" 
                        onClick={() => setIsDropdownOpen(false)}
                      />
                      
                      {/* Dropdown Options Box - Opening Upwards */}
                      <div className="absolute left-0 bottom-full mb-2 w-56 bg-white dark:bg-[#151f32] border border-gray-200/80 dark:border-white/10 rounded-2xl shadow-xl py-1.5 z-40 animate-dropdown overflow-hidden">
                        {options.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                              setSelectedType(opt.value);
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-emerald-50 dark:hover:bg-primary/10 transition-colors ${
                              selectedType === opt.value 
                                ? 'text-emerald-600 dark:text-primary bg-emerald-50/50 dark:bg-primary/5' 
                                : 'text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageChange} 
                  accept="image/*" 
                  className="hidden" 
                />
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-white/5 rounded-full transition-all" 
                  title="Đính kèm ảnh"
                >
                  <ImageIcon className="w-4.5 h-4.5" />
                </button>
              </div>

              <button
                type="submit"
                disabled={(!content.trim() && !selectedImage) || isSubmitting}
                className="bg-emerald-500 hover:bg-emerald-600 dark:bg-primary dark:hover:bg-primary-dark text-white dark:text-[#052e14] px-6 py-2.5 rounded-full text-xs font-extrabold shadow-md shadow-emerald-500/20 dark:shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 fill-current rotate-45 -translate-y-0.5" />
                    Đăng bài
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePostWidget;
