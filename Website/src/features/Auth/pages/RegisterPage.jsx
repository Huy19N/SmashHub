import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { PATHS } from '../../../routes/paths';
import { useRegister } from '../hooks/useAuth';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState(null);

  const { register, isLoading, error: authError } = useRegister();
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('userId')) {
      navigate(PATHS.HOME);
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);

    if (password !== confirmPassword) {
      setLocalError('Mật khẩu xác nhận không khớp.');
      return;
    }

    try {
      await register(fullName, email, password, phoneNumber);
      navigate(PATHS.HOME);
    } catch (err) {
      setLocalError(err.message || 'Đăng ký không thành công.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-bold font-display tracking-tight text-white transition-colors duration-500">Tham Gia SmashClub</h1>
        <p className="text-lg text-gray-300 transition-colors duration-500">Tạo tài khoản của bạn ngay hôm nay</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error Notification callout */}
        {(localError || authError) && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium animate-pulse-slow">
            {localError || authError}
          </div>
        )}

        <Input
          label="Email"
          type="email"
          placeholder="Nhập email của bạn"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Họ và Tên"
            placeholder="Nhập họ tên của bạn"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <Input
            label="Số điện thoại"
            type="tel"
            placeholder="Nhập số điện thoại"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
          />
        </div>
        <Input
          label="Mật khẩu"
          type="password"
          placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Input
          label="Xác nhận mật khẩu"
          type="password"
          placeholder="Nhập lại mật khẩu"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <Button type="submit" className="w-full mt-2" isLoading={isLoading}>
          Tạo tài khoản
        </Button>
      </form>

      <div className="text-center">
        <p className="text-sm text-gray-300 transition-colors">
          Bạn đã có tài khoản?{' '}
          <Link to={PATHS.LOGIN} className="text-primary hover:text-primary-dark font-bold transition-colors">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
