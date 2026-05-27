import { useState } from 'react';
import { Link } from 'react-router-dom';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { PATHS } from '../../../routes/paths';

export default function LoginPage() {
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
        <h1 className="text-4xl font-bold font-display tracking-tight text-white transition-colors duration-500">Chào Mừng Bạn</h1>
        <p className="text-lg text-gray-300 transition-colors duration-500">Đăng nhập để kết nối cùng bạn bè</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Email hoặc Số điện thoại"
          type="text"
          placeholder="Nhập email hoặc số điện thoại"
          required
        />
        <Input
          label="Mật khẩu"
          type="password"
          placeholder="Nhập mật khẩu của bạn"
          required
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative flex items-center justify-center">
              <input type="checkbox" className="appearance-none w-5 h-5 rounded-full border border-gray-500/50 bg-white/10 checked:bg-primary checked:border-primary focus:ring-2 focus:ring-primary/30 transition-all cursor-pointer peer" />
              <svg className="absolute w-3 h-3 text-bg-dark pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity duration-300" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.6666 3.5L5.24992 9.91667L2.33325 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-sm text-gray-300 group-hover:text-white transition-colors">Ghi nhớ đăng nhập</span>
          </label>
          <a href="#" className="text-sm text-primary hover:text-primary-dark font-medium transition-colors">
            Quên mật khẩu?
          </a>
        </div>

        <Button type="submit" className="w-full" isLoading={isLoading}>
          Đăng Nhập
        </Button>
      </form>

      <div className="text-center">
        <p className="text-sm text-gray-300 transition-colors">
          Bạn chưa có tài khoản?{' '}
          <Link to={PATHS.REGISTER} className="text-primary hover:text-primary-dark font-bold transition-colors">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
