import { useEffect, useState } from 'react';
import { Settings, Save, Loader2, CreditCard, Building2, Key } from 'lucide-react';
import Sidebar from '../../../components/layout/Sidebar';
import SportyWatermarks from '../../../components/ui/SportyWatermarks';
import Button from '../../../components/ui/Button';
import { useTheme } from '../../../contexts/ThemeContext';
import { useSystemSettings } from '../hooks/useAdmin';
import toast from 'react-hot-toast';

export default function PaymentSettings() {
  const { theme } = useTheme();
  const { settings, isLoading, fetchSettings, updateSetting } = useSystemSettings();
  const [localSettings, setLocalSettings] = useState({
    Payment_BankName: '',
    Payment_AccountNumber: '',
    Payment_AccountName: '',
    Payment_PayOS_ClientId: '',
    Payment_PayOS_ApiKey: '',
    Payment_PayOS_ChecksumKey: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (settings && settings.length > 0) {
      const settingsMap = { ...localSettings };
      settings.forEach(s => {
        if (Object.keys(settingsMap).includes(s.settingKey)) {
          settingsMap[s.settingKey] = s.settingValue;
        }
      });
      setLocalSettings(settingsMap);
    }
  }, [settings]);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const keys = Object.keys(localSettings);
      for (const key of keys) {
        const value = localSettings[key];
        const originalValue = settings.find(s => s.settingKey === key)?.settingValue;
        
        // Only update if changed or new
        if (value !== originalValue) {
          await updateSetting(key, value || "", `Cấu hình thanh toán ${key}`);
        }
      }
      toast.success("Đã lưu cấu hình thanh toán thành công!");
    } catch (err) {
      toast.error("Lỗi khi lưu cấu hình.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (key, value) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#0c0f17]' : 'bg-gray-50'} flex relative overflow-hidden`}>
      <SportyWatermarks />
      <Sidebar activeMenu="payment-settings" />

      <div className="flex-1 h-screen overflow-y-auto custom-scrollbar">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-page">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white font-display tracking-tight flex items-center gap-3">
                <CreditCard className="w-8 h-8 text-emerald-600 dark:text-primary" />
                Cấu hình Thanh toán
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-label mt-2">
                Thiết lập thông tin tài khoản ngân hàng và cổng thanh toán PayOS để nhận tiền mua gói (Subscription).
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-10 w-10 text-emerald-500 animate-spin mb-4" />
              <p className="text-sm text-gray-500 dark:text-gray-400 font-label">Đang tải cấu hình...</p>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-6">
              
              {/* Bank Transfer Section */}
              <div className="bg-white dark:bg-card-dark border border-gray-200 dark:border-border-dark rounded-3xl p-6 sm:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6 border-b border-gray-100 dark:border-border-dark/60 pb-4">
                  <Building2 className="w-5 h-5 text-blue-500" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Thông tin chuyển khoản Ngân hàng</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 font-label">Tên Ngân hàng</label>
                    <input
                      type="text"
                      value={localSettings.Payment_BankName}
                      onChange={(e) => handleInputChange('Payment_BankName', e.target.value)}
                      placeholder="VD: MBBank, Vietcombank..."
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0c0f17] text-sm text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 font-label outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 font-label">Số Tài khoản</label>
                    <input
                      type="text"
                      value={localSettings.Payment_AccountNumber}
                      onChange={(e) => handleInputChange('Payment_AccountNumber', e.target.value)}
                      placeholder="VD: 0123456789"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0c0f17] text-sm text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 font-mono outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 font-label">Tên Chủ Tài khoản</label>
                    <input
                      type="text"
                      value={localSettings.Payment_AccountName}
                      onChange={(e) => handleInputChange('Payment_AccountName', e.target.value)}
                      placeholder="VD: NGUYEN VAN A"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0c0f17] text-sm text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 font-label uppercase outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* PayOS Section */}
              <div className="bg-white dark:bg-card-dark border border-gray-200 dark:border-border-dark rounded-3xl p-6 sm:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6 border-b border-gray-100 dark:border-border-dark/60 pb-4">
                  <Key className="w-5 h-5 text-purple-500" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Cấu hình API PayOS (Thanh toán tự động)</h3>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 font-label">Client ID</label>
                    <input
                      type="text"
                      value={localSettings.Payment_PayOS_ClientId}
                      onChange={(e) => handleInputChange('Payment_PayOS_ClientId', e.target.value)}
                      placeholder="Nhập Client ID của PayOS"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0c0f17] text-sm text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 font-mono outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 font-label">API Key</label>
                    <input
                      type="password"
                      value={localSettings.Payment_PayOS_ApiKey}
                      onChange={(e) => handleInputChange('Payment_PayOS_ApiKey', e.target.value)}
                      placeholder="Nhập API Key"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0c0f17] text-sm text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 font-mono outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 font-label">Checksum Key</label>
                    <input
                      type="password"
                      value={localSettings.Payment_PayOS_ChecksumKey}
                      onChange={(e) => handleInputChange('Payment_PayOS_ChecksumKey', e.target.value)}
                      placeholder="Nhập Checksum Key"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0c0f17] text-sm text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 font-mono outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" isLoading={isSaving} className="px-6 py-3">
                  <Save className="w-5 h-5 mr-2" />
                  Lưu cấu hình
                </Button>
              </div>

            </form>
          )}
        </div>
      </div>
    </div>
  );
}
