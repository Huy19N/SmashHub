import { useEffect, useState } from 'react';
import { Settings, Save, Loader2, AlertTriangle, Percent } from 'lucide-react';
import Button from '../../../components/ui/Button';
import { useTheme } from '../../../contexts/ThemeContext';
import { useSystemSettings } from '../hooks/useAdmin';
import toast from 'react-hot-toast';

export default function AdminSettings() {
  const { theme } = useTheme();
  const { settings, isLoading, fetchSettings, updateSetting } = useSystemSettings();
  const [localSettings, setLocalSettings] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (settings && settings.length > 0) {
      const settingsMap = {};
      settings.forEach(s => {
        settingsMap[s.settingKey] = s.settingValue;
      });
      setLocalSettings(settingsMap);
    }
  }, [settings]);

  const handleSave = async (key, description) => {
    const value = localSettings[key];
    if (value === undefined || value === null || value === '') {
      toast.error('Giá trị không được để trống.');
      return;
    }
    
    // Check if value is changed
    const originalValue = settings.find(s => s.settingKey === key)?.settingValue;
    if (value === originalValue) {
      toast.error('Giá trị chưa thay đổi.');
      return;
    }

    setIsSaving(true);
    await updateSetting(key, value);
    setIsSaving(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white font-display tracking-tight flex items-center gap-3">
              <Settings className="w-8 h-8 text-emerald-600 dark:text-primary" />
              Cài đặt hệ thống
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-label mt-2">
              Quản lý các thông số cấu hình chung của nền tảng (Phí nền tảng, v.v.).
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 text-emerald-500 animate-spin mb-4" />
            <p className="text-sm text-gray-500 dark:text-gray-400 font-label">Đang tải cấu hình...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {settings.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-card-dark rounded-3xl border border-gray-200 dark:border-border-dark shadow-sm">
                <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Chưa có cài đặt nào</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Không tìm thấy tham số cấu hình hệ thống trong cơ sở dữ liệu.</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-card-dark border border-gray-200 dark:border-border-dark rounded-3xl p-6 sm:p-8 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-border-dark/60 pb-4">
                  Tham số cấu hình
                </h3>
                
                <div className="space-y-6">
                  {settings.map((setting) => (
                    <div key={setting.settingKey} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-border-dark/40">
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white font-label">
                          {setting.description || setting.settingKey}
                        </h4>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 font-mono mt-1">
                          Key: {setting.settingKey}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="relative w-40">
                          <input
                            type={setting.settingKey.includes('PERCENTAGE') ? 'number' : 'text'}
                            step={setting.settingKey.includes('PERCENTAGE') ? '0.1' : undefined}
                            min={setting.settingKey.includes('PERCENTAGE') ? '0' : undefined}
                            max={setting.settingKey.includes('PERCENTAGE') ? '100' : undefined}
                            value={localSettings[setting.settingKey] !== undefined ? localSettings[setting.settingKey] : ''}
                            onChange={(e) => setLocalSettings(prev => ({...prev, [setting.settingKey]: e.target.value}))}
                            className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0c0f17] text-sm text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 font-mono outline-none"
                          />
                          {setting.settingKey.includes('PERCENTAGE') && (
                            <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          )}
                        </div>
                        <Button
                          onClick={() => handleSave(setting.settingKey, setting.description)}
                          disabled={isSaving || localSettings[setting.settingKey] === setting.settingValue}
                          isLoading={isSaving}
                          className="px-4 py-2.5 rounded-xl text-xs whitespace-nowrap"
                        >
                          <Save className="w-4 h-4 mr-1.5" />
                          Cập nhật
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
