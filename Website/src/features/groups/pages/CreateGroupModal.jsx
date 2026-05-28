import { useState } from 'react';
import { X, Users, Check, AlertCircle, Link2, Copy } from 'lucide-react';
import { useCreateGroup, useCreateInvite } from '../hooks/useGroups';

const MAX_MEMBERS = 20;

export default function CreateGroupModal({ onClose, onCreated, isDarkMode = false }) {
  const [step, setStep] = useState('form');
  const [teamName, setTeamName] = useState('');
  const [description, setDescription] = useState('');
  const [validationError, setValidationError] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);

  const { createGroup, isLoading: createLoading, error: createError } = useCreateGroup();
  const { createInvite, isLoading: inviteLoading } = useCreateInvite();

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
      const newTeam = await createGroup({
        teamName: teamName.trim(),
        description: description.trim(),
      });

      if (newTeam?.teamId) {
        try {
          const inviteData = await createInvite(newTeam.teamId, {
            maxUses: MAX_MEMBERS,
            expiresInDays: 7
          });
          
          const token = inviteData?.inviteToken;
          if (token) {
            setInviteLink(`${window.location.origin}/groups/invite/${token}`);
          }
        } catch {
          // Invite generation failed, but group was created successfully
        }
      }

      setStep('success');
    } catch {
      // Error is already set in the hook
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement('input');
      input.value = inviteLink;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${isDarkMode ? 'dark' : ''}`}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md animate-fade-in">
        <div className="rounded-2xl border border-gray-200 dark:border-border-dark bg-white/95 dark:bg-[#0d1117]/95 backdrop-blur-xl shadow-2xl shadow-black/20 dark:shadow-black/50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-border-dark">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white font-display">
              {step === 'form' ? 'Tạo nhóm mới' : 'Nhóm đã được tạo! 🎉'}
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {step === 'form' ? (
            /* ── Form Step ── */
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Error callout */}
              {(validationError || createError) && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-sm font-label animate-fade-in">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  {validationError || createError}
                </div>
              )}

              {/* Team Name */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 font-label">
                  Tên nhóm <span className="text-red-500 dark:text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="VD: Badminton Elite, Cầu Lông Thủ Đức..."
                  maxLength={255}
                  className="w-full px-4 py-3 rounded-lg border bg-white dark:bg-white/5 backdrop-blur-md border-gray-300 dark:border-border-dark text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300 font-label"
                  autoFocus
                />
                <p className="text-xs text-gray-500 font-label">{teamName.length}/255 ký tự</p>
              </div>

              {/* Description */}
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

              {/* Max Members Notice */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 dark:bg-primary/5 border border-primary/20">
                <Users className="h-4 w-4 text-primary shrink-0" />
                <p className="text-xs text-gray-700 dark:text-gray-300 font-label">
                  Giới hạn tối đa <span className="font-bold text-primary">{MAX_MEMBERS} thành viên</span> mỗi nhóm.
                </p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={createLoading || inviteLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-bold bg-primary hover:bg-primary-dark text-[#052e14] transition-all duration-300 shadow-md shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed font-label cursor-pointer"
              >
                {createLoading || inviteLoading ? (
                  <div className="h-5 w-5 rounded-full border-2 border-[#052e14] border-t-transparent animate-spin" />
                ) : (
                  <>
                    <Users className="h-4 w-4" />
                    Tạo nhóm
                  </>
                )}
              </button>
            </form>
          ) : (
            /* ── Success Step ── */
            <div className="p-6 space-y-5">
              <div className="text-center space-y-2">
                <div className="mx-auto h-14 w-14 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                  <Check className="h-7 w-7 text-primary" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 font-label">
                  Nhóm <span className="font-bold text-gray-900 dark:text-white">"{teamName}"</span> đã được tạo thành công!
                </p>
              </div>

              {/* Invite Link */}
              {inviteLink && (
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 font-label">
                    <Link2 className="h-4 w-4 text-primary" />
                    Link mời tham gia
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={inviteLink}
                      readOnly
                      className="flex-1 px-4 py-2.5 rounded-lg border bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-border-dark text-gray-700 dark:text-gray-300 text-xs outline-none font-label truncate"
                    />
                    <button
                      onClick={handleCopy}
                      className={`shrink-0 px-3 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 font-label cursor-pointer ${
                        copied
                          ? 'bg-primary/20 text-primary border border-primary/30'
                          : 'bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-border-dark hover:border-primary/30 hover:text-primary dark:hover:text-white'
                      }`}
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 font-label">
                    Link này có hiệu lực trong 7 ngày, tối đa {MAX_MEMBERS} lượt sử dụng.
                  </p>
                </div>
              )}

              {/* Done Button */}
              <button
                onClick={() => {
                  onCreated?.();
                  onClose();
                }}
                className="w-full px-4 py-3 rounded-lg text-sm font-bold bg-primary hover:bg-primary-dark text-[#052e14] transition-all duration-300 font-label cursor-pointer"
              >
                Hoàn tất
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
