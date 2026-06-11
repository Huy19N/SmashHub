import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { PATHS } from '../../../routes/paths';
import { useRegister } from '../hooks/useAuth';
import EmailVerificationModal from '../components/EmailVerificationModal';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const { register, isLoading } = useRegister();
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('userId')) {
      navigate(PATHS.HOME);
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp.');
      return;
    }

    try {
      await register(fullName, email, password, phoneNumber);
      toast.success("Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.");
      setRegisteredEmail(email);
      setShowVerifyModal(true);
    } catch (err) {
      const errMsg = err.message || 'Đăng ký không thành công.';
      toast.error(errMsg);
    }
  };

  const handleVerified = () => {
    setShowVerifyModal(false);
    toast.success("Tài khoản đã được xác thực! Vui lòng đăng nhập.");
    navigate(PATHS.LOGIN);
  };

  const handleCloseVerifyModal = () => {
    setShowVerifyModal(false);
    toast("Bạn có thể xác thực email sau khi đăng nhập.", { icon: 'ℹ️' });
    navigate(PATHS.LOGIN);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-bold font-display tracking-tight text-white transition-colors duration-500">Tham Gia SmashClub</h1>
        <p className="text-lg text-gray-300 transition-colors duration-500">Tạo tài khoản của bạn ngay hôm nay</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
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

      {/* Email Verification Modal */}
      <EmailVerificationModal
        isOpen={showVerifyModal}
        email={registeredEmail}
        onClose={handleCloseVerifyModal}
        onVerified={handleVerified}
      />
    </div>
  );
}
