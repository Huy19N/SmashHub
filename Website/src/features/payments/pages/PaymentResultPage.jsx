import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, Clock, ArrowRight } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import Button from '../../../components/ui/Button';

export default function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  
  const status = searchParams.get('status') || '';
  const cancel = searchParams.get('cancel') === 'true';
  const orderCode = searchParams.get('orderCode');
  
  const [countdown, setCountdown] = useState(10);
  
  const isSuccess = status === 'PAID' && !cancel;
  const isCancelled = cancel || status === 'CANCELLED';
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/subscriptions'); // Redirect back to profile/subscriptions
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${theme === 'dark' ? 'bg-[#0c0f17]' : 'bg-gray-50'}`}>
      <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-3xl shadow-xl overflow-hidden">
        <div className="p-8 flex flex-col items-center text-center">
          {isSuccess ? (
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
          ) : isCancelled ? (
            <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-6">
              <Clock className="w-10 h-10 text-amber-500" />
            </div>
          ) : (
            <div className="w-20 h-20 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mb-6">
              <XCircle className="w-10 h-10 text-rose-500" />
            </div>
          )}
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 font-display">
            {isSuccess ? 'Thanh toán thành công!' : isCancelled ? 'Thanh toán đã hủy' : 'Thanh toán thất bại'}
          </h2>
          
          <p className="text-gray-500 dark:text-gray-400 mb-8 font-label">
            {isSuccess 
              ? `Cảm ơn bạn đã thanh toán. Giao dịch #${orderCode || ''} đã được ghi nhận.` 
              : isCancelled 
                ? 'Giao dịch của bạn đã bị hủy bỏ và chưa bị trừ tiền.' 
                : 'Rất tiếc, đã có lỗi xảy ra trong quá trình giao dịch. Vui lòng thử lại sau.'}
          </p>
          
          <div className="w-full space-y-3">
            <Button 
              onClick={() => navigate('/subscriptions')} 
              className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 ${isSuccess ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-gray-800 hover:bg-gray-900 text-white dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100'}`}
            >
              Quay lại ngay <ArrowRight className="w-4 h-4" />
            </Button>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Tự động chuyển hướng sau {countdown}s...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
