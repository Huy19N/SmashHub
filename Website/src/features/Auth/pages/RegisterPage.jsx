import { useState } from 'react';
import { Link } from 'react-router-dom';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { PATHS } from '../../../routes/paths';

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => setIsLoading(false), 1500);
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
          type="text"
          placeholder="Nhập email của bạn"
          required
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Tên đăng nhập"
            placeholder="Nhập tên đăng nhập"
            required
          />
          <Input
            label="Số điện thoại"
            type="tel"
            placeholder="Nhập số điện thoại của bạn"
            required
          />
        </div>
        <Input
          label="Mật khẩu"
          type="password"
          placeholder="Nhập mật khẩu của bạn"
          required
        />
        <Input
          label="Xác nhận mật khẩu"
          type="password"
          placeholder="Nhập lại mật khẩu của bạn"
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
