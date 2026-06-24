import { useEffect, useState } from 'react';
import { Check, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import Button from '../../../components/ui/Button';
import { useTheme } from '../../../contexts/ThemeContext';
import api, { getAccessToken } from '../../../config/axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function SubscriptionPackages() {
  const { theme } = useTheme();
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await api.get('/api/subscriptions/plans');
        setPlans(response.data.data);
      } catch (err) {
        toast.error('Lỗi khi tải danh sách gói.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handleSubscribe = async (planId) => {
    if (!getAccessToken()) {
      toast.error('Vui lòng đăng nhập để đăng ký gói.');
      navigate('/login');
      return;
    }

    setIsProcessing(true);
    try {
      const response = await api.post('/api/payments/subscription', { planId, returnUrl: window.location.origin + '/profile?payment=success' });
      if (response.data.data?.checkoutUrl) {
        window.location.href = response.data.data.checkoutUrl;
      } else {
        toast.error('Lỗi hệ thống khi tạo link thanh toán.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi đăng ký gói.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#0c0f17]' : 'bg-gray-50'} py-12 px-4 sm:px-6 lg:px-8 font-sans`}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl font-display">
            Nâng cấp Trải nghiệm của Bạn
          </h2>
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-400 font-label">
            Chọn gói dịch vụ phù hợp nhất để mở khóa các tính năng quản lý câu lạc bộ, bắt kèo và kết nối mạnh mẽ.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
          </div>
        ) : (
          <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-2">
            {plans.map((plan) => {
              const isPro = plan.price > 0;
              return (
                <div key={plan.planId} className={`rounded-3xl border shadow-xl flex flex-col ${isPro ? 'border-emerald-500 bg-emerald-50/10 dark:bg-emerald-900/10 relative' : 'border-gray-200 dark:border-border-dark bg-white dark:bg-card-dark'}`}>
                  {isPro && (
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-4">
                      <span className="inline-flex rounded-full bg-emerald-500 px-4 py-1 text-sm font-bold tracking-wider text-white uppercase shadow-lg shadow-emerald-500/30 flex items-center gap-1.5 font-display">
                        <Sparkles className="w-4 h-4" /> Đề xuất
                      </span>
                    </div>
                  )}
                  <div className="p-8 flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white font-display mb-2">{plan.tierName}</h3>
                    <p className="mt-4 flex items-baseline text-gray-900 dark:text-white">
                      <span className="text-5xl font-extrabold tracking-tight font-display">
                        {plan.price === 0 ? 'Miễn phí' : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(plan.price)}
                      </span>
                      {plan.price > 0 && <span className="ml-1 text-xl font-medium text-gray-500 dark:text-gray-400">/{plan.durationMonths} tháng</span>}
                    </p>
                    <ul className="mt-8 space-y-4">
                      {(plan.features?.split('\\n') || plan.features?.split(',') || ['Các tính năng cơ bản']).map((feature, idx) => (
                        <li key={idx} className="flex items-start">
                          <div className="flex-shrink-0">
                            <Check className={`h-6 w-6 ${isPro ? 'text-emerald-500' : 'text-gray-400'}`} />
                          </div>
                          <p className="ml-3 text-base text-gray-700 dark:text-gray-300 font-label">
                            {feature.trim()}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-8 bg-gray-50 dark:bg-white/5 rounded-b-3xl border-t border-gray-100 dark:border-border-dark">
                    <Button 
                      onClick={() => handleSubscribe(plan.planId)} 
                      disabled={isProcessing || plan.price === 0} 
                      isLoading={isProcessing && plan.price > 0}
                      className={`w-full py-4 text-lg font-bold font-display rounded-2xl transition-all ${isPro ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20' : 'bg-gray-800 hover:bg-gray-900 text-white dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100'}`}
                    >
                      {plan.price === 0 ? 'Đang sử dụng' : 'Nâng cấp ngay'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
