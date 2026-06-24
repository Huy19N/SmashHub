import React, { useState, useEffect } from 'react';
import { Building, X, AlertTriangle, CheckCircle2, Save, MapPin } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import Button from '../../../components/ui/Button';

// Fix for default Leaflet icon not showing in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

const hoangSaIcon = L.divIcon({
  className: 'custom-island-label',
  html: '<div style="font-weight: 900; color: #b91c1c; text-shadow: 2px 2px 0 #fff, -2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff; font-size: 14px; white-space: nowrap;">Hoàng Sa (Việt Nam)</div>',
  iconSize: [150, 20],
  iconAnchor: [75, 10]
});

const truongSaIcon = L.divIcon({
  className: 'custom-island-label',
  html: '<div style="font-weight: 900; color: #b91c1c; text-shadow: 2px 2px 0 #fff, -2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff; font-size: 14px; white-space: nowrap;">Trường Sa (Việt Nam)</div>',
  iconSize: [150, 20],
  iconAnchor: [75, 10]
});

const southSeaIcon = L.divIcon({
  className: 'custom-sea-label',
  html: '<div style="font-weight: bold; color: #1d4ed8; text-shadow: 1px 1px 0 #fff, -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff; font-size: 16px; font-style: italic; white-space: nowrap;">Biển Đông (South Sea)</div>',
  iconSize: [200, 20],
  iconAnchor: [100, 10]
});

