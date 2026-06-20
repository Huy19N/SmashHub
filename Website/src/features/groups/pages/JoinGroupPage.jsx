import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PATHS } from '../../../routes/paths';
import {
  UserPlus,
  Clock,
  Shield,
  Users,
  AlertTriangle,
  CheckCircle2,
  X,
  Loader2,
  Moon,
  Sun
} from 'lucide-react';
import { useInviteInfo, useAcceptInvite } from '../hooks/useGroups';
import { useTheme } from '../../../contexts/ThemeContext';
import SportyWatermarks from '../../../components/ui/SportyWatermarks';
import Button from '../../../components/ui/Button';

export default function JoinGroupPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [accepted, setAccepted] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === 'dark';

  const { inviteInfo, isLoading, error } = useInviteInfo(token);
  const { acceptInvite, isLoading: accepting, error: acceptError } = useAcceptInvite();

  useEffect(() => {
    if (accepted) {
      const t = setTimeout(() => {
        navigate(PATHS.GROUPS);
      }, 2000);
      return () => clearTimeout(t);
    }
  }, [accepted, navigate]);

  const handleAccept = async () => {
    try {
      await acceptInvite(token);
      setAccepted(true);
    } catch {
      // Error handled by hook and displayed below
    }
  };

  const handleReject = () => {
    navigate(PATHS.HOME);
  };

  // ─── Loading State ──────────────────────────────────────────
  if (isLoading) {
    return (
      <div className={`flex items-center justify-center min-h-[60vh] ${isDarkMode ? 'dark' : ''}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-2 border-gray-200 dark:border-border-dark border-t-primary animate-spin" />
          <p className="text-gray-500 dark:text-gray-400 font-label">Đang tải thông tin lời mời...</p>
        </div>
      </div>
    );
  }

  // ─── Error / Not Found ──────────────────────────────────────
  if (error || !inviteInfo) {
    return (
      <div className={`flex items-center justify-center min-h-[60vh] ${isDarkMode ? 'dark' : ''}`}>
        <div className="w-full max-w-md animate-fade-in">
          <div className="rounded-2xl border border-red-200 dark:border-red-500/20 bg-white dark:bg-[#0d1117]/90 backdrop-blur-xl p-8 text-center space-y-4 shadow-xl">
            <button onClick={toggleTheme} className="absolute top-4 right-4 p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <div className="mx-auto h-16 w-16 rounded-full bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-red-500 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white font-display">Lời mời không hợp lệ</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-label">
              {error || 'Link mời này đã hết hạn hoặc không tồn tại.'}
            </p>
            <Button
              variant="secondary"
              onClick={() => navigate(PATHS.HOME)}
              className="px-5 py-2.5 text-sm"
            >
              Về trang chủ
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Expired / Max Uses ─────────────────────────────────────
  const isExpired = new Date(inviteInfo.expiredAt) < new Date();
  const isMaxed = inviteInfo.maxUses && inviteInfo.currentUses >= inviteInfo.maxUses;
  const isInvalid = !inviteInfo.isValid || isExpired || isMaxed;

  if (isInvalid && !accepted) {
    return (
      <div className={`flex items-center justify-center min-h-[60vh] ${isDarkMode ? 'dark' : ''}`}>
        <div className="w-full max-w-md animate-fade-in">
          <div className="rounded-2xl border border-amber-200 dark:border-amber-500/20 bg-white dark:bg-[#0d1117]/90 backdrop-blur-xl p-8 text-center space-y-4 shadow-xl">
            <button onClick={toggleTheme} className="absolute top-4 right-4 p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <div className="mx-auto h-16 w-16 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 flex items-center justify-center">
              <Clock className="h-8 w-8 text-amber-500 dark:text-amber-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white font-display">Lời mời đã hết hạn</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-label">
              {isMaxed
                ? 'Link mời này đã đạt số lượt sử dụng tối đa.'
                : 'Link mời này đã hết thời gian hiệu lực.'}
            </p>
            <Button
              variant="secondary"
              onClick={() => navigate(PATHS.HOME)}
              className="px-5 py-2.5 text-sm"
            >
              Về trang chủ
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Accepted State ─────────────────────────────────────────
  if (accepted) {
    return (
      <div className={`flex items-center justify-center min-h-[60vh] ${isDarkMode ? 'dark' : ''}`}>
        <div className="w-full max-w-md animate-fade-in">
          <div className="rounded-2xl border border-primary/30 bg-white dark:bg-[#0d1117]/90 backdrop-blur-xl p-8 text-center space-y-4 shadow-xl relative overflow-hidden">
            <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 dark:bg-primary/20 border border-primary/20 dark:border-primary/30 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white font-display">Tham gia thành công! 🎉</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-label">
              Bạn đã tham gia nhóm <span className="text-gray-900 dark:text-white font-semibold">{inviteInfo.teamName}</span>.
              Đang chuyển hướng...
            </p>
            <div className="h-1 w-full bg-gray-100 dark:bg-border-dark rounded-full overflow-hidden mt-4">
              <div className="h-full bg-primary rounded-full animate-[expandWidth_2s_ease-in-out_forwards]" style={{ width: '100%' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Main Invite Card ───────────────────────────────────────
  const expiresAt = new Date(inviteInfo.expiredAt);
  const hoursLeft = Math.max(0, Math.round((expiresAt - new Date()) / (1000 * 60 * 60)));

  return (
    <div className={`flex items-center justify-center min-h-[60vh] ${isDarkMode ? 'dark' : ''} relative overflow-hidden`}>
      <SportyWatermarks />
      <div className="w-full max-w-md animate-slide-up">
        <div className="rounded-2xl border border-gray-200 dark:border-border-dark bg-white dark:bg-[#0d1117]/90 backdrop-blur-xl shadow-2xl shadow-black/10 dark:shadow-black/40 overflow-hidden relative">
          {/* Header gradient */}
          <div className="h-2 bg-gradient-to-r from-primary via-secondary to-primary" />

          {/* Theme Toggle Button */}
          <button onClick={toggleTheme} className="absolute top-6 right-6 p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-white dark:hover:bg-white/10 transition-colors">
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <div className="p-8 space-y-6">
            {/* Invite icon */}
            <div className="text-center space-y-3">
              <div className="mx-auto h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <UserPlus className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white font-display">Lời mời tham gia nhóm</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-label mt-1">Bạn đã được mời vào nhóm sau</p>
              </div>
            </div>

            {/* Team Info Card */}
            <div className="rounded-xl border border-gray-200 dark:border-border-dark bg-gray-50 dark:bg-white/[0.02] p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-lg bg-primary/10 dark:bg-primary/20 border border-primary/20 dark:border-primary/30 flex items-center justify-center shrink-0">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white truncate font-label">{inviteInfo.teamName}</h3>
                  <p className="text-xs text-gray-500 font-label">
                    Mời bởi: <span className="text-gray-700 dark:text-gray-300">{inviteInfo.createdByUserName || 'Unknown'}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 font-label pt-1 border-t border-gray-200 dark:border-border-dark">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3" />
                  <span>Hết hạn sau {hoursLeft} giờ</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Shield className="h-3 w-3" />
                  <span>{inviteInfo.currentUses || 0}/{inviteInfo.maxUses || '∞'} lượt dùng</span>
                </div>
              </div>
            </div>

            {/* Error message */}
            {acceptError && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-sm font-label animate-fade-in">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                {acceptError}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleReject}
                disabled={accepting}
                className="flex-1 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 border-red-200 dark:border-red-500/30 py-3 text-sm"
              >
                <X className="h-4 w-4" />
                Từ chối
              </Button>
              <Button
                variant="primary"
                onClick={handleAccept}
                isLoading={accepting}
                className="flex-1 py-3 text-sm"
              >
                <CheckCircle2 className="h-4 w-4" />
                Chấp nhận
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
