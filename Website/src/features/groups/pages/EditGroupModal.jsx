import { useState } from 'react';
import { X, Users, Check, AlertCircle } from 'lucide-react';
import Button from '../../../components/ui/Button';
import { useUpdateGroup, useUploadTeamAvatar } from '../hooks/useGroups';

export default function EditGroupModal({ team, onClose, onUpdated, isDarkMode = false }) {
  const [teamName, setTeamName] = useState(team?.teamName || '');
  const [description, setDescription] = useState(team?.description || '');
  const [validationError, setValidationError] = useState('');

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const { updateGroup, isLoading: updateLoading, error: updateError } = useUpdateGroup();
  const { uploadAvatar, isLoading: uploadLoading, error: uploadError } = useUploadTeamAvatar();

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setValidationError('Vui lòng chọn file hình ảnh hợp lệ.');
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (!teamName.trim()) {
      setValidationError('Tên nhóm không được để trống.');
      return;
    }
    if (teamName.length > 255) {
      setValidationError('Tên nhóm không được vượt quá 255 ký tự.');
      return;
    }

    try {
      if (avatarFile) {
        const formData = new FormData();
        formData.append('file', avatarFile);
        await uploadAvatar(team.teamId, formData);
      }

      await updateGroup(team.teamId, {
        teamName: teamName.trim(),
        description: description.trim(),
      });
      onUpdated?.();
      onClose();
    } catch {
      // Error is already set in the hook
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${isDarkMode ? 'dark' : ''}`}>
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md animate-fade-in">
        <div className="rounded-2xl border border-gray-200 dark:border-border-dark bg-white/95 dark:bg-[#0d1117]/95 backdrop-blur-xl shadow-2xl shadow-black/20 dark:shadow-black/50 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-border-dark">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white font-display">
              Chỉnh sửa nhóm
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {(validationError || updateError || uploadError) && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-sm font-label animate-fade-in">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                {validationError || updateError || uploadError}
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 font-label">
                Ảnh đại diện nhóm
              </label>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 shrink-0 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-border-dark flex items-center justify-center overflow-hidden">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Preview" className="h-full w-full object-cover" />
                  ) : team.avatarFileId ? (
                    <img src={`https://tad-min.io.vn/api/files/${team.avatarFileId}/stream`} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <Users className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="block w-full text-sm text-gray-500 dark:text-gray-400
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-emerald-50 file:text-emerald-700
                      hover:file:bg-emerald-100
                      dark:file:bg-primary/10 dark:file:text-primary
                      dark:hover:file:bg-primary/20
                      cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 font-label">
                Tên nhóm <span className="text-red-500 dark:text-red-400">*</span>
              </label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="VD: Badminton Elite..."
                maxLength={255}
                className="w-full px-4 py-3 rounded-lg border bg-white dark:bg-white/5 backdrop-blur-md border-gray-300 dark:border-border-dark text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300 font-label"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 font-label">
                Mô tả
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả ngắn về nhóm của bạn..."
                rows={3}
                className="w-full px-4 py-3 rounded-lg border bg-white dark:bg-white/5 backdrop-blur-md border-gray-300 dark:border-border-dark text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300 resize-none font-label"
              />
            </div>

            <Button
              type="submit"
              isLoading={updateLoading}
              variant="primary"
              className="w-full py-3 text-sm shadow-md"
            >
              <Users className="h-4 w-4" />
              Cập nhật
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
