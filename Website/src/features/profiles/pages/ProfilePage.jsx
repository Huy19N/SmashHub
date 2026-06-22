import { useState, useEffect } from 'react';
import {
  User, Mail, Phone, Shield, Calendar, Edit3, Plus, Trash2, Save, X, Loader2, Award,
  Activity, TrendingUp, CheckCircle2, AlertCircle
} from 'lucide-react';
import Sidebar from '../../../components/layout/Sidebar';
import SportyWatermarks from '../../../components/ui/SportyWatermarks';
import Button from '../../../components/ui/Button';
import { useTheme } from '../../../contexts/ThemeContext';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  useGetMyProfile,
  useUpdateUser,
  useGetAllUserSportProfiles,
  useCreateUserSportProfile,
  useUpdateUserSportProfile,
  useDeleteUserSportProfile,
  useGetUserOnline,
  useUploadUserAvatar
} from '../hooks/useProfiles.js';
import { useVerifyEmailInProfile, useVerifyEmailRegister } from '../../Auth/hooks/useAuth';
import { getAllSportsAPI, getSportLevelAPI } from '../../bookings/api/bookings.api.js';
import { getAvatarUrl } from '../../../utils/avatarUtils';
import toast from 'react-hot-toast';
import { usePresenceSignalR } from '../../../hooks/usePresenceSignalR';

