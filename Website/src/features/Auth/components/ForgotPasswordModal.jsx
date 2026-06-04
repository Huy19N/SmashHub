import React, { useState } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { useForgotPassword, useVerifyOTP, useResetPassword } from '../hooks/useAuth';

export default function ForgotPasswordModal({ isOpen, onClose }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const { forgotPassword, isLoading: isForgotLoading } = useForgotPassword();
  const { verifyOTP, isLoading: isVerifyLoading } = useVerifyOTP();
  const { resetPassword, isLoading: isResetLoading } = useResetPassword();

  if (!isOpen) return null;

  const handleClose = () => {
    // Reset states on close
    setStep(1);
    setEmail('');
    setCode('');
    setNewPassword('');
    setConfirmPassword('');
    onClose();
  };

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Vui lòng nhập email.");
    try {
      await forgotPassword(email);
      toast.success("Mã xác nhận đã được gửi đến email của bạn.");
      setStep(2);
    } catch (err) {
      toast.error(err || "Có lỗi xảy ra khi gửi email.");
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!code) return toast.error("Vui lòng nhập mã code.");
    try {
      await verifyOTP(code);
      toast.success("Mã hợp lệ. Vui lòng đặt mật khẩu mới.");
      setStep(3);
    } catch (err) {
      toast.error(err || "Mã không hợp lệ hoặc đã hết hạn.");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) return toast.error("Vui lòng nhập đầy đủ thông tin.");
    if (newPassword !== confirmPassword) return toast.error("Mật khẩu xác nhận không khớp.");
    
    try {
      await resetPassword(code, email, newPassword);
      toast.success("Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.");
      handleClose();
    } catch (err) {
      toast.error(err || "Có lỗi xảy ra khi đặt lại mật khẩu.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#1a2130] border border-gray-200 dark:border-gray-700/50 rounded-2xl w-full max-w-md p-6 relative shadow-2xl m-4">
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        {step === 1 && (
          <form onSubmit={handleRequestOTP} className="space-y-5">
            <div className="text-center space-y-2 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-display">Quên mật khẩu</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Nhập email của bạn để nhận mã xác nhận đặt lại mật khẩu.</p>
            </div>
            <Input
              label="Email"
              type="email"
              placeholder="Nhập email của bạn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" className="w-full" isLoading={isForgotLoading}>
              Nhận mã xác nhận
            </Button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOTP} className="space-y-5">
            <div className="text-center space-y-2 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-display">Nhập mã xác nhận</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Chúng tôi đã gửi email chứa mã xác nhận đến <br/><strong className="text-gray-800 dark:text-gray-200">{email}</strong><br/>Vui lòng kiểm tra hộp thư.
              </p>
            </div>
            <Input
              label="Mã xác nhận (OTP)"
              type="text"
              placeholder="Nhập mã code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
            <Button type="submit" className="w-full" isLoading={isVerifyLoading}>
              Xác nhận mã
            </Button>
            <div className="text-center mt-2">
              <button 
                type="button" 
                onClick={handleRequestOTP} 
                disabled={isForgotLoading}
                className="text-xs text-primary hover:underline"
              >
                Gửi lại mã
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div className="text-center space-y-2 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-display">Đặt mật khẩu mới</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Vui lòng nhập mật khẩu mới cho tài khoản của bạn.</p>
            </div>
            <Input
              label="Mật khẩu mới"
              type="password"
              placeholder="Nhập mật khẩu mới"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <Input
              label="Xác nhận mật khẩu mới"
              type="password"
              placeholder="Nhập lại mật khẩu mới"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <Button type="submit" className="w-full" isLoading={isResetLoading}>
              Cập nhật mật khẩu
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