export default function EditFacilityModal({
  isOpen,
  onClose,
  facility,
  onSave
}) {
  const [editFacName, setEditFacName] = useState('');
  const [editFacCity, setEditFacCity] = useState('');
  const [editFacDistrict, setEditFacDistrict] = useState('');
  const [editFacAddress, setEditFacAddress] = useState('');
  const [editFacLatitude, setEditFacLatitude] = useState(null);
  const [editFacLongitude, setEditFacLongitude] = useState(null);
  const [editFacBusinessCode, setEditFacBusinessCode] = useState('');
  const [isEditLocationConfirmed, setIsEditLocationConfirmed] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState('');

  useEffect(() => {
    if (facility) {
      setEditFacName(facility.name || '');
      setEditFacCity(facility.city || '');
      setEditFacDistrict(facility.district || '');
      setEditFacAddress(facility.address || '');
      setEditFacLatitude(facility.latitude || 10.762622);
      setEditFacLongitude(facility.longitude || 106.660172);
      setEditFacBusinessCode(facility.businessCode || '');
      setIsEditLocationConfirmed(true);
      setEditError('');
    }
  }, [facility]);

  if (!isOpen || !facility) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEditError('');
    if (!editFacName.trim() || !editFacCity.trim() || !editFacDistrict.trim()) {
      setEditError('Vui lòng điền đầy đủ các thông tin bắt buộc.');
      return;
    }
    if (editFacLatitude === null || editFacLongitude === null) {
      setEditError('Vui lòng chọn vị trí cơ sở trên bản đồ.');
      return;
    }
    if (!isEditLocationConfirmed) {
      setEditError('Vui lòng bấm nút "Xác nhận vị trí" dưới bản đồ trước khi tiếp tục.');
      return;
    }

    setIsSaving(true);
    try {
      await onSave(facility.facilityId, {
        name: editFacName,
        city: editFacCity,
        district: editFacDistrict,
        address: editFacAddress || `${editFacDistrict}, ${editFacCity}`,
        latitude: editFacLatitude,
        longitude: editFacLongitude,
        businessCode: editFacBusinessCode
      });
      onClose();
    } catch (err) {
      const backendMessage = err.response?.data?.message || err.response?.data?.title || err.message;
      setEditError(backendMessage || 'Lỗi khi cập nhật cơ sở.');
    } finally {
      setIsSaving(false);
    }
  };

  const EditLocationPickerMarker = () => {
    useMapEvents({
      click(e) {
        setEditFacLatitude(e.latlng.lat);
        setEditFacLongitude(e.latlng.lng);
        setIsEditLocationConfirmed(false);
      },
    });
    return editFacLatitude && editFacLongitude ? (
      <Marker position={[editFacLatitude, editFacLongitude]} icon={DefaultIcon} />
    ) : null;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[999] p-4 overflow-y-auto animate-fadeIn">
      <div className="absolute inset-0" onClick={onClose}></div>
      <div className="bg-white dark:bg-card-dark w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl border border-gray-150 dark:border-border-dark/60 transform transition-all duration-300 animate-scaleIn z-10 my-8">
        
        <div className="relative p-6 border-b border-gray-100 dark:border-border-dark/40 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-gray-900 dark:text-white font-display">Cập nhật thông tin cơ sở</h3>
            <p className="text-[10px] text-gray-400 font-label mt-0.5">Mã cơ sở: #{facility.facilityId}</p>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar text-sm">
          {editError && (
            <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-150 dark:border-red-500/20 rounded-xl text-xs text-red-650 dark:text-red-400 font-label flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{editError}</span>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 dark:text-gray-400 font-label mb-1.5">
              Tên cơ sở <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ví dụ: CLB Cầu lông SmashHub Arena Q10"
              value={editFacName}
              onChange={(e) => setEditFacName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-border-dark text-sm bg-transparent text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 font-label transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 dark:text-gray-400 font-label mb-1.5">
                Thành phố <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Hồ Chí Minh"
                value={editFacCity}
                onChange={(e) => setEditFacCity(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-border-dark text-sm bg-transparent text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 font-label transition-colors"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 dark:text-gray-400 font-label mb-1.5">
                Quận / Huyện <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Quận 10"
                value={editFacDistrict}
                onChange={(e) => setEditFacDistrict(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-border-dark text-sm bg-transparent text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 font-label transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 dark:text-gray-400 font-label mb-1.5">
              Địa chỉ chi tiết
            </label>
            <input
              type="text"
              placeholder="Ví dụ: 285 Cách Mạng Tháng 8, Phường 12"
              value={editFacAddress}
              onChange={(e) => setEditFacAddress(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-border-dark text-sm bg-transparent text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 font-label transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 dark:text-gray-400 font-label mb-1.5">
              Mã số doanh nghiệp (GPKD)
            </label>
            <input
              type="text"
              placeholder="Nhập mã số doanh nghiệp nếu có"
              value={editFacBusinessCode}
              onChange={(e) => setEditFacBusinessCode(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-border-dark text-sm bg-transparent text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 font-label transition-colors"
            />
          </div>

          {/* Map Selection */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 dark:text-gray-400 font-label mb-1.5 flex justify-between">
              <span>Vị trí trên bản đồ</span>
              <span className="text-[10px] text-gray-400 font-normal">Click vào bản đồ để cập nhật vị trí</span>
            </label>
            <div className="h-64 rounded-xl overflow-hidden border border-gray-200 dark:border-border-dark relative z-0">
              <MapContainer 
                center={[editFacLatitude || 10.762622, editFacLongitude || 106.660172]} 
                zoom={13} 
                minZoom={5}
                maxBounds={[[4.0, 100.0], [24.0, 122.0]]}
                maxBoundsViscosity={1.0}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; Google Maps'
                  url="https://mt1.google.com/vt/lyrs=m&hl=vi&gl=VN&x={x}&y={y}&z={z}"
                />
                <Marker position={[16.5, 112.0]} icon={hoangSaIcon} interactive={false} />
                <Marker position={[10.0, 114.0]} icon={truongSaIcon} interactive={false} />
                <Marker position={[14.0, 113.0]} icon={southSeaIcon} interactive={false} />
                <EditLocationPickerMarker />
              </MapContainer>
            </div>
            {editFacLatitude && editFacLongitude ? (
              <div className="mt-3 flex items-center justify-between gap-3 p-3 bg-gray-50 dark:bg-white/5 border border-gray-150 dark:border-white/10 rounded-2xl">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider font-label">Tọa độ đã chọn</span>
                  <span className="text-xs font-mono font-bold text-gray-700 dark:text-gray-300">
                    {editFacLatitude.toFixed(6)}, {editFacLongitude.toFixed(6)}
                  </span>
                </div>
                {isEditLocationConfirmed ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Đã xác nhận vị trí
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsEditLocationConfirmed(false)}
                      className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 dark:bg-white/10 dark:hover:bg-white/20 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-lg transition-all active:scale-95 cursor-pointer"
                    >
                      Chỉnh sửa
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditLocationConfirmed(true)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-primary dark:hover:bg-primary/95 text-white dark:text-[#052e14] text-xs font-black rounded-xl shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/25 transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Xác nhận vị trí này
                  </button>
                )}
              </div>
            ) : (
              <div className="mt-3 p-3 rounded-2xl bg-amber-50 dark:bg-amber-500/5 border border-amber-200/50 dark:border-amber-500/10 flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-500 shrink-0" />
                <span className="text-xs text-amber-800 dark:text-amber-400/90 font-bold font-label">
                  Vui lòng click chọn một vị trí bất kỳ trên bản đồ ở trên.
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-border-dark/40">
            <Button
              type="submit"
              isLoading={isSaving}
              disabled={!isEditLocationConfirmed || isSaving}
              className={`flex-1 ${!isEditLocationConfirmed ? 'opacity-40 cursor-not-allowed select-none' : ''}`}
            >
              <Save className="w-4 h-4" />
              Lưu thay đổi
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs"
            >
              Hủy
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
