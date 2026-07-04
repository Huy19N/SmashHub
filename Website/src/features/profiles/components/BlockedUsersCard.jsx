import React from 'react';
import { Ban, Unlock, Loader2, UserCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useGetBlockedUsers, useUnblockUser } from '../hooks/useProfiles';
import MediaImage from '../../../components/ui/MediaImage';

export default function BlockedUsersCard() {
  const { blockedUsers, isLoading, refetch } = useGetBlockedUsers();
  const { unblockUser, isLoading: isUnblocking } = useUnblockUser();

  const handleUnblock = async (userId) => {
    try {
      await unblockUser(userId);
      toast.success('Đã bỏ chặn người dùng này.');
      refetch();
    } catch (error) {
      toast.error('Không thể bỏ chặn người dùng.');
    }
  };

  return (
    <div className="bg-white dark:bg-card-dark border border-gray-200/80 dark:border-border-dark/60 rounded-3xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100 dark:border-border-dark/40">
        <h3 className="font-bold text-gray-900 dark:text-white font-display flex items-center gap-2">
          <Ban className="w-5 h-5 text-red-500" />
          Người dùng đã chặn
        </h3>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
        </div>
      ) : blockedUsers.length === 0 ? (
        <div className="text-center py-6 border-2 border-dashed border-gray-100 dark:border-white/5 rounded-2xl">
          <p className="text-sm text-gray-500 dark:text-gray-400">Bạn chưa chặn ai.</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar pr-2">
          {blockedUsers.map((user) => (
            <div key={user.userId} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 hover:border-gray-200 dark:hover:border-white/20 transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 shrink-0 rounded-full bg-emerald-50 dark:bg-primary/20 flex items-center justify-center overflow-hidden border border-emerald-100 dark:border-primary/10">
                  {user.avatarFileId ? (
                    <MediaImage
                      fileId={user.avatarFileId}
                      alt={user.fullName || 'User'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserCircle className="w-6 h-6 text-emerald-400 dark:text-primary/70" />
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                    {user.fullName || 'Người dùng'}
                  </h4>
                  <p className="text-[10px] text-gray-500">Đã chặn</p>
                </div>
              </div>
              <button
                onClick={() => handleUnblock(user.userId)}
                disabled={isUnblocking}
                className="p-2 text-gray-400 hover:text-emerald-600 dark:hover:text-primary bg-white dark:bg-card-dark rounded-lg shadow-sm border border-gray-100 dark:border-white/10 hover:border-emerald-200 dark:hover:border-primary/30 transition-all disabled:opacity-50"
                title="Bỏ chặn"
              >
                <Unlock className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
