import { useEffect, useState } from 'react';
import { Percent, Save, Loader2, AlertCircle, DollarSign, Calculator, TrendingUp } from 'lucide-react';
import Sidebar from '../../../components/layout/Sidebar';
import SportyWatermarks from '../../../components/ui/SportyWatermarks';
import Button from '../../../components/ui/Button';
import { useTheme } from '../../../contexts/ThemeContext';
import { useSystemSettings } from '../hooks/useAdmin';
import toast from 'react-hot-toast';

export default function RevenueManagement() {
  const { theme } = useTheme();
  const { settings, isLoading, fetchSettings, updateSetting } = useSystemSettings();
  const [feeKey, setFeeKey] = useState('PlatformFeePercentage');
  const [feeValue, setFeeValue] = useState('5');
  const [originalValue, setOriginalValue] = useState('5');
  const [isSaving, setIsSaving] = useState(false);

  // Revenue Calculator Simulation State
  const [simBookingAmount, setSimBookingAmount] = useState('200000');

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (settings && settings.length > 0) {
      // Find the fee setting key in a case-insensitive, flexible manner
      const feeSetting = settings.find(s => 
        s.settingKey.toLowerCase() === 'platformfeepercentage' || 
        s.settingKey.toLowerCase() === 'platform_fee_percentage'
      );
      if (feeSetting) {
        setFeeKey(feeSetting.settingKey);
        setFeeValue(feeSetting.settingValue);
        setOriginalValue(feeSetting.settingValue);
      }
    }
  }, [settings]);

  const handleUpdateFee = async () => {
    const numericValue = parseFloat(feeValue);
    if (isNaN(numericValue) || numericValue < 0 || numericValue > 100) {
      toast.error('Phần trăm phí hoa hồng phải là số từ 0 đến 100.');
      return;
    }

    if (feeValue === originalValue) {
      toast.error('Giá trị chưa được thay đổi.');
      return;
    }

    try {
      setIsSaving(true);
      const success = await updateSetting(feeKey, feeValue);
      if (success) {
        setOriginalValue(feeValue);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  // Calculator computations
  const currentFeePercent = parseFloat(feeValue) || 0;
  const simulatedAmount = parseFloat(simBookingAmount) || 0;
  const platformEarnings = (simulatedAmount * currentFeePercent) / 100;
  const ownerEarnings = simulatedAmount - platformEarnings;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-950 dark:text-white font-display tracking-tight flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-emerald-600 dark:text-primary" />
              Quản lý Doanh thu & Chiết khấu
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-label mt-2">
              Thiết lập tỷ lệ chiết khấu (phí hoa hồng) hệ thống thu từ chủ sân cho mỗi lượt đặt sân.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 text-emerald-500 animate-spin mb-4" />
            <p className="text-sm text-gray-500 dark:text-gray-400 font-label">Đang tải cấu hình doanh thu...</p>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Primary Settings Card */}
            <div className="bg-white dark:bg-card-dark border border-gray-200 dark:border-border-dark rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden glass-panel">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500" />
              
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Percent className="w-5 h-5 text-emerald-500" />
                Cấu hình phí hoa hồng nền tảng (Platform Fee)
              </h3>

              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between p-5 rounded-2xl bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-border-dark/40">
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white font-label">
                    Phí hoa hồng dịch vụ
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-md">
                    Phần trăm được tự động khấu trừ vào số tiền thanh toán của khách đặt sân trước khi cộng vào ví của chủ sân.
                  </p>
                  <span className="inline-block mt-2 text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-primary px-2 py-0.5 rounded font-mono font-bold">
                    Key: {feeKey}
                  </span>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                  <div className="relative w-32">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      value={feeValue}
                      onChange={(e) => setFeeValue(e.target.value)}
                      className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0c0f17] text-sm font-bold text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 font-mono outline-none"
                    />
                    <Percent className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                  
                  <Button
                    onClick={handleUpdateFee}
                    disabled={isSaving || feeValue === originalValue}
                    isLoading={isSaving}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Lưu cấu hình
                  </Button>
                </div>
              </div>
            </div>

            {/* Simulated Tool Card */}
            <div className="bg-white dark:bg-card-dark border border-gray-200 dark:border-border-dark rounded-3xl p-6 sm:p-8 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2 border-b border-gray-100 dark:border-border-dark/60 pb-4">
                <Calculator className="w-5 h-5 text-emerald-500" />
                Công cụ giả lập phân bổ doanh thu
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 font-label">
                      Số tiền booking giả định (VND)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={simBookingAmount}
                        onChange={(e) => setSimBookingAmount(e.target.value)}
                        placeholder="Nhập số tiền..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0c0f17] text-sm text-gray-950 dark:text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 font-mono outline-none"
                      />
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-450 dark:text-gray-500 text-sm font-bold">$</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 text-xs text-amber-700 dark:text-amber-400 flex gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0 text-amber-500" />
                    <p className="leading-relaxed">
                      Phí hoa hồng này được áp dụng trực tiếp tại thời điểm tạo hóa đơn đặt sân thành công. Chủ sân sẽ nhận được phần tiền sau chiết khấu.
                    </p>
                  </div>
                </div>

                {/* Allocation Results */}
                <div className="p-5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-150/50 dark:border-white/5 space-y-4">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider font-label">
                    Kết quả phân bổ dự kiến
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Hệ thống thu (Platform Fee - {currentFeePercent}%):</span>
                      <span className="font-extrabold font-mono text-emerald-600 dark:text-primary">
                        {platformEarnings.toLocaleString('vi-VN')} VND
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm border-t border-gray-200 dark:border-white/5 pt-3">
                      <span className="text-gray-500 dark:text-gray-400">Chủ sân nhận ({100 - currentFeePercent}%):</span>
                      <span className="font-extrabold font-mono text-gray-900 dark:text-white">
                        {ownerEarnings.toLocaleString('vi-VN')} VND
                      </span>
                    </div>
                  </div>

                  <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden flex mt-4">
                    <div 
                      style={{ width: `${currentFeePercent}%` }} 
                      className="bg-emerald-500 h-full transition-all duration-300"
                      title="Platform share"
                    />
                    <div 
                      style={{ width: `${100 - currentFeePercent}%` }} 
                      className="bg-teal-500 h-full transition-all duration-300"
                      title="Owner share"
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase tracking-wider font-label">
                    <span>Nền tảng ({currentFeePercent}%)</span>
                    <span>Chủ sân ({100 - currentFeePercent}%)</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