export default function ProfilePage() {
  const { theme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const isActiveStr = localStorage.getItem('isActive');
  const isAccountActive = isActiveStr === 'true' || isActiveStr === 'True' || isActiveStr === null;

  useEffect(() => {
    if (location.state?.requireActivation) {
      toast.error('Bạn cần xác thực email để sử dụng chức năng này!', {
        duration: 4000,
        position: 'top-center',
      });
      // Clear the state so it doesn't show again on reload
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  // Profile info hooks
  const { user: profileData, isLoading: isProfileLoading, error: profileError, refetch: refetchProfile } = useGetMyProfile();
  const { updateUser, isLoading: isUpdatingUser } = useUpdateUser();
  const { uploadUserAvatar, isLoading: isUploadingAvatar } = useUploadUserAvatar();

  // Online status hooks
  const { userOnline, isLoading: isOnlineLoading } = useGetUserOnline(profileData?.userId || profileData?.id);
  const initialIsOnline = userOnline === true || userOnline?.isOnline === true || userOnline?.status === 'online' || userOnline?.status === true;
  const isOnline = usePresenceSignalR(profileData?.userId || profileData?.id, initialIsOnline);

  // Sport profile hooks
  const { userSportProfiles, isLoading: isSportProfilesLoading, refetch: refetchSportProfiles } = useGetAllUserSportProfiles();
  const { createUserSportProfile, isLoading: isCreatingSport } = useCreateUserSportProfile();
  const { updateUserSportProfile, isLoading: isUpdatingSport } = useUpdateUserSportProfile();
  const { deleteUserSportProfile, isLoading: isDeletingSport } = useDeleteUserSportProfile();

  // Component state
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [infoError, setInfoError] = useState('');
  const [infoSuccess, setInfoSuccess] = useState('');

  // Email Verification State
  const [isShowingOTPInput, setIsShowingOTPInput] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);

  // Sports database lists
  const [availableSports, setAvailableSports] = useState([]);
  const [isLoadingAvailableSports, setIsLoadingAvailableSports] = useState(false);
  const [selectedAddSportId, setSelectedAddSportId] = useState('');
  const [selectedAddLevels, setSelectedAddLevels] = useState([]);
  const [selectedAddRankValue, setSelectedAddRankValue] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [sportError, setSportError] = useState('');

  // Verification hooks
  const { verifyEmail } = useVerifyEmailInProfile();
  const { verifyEmailRegister: verifyOTP } = useVerifyEmailRegister();

  // Handlers for Email Verification
  const handleSendOTP = async () => {
    setIsSendingOTP(true);
    try {
      await verifyEmail(profileData?.email);
      toast.success('Mã xác nhận đã được gửi đến email của bạn.');
      setIsShowingOTPInput(true);
    } catch (err) {
      toast.error(err || 'Không thể gửi mã xác nhận. Vui lòng thử lại.');
    } finally {
      setIsSendingOTP(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpCode.trim()) {
      toast.error('Vui lòng nhập mã OTP.');
      return;
    }
    setIsVerifyingOTP(true);
    try {
      await verifyOTP(profileData?.email, otpCode);
      toast.success('Xác thực email thành công!');
      localStorage.setItem('isActive', 'true');
      setIsShowingOTPInput(false);
      window.location.reload(); // Reload to refresh protected routes and UI
    } catch (err) {
      toast.error(err || 'Mã OTP không hợp lệ hoặc đã hết hạn.');
    } finally {
      setIsVerifyingOTP(false);
    }
  };

  // Editing sport levels state
  const [editingSportId, setEditingSportId] = useState(null);
  const [editingLevels, setEditingLevels] = useState([]);
  const [editingRankValue, setEditingRankValue] = useState('');

  // Fetch initial profile editing fields
  useEffect(() => {
    if (profileData) {
      setEditName(profileData.fullName || '');
      setEditPhone(profileData.phoneNumber || '');
    }
  }, [profileData]);

  // Handle avatar file selection & upload
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn tệp tin hình ảnh.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước ảnh không được vượt quá 5MB.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      await uploadUserAvatar(formData);
      toast.success('Cập nhật ảnh đại diện thành công!');
      refetchProfile();
    } catch (err) {
      toast.error(err.message || 'Lỗi khi cập nhật ảnh đại diện.');
    }
  };

  // Fetch all sports from database
  const fetchAvailableSports = async () => {
    setIsLoadingAvailableSports(true);
    try {
      const res = await getAllSportsAPI();
      setAvailableSports(res?.data ?? []);
    } catch (err) {
      console.error('Lỗi khi tải danh sách môn thể thao:', err);
    } finally {
      setIsLoadingAvailableSports(false);
    }
  };

  useEffect(() => {
    fetchAvailableSports();
  }, []);

  // Fetch levels when user selects a sport in Add Modal
  const handleSportSelectionChange = async (sportId) => {
    setSelectedAddSportId(sportId);
    setSelectedAddRankValue('');
    if (!sportId) {
      setSelectedAddLevels([]);
      return;
    }
    try {
      const res = await getSportLevelAPI(sportId);
      setSelectedAddLevels(res?.data ?? []);
    } catch (err) {
      console.error('Lỗi khi tải danh sách cấp độ:', err);
      setSelectedAddLevels([]);
    }
  };

  // Fetch levels when user wants to edit a sport
  const startEditSportLevel = async (sport) => {
    setEditingSportId(sport.sportId);
    setEditingRankValue(sport.rankValue);
    try {
      const res = await getSportLevelAPI(sport.sportId);
      setEditingLevels(res?.data ?? []);
    } catch (err) {
      console.error('Lỗi khi tải danh sách cấp độ chỉnh sửa:', err);
      setEditingLevels([]);
    }
  };

  // Handle saving general user info changes
  const handleSaveInfo = async (e) => {
    e.preventDefault();
    setInfoError('');
    setInfoSuccess('');

    if (!editName.trim()) {
      setInfoError('Tên hiển thị không được để trống.');
      return;
    }

    try {
      await updateUser({
        fullName: editName,
        phoneNumber: editPhone
      });
      setInfoSuccess('Cập nhật thông tin thành công!');
      setIsEditingInfo(false);
      refetchProfile();
    } catch (err) {
      setInfoError(err.message || 'Lỗi khi cập nhật thông tin.');
    }
  };

  // Handle adding new sport profile
  const handleAddSportProfile = async (e) => {
    e.preventDefault();
    setSportError('');

    if (!selectedAddSportId || !selectedAddRankValue) {
      setSportError('Vui lòng chọn môn thể thao và cấp độ của bạn.');
      return;
    }

    try {
      await createUserSportProfile({
        sportId: parseInt(selectedAddSportId),
        rankValue: parseInt(selectedAddRankValue)
      });
      setShowAddModal(false);
      setSelectedAddSportId('');
      setSelectedAddRankValue('');
      setSelectedAddLevels([]);
      refetchSportProfiles();
    } catch (err) {
      setSportError(err.message || 'Lỗi khi khai báo trình độ.');
    }
  };

  // Handle updating sport level
  const handleUpdateSportLevel = async (sportId) => {
    try {
      await updateUserSportProfile(sportId, {
        rankValue: parseInt(editingRankValue)
      });
      setEditingSportId(null);
      refetchSportProfiles();
    } catch (err) {
      console.error('Lỗi cập nhật cấp độ thể thao:', err);
      alert('Lỗi cập nhật cấp độ: ' + (err.message || 'Thử lại sau.'));
    }
  };

  // Handle deleting sport profile
  const handleDeleteSport = async (sportId, sportName) => {
    if (confirm(`Bạn có chắc chắn muốn xóa trình độ môn ${sportName}?`)) {
      try {
        await deleteUserSportProfile(sportId);
        refetchSportProfiles();
      } catch (err) {
        console.error('Lỗi xóa trình độ thể thao:', err);
        alert('Lỗi khi xóa trình độ: ' + (err.message || 'Thử lại sau.'));
      }
    }
  };

  // Get initials for the avatar badge
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Format date utility
  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa rõ';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Filter out sports that user has already added
  const filterSportsNotDeclared = () => {
    return availableSports.filter(
      (sport) => !userSportProfiles.some((profile) => profile.sportId === sport.sportId)
    );
  };

  const sportsNotDeclared = filterSportsNotDeclared();

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#0c0f17]' : 'bg-gray-50'} flex relative overflow-hidden`}>
      <SportyWatermarks />
      <Sidebar activeMenu="profile" />

      <div className="flex-1 h-screen overflow-y-auto custom-scrollbar">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-page">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 dark:text-white font-display tracking-tight">
            Trang cá nhân
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-label mt-1">
            Quản lý thông tin tài khoản và trình độ thể thao của bạn.
          </p>
        </div>

        {/* Verification Banner */}
        {!isAccountActive && (
          <div className="mb-8 p-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-bold text-amber-900 dark:text-amber-100 font-display">Tài khoản chưa được kích hoạt</h3>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">Bạn cần xác thực email để có thể sử dụng các tính năng đặt sân, tìm trận và quản lý nhóm.</p>
                
                {!isShowingOTPInput && (
                  <Button 
                    variant="primary" 
                    className="mt-3 bg-amber-500 hover:bg-amber-600 text-white border-none"
                    onClick={handleSendOTP}
                    isLoading={isSendingOTP}
                  >
                    Gửi mã xác nhận
                  </Button>
                )}

                {isShowingOTPInput && (
                  <div className="mt-4 flex items-center gap-3">
                    <input 
                      type="text" 
                      placeholder="Nhập mã OTP..." 
                      className="px-4 py-2 border border-amber-300 rounded-lg dark:bg-amber-900/40 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                    />
                    <Button 
                      onClick={handleVerifyOTP} 
                      isLoading={isVerifyingOTP}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      Xác nhận
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {isProfileLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 text-emerald-500 animate-spin mb-4" />
            <p className="text-sm text-gray-500 dark:text-gray-400 font-label">Đang tải thông tin cá nhân...</p>
          </div>
        ) : profileError ? (
          <div className="p-6 text-center bg-red-50 dark:bg-red-500/10 rounded-2xl border border-red-150 dark:border-red-500/20 max-w-md mx-auto">
            <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-red-800 dark:text-red-400 font-display">Đã xảy ra lỗi</h3>
            <p className="text-sm text-red-600 dark:text-red-400/80 font-label mt-1">{profileError}</p>
            <Button
              variant="primary"
              onClick={refetchProfile}
              className="mt-4 bg-red-600 hover:bg-red-700 text-white border-none shadow-none text-xs"
            >
              Thử lại
            </Button>
          </div>
        ) : (
          <div className="space-y-8 pb-16">

            {/* User Profile Card (Hero Banner) */}
            <div className="relative overflow-hidden bg-white dark:bg-card-dark border border-gray-200/80 dark:border-border-dark/60 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Decorative top colored strip */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600" />

              <div className="relative">
                <input
                  type="file"
                  id="avatar-upload-input"
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  disabled={isUploadingAvatar}
                />
                <label
                  htmlFor="avatar-upload-input"
                  className="relative group cursor-pointer block"
                >
                  {profileData?.avatarFileId ? (
                    <img
                      src={getAvatarUrl(profileData.avatarFileId)}
                      alt={profileData.fullName}
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover shadow-md border-4 border-white dark:border-gray-800 transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    style={{ display: profileData?.avatarFileId ? 'none' : 'flex' }}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white font-extrabold text-3xl sm:text-4xl shadow-md border-4 border-white dark:border-gray-800 select-none transition-transform duration-300 group-hover:scale-105"
                  >
                    {getInitials(profileData?.fullName)}
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity duration-300">
                    {isUploadingAvatar ? (
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    ) : (
                      <span className="text-[10px] text-white font-bold uppercase tracking-wider text-center px-1">Thay đổi ảnh</span>
                    )}
                  </div>

                  {/* Edit Icon Button */}
                  <div className="absolute bottom-0 right-0 bg-emerald-500 text-white p-1.5 rounded-full shadow-md border border-white dark:border-gray-800 transition-transform duration-300 hover:scale-110">
                    <Edit3 className="w-3.5 h-3.5" />
                  </div>
                </label>
              </div>

              <div className="flex-1 text-center md:text-left pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 justify-center md:justify-start">
                  <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white font-display">
                    {profileData?.fullName}
                  </h2>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-primary border border-emerald-100 dark:border-emerald-500/20 self-center">
                    <Shield className="w-3 h-3" />
                    {profileData?.roleName === 'User' ? 'Thành viên' : profileData?.roleName}
                  </span>
                </div>

                <p className="text-sm text-gray-500 dark:text-gray-400 font-label mt-1.5 flex items-center justify-center md:justify-start gap-1.5">
                  <Mail className="w-4 h-4 text-gray-400" />
                  {profileData?.email}
                </p>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-2 mt-4 text-xs text-gray-400 dark:text-gray-500 font-label border-t border-gray-100 dark:border-border-dark/30 pt-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Đã tham gia: {formatDate(profileData?.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {isOnlineLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-500" />
                    ) : isOnline ? (
                      <>
                        <span className="relative flex h-2 w-2 mr-1">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span>Trạng thái: Trực tuyến (Online)</span>
                      </>
                    ) : (
                      <>
                        <span className="w-2 h-2 rounded-full bg-gray-400 mr-1.5"></span>
                        <span>Trạng thái: Ngoại tuyến (Offline)</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Grid Detail Modules */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

              {/* LEFT Column: Account details & Editing form (2/5 size) */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white dark:bg-card-dark border border-gray-200/80 dark:border-border-dark/60 rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100 dark:border-border-dark/40">
                    <h3 className="font-bold text-gray-900 dark:text-white font-display flex items-center gap-2">
                      <User className="w-5 h-5 text-emerald-500" />
                      Thông tin cá nhân
                    </h3>
                    {!isEditingInfo && (
                      <button
                        onClick={() => {
                          setEditName(profileData?.fullName || '');
                          setEditPhone(profileData?.phoneNumber || '');
                          setIsEditingInfo(true);
                          setInfoError('');
                          setInfoSuccess('');
                        }}
                        className="text-xs font-bold text-emerald-600 dark:text-primary hover:text-emerald-700 dark:hover:text-primary-dark flex items-center gap-1 py-1 px-2.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Chỉnh sửa
                      </button>
                    )}
                  </div>

                  {infoError && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-150 dark:border-red-500/20 rounded-xl text-xs text-red-600 dark:text-red-400 font-label flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{infoError}</span>
                    </div>
                  )}

                  {infoSuccess && (
                    <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-150 dark:border-emerald-500/20 rounded-xl text-xs text-emerald-600 dark:text-primary font-label flex items-start gap-2 animate-fadeIn">
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
                      <span>{infoSuccess}</span>
                    </div>
                  )}

                  {isEditingInfo ? (
                    <form onSubmit={handleSaveInfo} className="space-y-4">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 font-label mb-1.5">
                          Tên hiển thị
                        </label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-border-dark text-sm bg-transparent text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 font-label transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 font-label mb-1.5">
                          Email
                        </label>
                        <input
                          type="email"
                          value={profileData?.email || ''}
                          disabled
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-border-dark text-sm bg-gray-50 dark:bg-white/5 text-gray-400 cursor-not-allowed font-label"
                        />
                        <span className="text-[10px] text-gray-400 mt-1 block">Email liên kết tài khoản không thể chỉnh sửa.</span>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 font-label mb-1.5">
                          Số điện thoại
                        </label>
                        <input
                          type="text"
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                          placeholder="Chưa cập nhật số điện thoại"
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-border-dark text-sm bg-transparent text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 font-label transition-colors"
                        />
                      </div>

                      <div className="flex items-center gap-3 pt-2">
                        <Button
                          type="submit"
                          isLoading={isUpdatingUser}
                          variant="primary"
                          className="flex-1 py-2.5 text-xs shadow-md"
                        >
                          <Save className="w-4 h-4" />
                          Lưu thay đổi
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => setIsEditingInfo(false)}
                          className="py-2.5 text-xs"
                        >
                          Hủy
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-5">
                      <div className="flex items-start gap-3.5">
                        <div className="h-9 w-9 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400 shrink-0">
                          <User className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider font-label">Tên đầy đủ</p>
                          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-0.5 break-words font-label">
                            {profileData?.fullName}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3.5">
                        <div className="h-9 w-9 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400 shrink-0">
                          <Mail className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider font-label">Địa chỉ email</p>
                          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-0.5 break-words font-label">
                            {profileData?.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3.5">
                        <div className="h-9 w-9 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400 shrink-0">
                          <Phone className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider font-label">Số điện thoại</p>
                          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-0.5 break-words font-label">
                            {profileData?.phoneNumber || 'Chưa cập nhật'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT Column: Sports, Levels and Ranks (3/5 size) */}
              <div className="lg:col-span-3 space-y-6">
                <div className="bg-white dark:bg-card-dark border border-gray-200/80 dark:border-border-dark/60 rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100 dark:border-border-dark/40">
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white font-display flex items-center gap-2">
                        <Activity className="w-5 h-5 text-emerald-500 animate-pulse" />
                        Trình độ thể thao
                      </h3>
                      <p className="text-[10px] text-gray-400 mt-1 font-label">Độ tương thích khi mở kèo, đặt sân giao lưu</p>
                    </div>
                    {sportsNotDeclared.length > 0 && (
                      <Button
                        onClick={() => {
                          setShowAddModal(true);
                          setSportError('');
                          setSelectedAddSportId('');
                          setSelectedAddLevels([]);
                          setSelectedAddRankValue('');
                        }}
                        variant="primary"
                        className="py-2 px-3 text-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Khai báo trình độ
                      </Button>
                    )}
                  </div>

                  {isSportProfilesLoading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-2" />
                      <p className="text-xs text-gray-400 font-label">Đang tải danh sách trình độ...</p>
                    </div>
                  ) : userSportProfiles.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-border-dark/40 rounded-2xl p-6">
                      <Award className="h-10 w-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white font-display">Chưa khai báo trình độ</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-label mt-1 max-w-sm mx-auto leading-relaxed">
                        Khai báo các bộ môn thể thao bạn chơi kèm trình độ để mọi người dễ dàng ghép cặp ghép sân khi tạo lịch trình giao lưu.
                      </p>
                      {sportsNotDeclared.length > 0 && (
                        <Button
                          onClick={() => setShowAddModal(true)}
                          variant="outline"
                          className="mt-4 py-1.5 px-3 text-xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Khai báo ngay
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {userSportProfiles.map((sport) => {
                        const isCurrentlyEditing = editingSportId === sport.sportId;
                        return (
                          <div
                            key={sport.sportId}
                            className="p-5 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-50/50 dark:from-white/5 dark:to-white/[0.02] border border-gray-200/60 dark:border-border-dark/40 flex flex-col justify-between hover:shadow-md transition-shadow relative"
                          >
                            <div className="absolute top-4 right-4 flex items-center gap-1.5">
                              {!isCurrentlyEditing && (
                                <>
                                  <button
                                    onClick={() => startEditSportLevel(sport)}
                                    className="p-1.5 text-gray-400 hover:text-emerald-600 dark:hover:text-primary hover:bg-white dark:hover:bg-white/5 rounded-lg shadow-sm border border-transparent hover:border-gray-150 transition-all cursor-pointer"
                                    title="Chỉnh sửa trình độ"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteSport(sport.sportId, sport.sportName)}
                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-white dark:hover:bg-white/5 rounded-lg shadow-sm border border-transparent hover:border-red-100 transition-all cursor-pointer"
                                    title="Xóa môn thể thao"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </div>

                            <div className="space-y-4">
                              <div className="flex items-center gap-2.5">
                                <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                                  <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-primary animate-pulse" />
                                </div>
                                <div>
                                  <h4 className="font-extrabold text-sm text-gray-800 dark:text-white font-display">
                                    {sport.sportName}
                                  </h4>
                                  <p className="text-[9px] text-gray-400 font-label mt-0.5">
                                    Cập nhật: {new Date(sport.updatedAt).toLocaleDateString('vi-VN')}
                                  </p>
                                </div>
                              </div>

                              <div className="pt-2">
                                {isCurrentlyEditing ? (
                                  <div className="space-y-3">
                                    <div>
                                      <label className="block text-[9px] font-bold uppercase tracking-wider text-gray-500 mb-1 font-label">
                                        Chọn Trình Độ Mới
                                      </label>
                                      <select
                                        value={editingRankValue}
                                        onChange={(e) => setEditingRankValue(e.target.value)}
                                        className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-border-dark bg-white dark:bg-card-dark text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 font-label"
                                      >
                                        <option value="">Chọn trình độ...</option>
                                        {editingLevels.map((lvl) => (
                                          <option key={lvl.rankValue} value={lvl.rankValue}>
                                            {lvl.levelName} (Rank: {lvl.rankValue})
                                          </option>
                                        ))}
                                      </select>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <Button
                                        onClick={() => handleUpdateSportLevel(sport.sportId)}
                                        variant="primary"
                                        className="flex-1 py-1.5 text-[10px]"
                                      >
                                        <Save className="w-3.5 h-3.5" />
                                        Lưu
                                      </Button>
                                      <Button
                                        onClick={() => setEditingSportId(null)}
                                        variant="secondary"
                                        className="py-1.5 px-3 text-[10px]"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <div>
                                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider font-label block">Trình độ hiện tại</span>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm mt-1 leading-none font-display">
                                      <Award className="w-3.5 h-3.5 text-white/90" />
                                      {sport.levelName}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {sportsNotDeclared.length === 0 && userSportProfiles.length > 0 && (
                    <div className="mt-6 p-4 bg-emerald-50/50 dark:bg-white/5 border border-emerald-150/40 dark:border-white/10 rounded-2xl text-[11px] text-emerald-800 dark:text-primary/95 font-label flex items-start gap-2.5 leading-relaxed">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Bạn đã khai báo đầy đủ trình độ cho toàn bộ các môn thể thao hoạt động trong hệ thống SmashHub!</span>
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

        </div>
      </div>

      {/* MODAL: KHAI BÁO TRÌNH ĐỘ MỚI */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white dark:bg-card-dark w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-gray-150 dark:border-border-dark/60 transform transition-all duration-300 animate-scaleIn">

            <div className="relative p-6 border-b border-gray-100 dark:border-border-dark/40 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white font-display">Khai báo trình độ mới</h3>
                <p className="text-[10px] text-gray-400 font-label mt-0.5">Thêm một môn chơi cùng cấp độ vào hồ sơ của bạn</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSportProfile} className="p-6 space-y-4">
              {sportError && (
                <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-150 dark:border-red-500/20 rounded-xl text-xs text-red-600 dark:text-red-400 font-label flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{sportError}</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 font-label mb-1.5">
                  1. Chọn môn thể thao
                </label>
                {isLoadingAvailableSports ? (
                  <div className="py-2 text-xs text-gray-400 font-label flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-500" />
                    Đang tải danh sách môn...
                  </div>
                ) : sportsNotDeclared.length === 0 ? (
                  <div className="py-2.5 text-xs text-amber-600 dark:text-amber-400 font-label flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    Bạn đã khai báo toàn bộ các môn thể thao.
                  </div>
                ) : (
                  <select
                    value={selectedAddSportId}
                    onChange={(e) => handleSportSelectionChange(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-border-dark bg-white dark:bg-card-dark text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 font-label text-sm transition-colors"
                  >
                    <option value="">-- Click để chọn môn thể thao --</option>
                    {sportsNotDeclared.map((sport) => (
                      <option key={sport.sportId} value={sport.sportId}>
                        {sport.sportName}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {selectedAddSportId && (
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 font-label mb-1.5 animate-fadeIn">
                    2. Chọn trình độ của bạn
                  </label>
                  <select
                    value={selectedAddRankValue}
                    onChange={(e) => setSelectedAddRankValue(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-border-dark bg-white dark:bg-card-dark text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 font-label text-sm transition-colors animate-fadeIn"
                  >
                    <option value="">-- Chọn trình độ cấp độ --</option>
                    {selectedAddLevels.map((level) => (
                      <option key={level.rankValue} value={level.rankValue}>
                        {level.levelName} (Mức Rank: {level.rankValue})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-border-dark/40">
                <Button
                  type="submit"
                  isLoading={isCreatingSport}
                  disabled={!selectedAddSportId || !selectedAddRankValue}
                  variant="primary"
                  className="flex-1 py-2.5 text-xs shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  Xác nhận thêm
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  variant="secondary"
                  className="py-2.5 text-xs"
                >
                  Hủy
                </Button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
