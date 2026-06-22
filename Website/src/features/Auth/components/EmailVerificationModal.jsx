import React, { useState, useEffect, useRef } from 'react';
import { X, Mail, RefreshCw, ShieldCheck, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../../components/ui/Button';
import { useVerifyEmailRegister, useResendVerifyEmail } from '../hooks/useAuth';

export default function EmailVerificationModal({ isOpen, email, onClose, onVerified }) {
  const [code, setCode] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const { verifyEmailRegister, isLoading: isVerifying } = useVerifyEmailRegister();
  const { resendVerifyEmail, isLoading: isResending } = useResendVerifyEmail();

  const inputRef = useRef(null);
  const timerRef = useRef(null);

  // Focus the input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      timerRef.current = setTimeout(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timerRef.current);
  }, [resendCooldown]);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  if (!isOpen) return null;

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!code.trim()) {
      toast.error('Vui lòng nhập mã xác thực.');
      return;
    }
    try {
      await verifyEmailRegister(email, code.trim());
      toast.success('Xác thực email thành công! Vui lòng đăng nhập.');
      onVerified();
    } catch (err) {
      const msg = err?.message || err || 'Mã xác thực không đúng hoặc đã hết hạn.';
      toast.error(msg);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || isResending) return;
    try {
      await resendVerifyEmail(email);
      toast.success('Mã xác thực mới đã được gửi đến email của bạn.');
      setResendCooldown(60);
    } catch (err) {
      const msg = err?.message || err || 'Không thể gửi lại mã. Vui lòng thử lại sau.';
      toast.error(msg);
    }
  };

  const handleClose = () => {
    setCode('');
    setResendCooldown(0);
    clearTimeout(timerRef.current);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#1a2130] border border-gray-200 dark:border-gray-700/50 rounded-2xl w-full max-w-md p-6 relative shadow-2xl m-4">


        <form onSubmit={handleVerify} className="space-y-5">
          {/* Header */}
          <div className="text-center space-y-3 mb-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mx-auto">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-display">
              Xác thực Email
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Chúng tôi đã gửi mã xác thực đến<br />
              <strong className="text-gray-800 dark:text-gray-200">{email}</strong>
              <br />Vui lòng kiểm tra hộp thư (bao gồm thư rác).
            </p>
          </div>

          {/* Code Input */}
          <div className="flex flex-col space-y-2 w-full">
            <label className="text-lg font-semibold text-gray-100 font-label">
              Mã xác thực
            </label>
            <input
              ref={inputRef}
              type="text"
              placeholder="Nhập mã xác thực từ email"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={10}
              required
              className="
                w-full px-6 py-5 rounded-lg border text-sm transition-all duration-300 outline-none
                bg-white/10 backdrop-blur-md
                border-gray-500/50
                text-white placeholder:text-gray-400
                focus:border-primary focus:ring-2 focus:ring-primary/20
                focus:text-primary focus:[text-shadow:_0_0_10px_rgba(11,232,96,0.8)]
                text-center text-lg tracking-[0.3em] font-mono font-bold
              "
            />
          </div>

          {/* Verify Button */}
          <Button type="submit" className="w-full" isLoading={isVerifying}>
            <ShieldCheck className="w-4 h-4 mr-2" />
            Xác nhận
          </Button>

          {/* Resend Section */}
          <div className="text-center pt-1">
            {resendCooldown > 0 ? (
              <p className="text-xs text-gray-400">
                Gửi lại mã sau{' '}
                <span className="text-primary font-bold">{resendCooldown}s</span>
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending}
                className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary-dark hover:underline transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isResending ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <RefreshCw className="w-3 h-3" />
                )}
                Gửi lại mã xác thực
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
