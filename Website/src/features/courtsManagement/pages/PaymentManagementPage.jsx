import React, { useState, useEffect, useCallback } from 'react';
import {
  Building2, CreditCard, Plus, Edit3, Trash2, Loader2,
  AlertCircle, CheckCircle2, Wallet, User, Landmark, ShieldCheck, X, MapPin,
  ChevronDown
} from 'lucide-react';
import Sidebar from '../../../components/layout/Sidebar';
import SportyWatermarks from '../../../components/ui/SportyWatermarks';
import Button from '../../../components/ui/Button';
import { useTheme } from '../../../contexts/ThemeContext';
import {
  getMyFacilitiesAPI,
  getBankAccountsAPI,
  createBankAccountAPI,
  updateBankAccountAPI,
  deleteBankAccountAPI,
  getFacilityPaymentConfigAPI,
  updateFacilityPaymentConfigAPI
} from '../api/courtsManagement.api';
import toast from 'react-hot-toast';
import DeleteBankAccountModal from '../components/DeleteBankAccountModal';

const CARD_THEMES = [
  // Theme 1: Teal / Emerald
  {
    bg: 'from-teal-600 to-emerald-800 dark:from-teal-800 dark:to-emerald-950',
    border: 'border-teal-500/20 dark:border-teal-500/10',
    text: 'text-white',
    label: 'text-teal-100/80',
    badge: 'bg-white/20 text-white border-white/30',
    badgeSecondary: 'bg-white/5 text-white/70',
    actionEdit: 'hover:text-teal-200'
  },
  // Theme 2: Blue / Indigo
  {
    bg: 'from-blue-600 to-indigo-800 dark:from-blue-800 dark:to-indigo-950',
    border: 'border-blue-500/20 dark:border-blue-500/10',
    text: 'text-white',
    label: 'text-blue-100/80',
    badge: 'bg-white/20 text-white border-white/30',
    badgeSecondary: 'bg-white/5 text-white/70',
    actionEdit: 'hover:text-blue-200'
  },
  // Theme 3: Purple / Violet
  {
    bg: 'from-purple-600 to-violet-800 dark:from-purple-800 dark:to-violet-950',
    border: 'border-purple-500/20 dark:border-purple-500/10',
    text: 'text-white',
    label: 'text-purple-100/80',
    badge: 'bg-white/20 text-white border-white/30',
    badgeSecondary: 'bg-white/5 text-white/70',
    actionEdit: 'hover:text-purple-200'
  },
  // Theme 4: Amber / Rose (warm orange-red)
  {
    bg: 'from-amber-600 to-rose-800 dark:from-amber-800 dark:to-rose-950',
    border: 'border-amber-500/20 dark:border-amber-500/10',
    text: 'text-white',
    label: 'text-amber-100/80',
    badge: 'bg-white/20 text-white border-white/30',
    badgeSecondary: 'bg-white/5 text-white/70',
    actionEdit: 'hover:text-amber-200'
  },
  // Theme 5: Fuchsia / Violet (pinkish-purple)
  {
    bg: 'from-fuchsia-600 to-violet-800 dark:from-fuchsia-800 dark:to-violet-950',
    border: 'border-fuchsia-500/20 dark:border-fuchsia-500/10',
    text: 'text-white',
    label: 'text-fuchsia-100/80',
    badge: 'bg-white/20 text-white border-white/30',
    badgeSecondary: 'bg-white/5 text-white/70',
    actionEdit: 'hover:text-fuchsia-200'
  },
  // Theme 6: Rose / Pink (elegant dark pink)
  {
    bg: 'from-rose-600 to-pink-800 dark:from-rose-800 dark:to-pink-950',
    border: 'border-rose-500/20 dark:border-rose-500/10',
    text: 'text-white',
    label: 'text-rose-100/80',
    badge: 'bg-white/20 text-white border-white/30',
    badgeSecondary: 'bg-white/5 text-white/70',
    actionEdit: 'hover:text-rose-200'
  }
];

const POPULAR_BANKS = [
  'MB Bank (Ngân hàng Quân đội)',
  'Vietcombank (Ngoại thương Việt Nam)',
  'Techcombank (Kỹ thương Việt Nam)',
  'BIDV (Đầu tư và Phát triển Việt Nam)',
  'VietinBank (Công thương Việt Nam)',
  'Agribank (Nông nghiệp & PTNT)',
  'VPBank (Việt Nam Thịnh Vượng)',
  'ACB (Á Châu)',
  'TPBank (Tiên Phong)',
  'VIB (Quốc tế Việt Nam)',
  'Sacombank (Sài Gòn Thương Tín)',
  'MoMo (Ví điện tử)',
  'PayOS (Cổng thanh toán)'
];

export default function PaymentManagementPage() {
  const { theme } = useTheme();
  const [facilities, setFacilities] = useState([]);
  const [selectedFacilityId, setSelectedFacilityId] = useState(null);
  const [bankAccounts, setBankAccounts] = useState([]);

  // Loading states
  const [isLoadingFacilities, setIsLoadingFacilities] = useState(true);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingConfig, setIsLoadingConfig] = useState(false);

  // Payment Config State
  const [paymentModel, setPaymentModel] = useState(1); // 1: Escrow, 3: BYOG
  const [payosConfig, setPayosConfig] = useState({ clientId: '', apiKey: '', checksumKey: '' });
  const [isEditingConfig, setIsEditingConfig] = useState(false);

  // Form modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);

  // Form values
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [showBankDropdown, setShowBankDropdown] = useState(false);
  const [isFacilityDropdownOpen, setIsFacilityDropdownOpen] = useState(false);

  // Load owner facilities
  const fetchFacilities = useCallback(async () => {
    setIsLoadingFacilities(true);
    try {
      const res = await getMyFacilitiesAPI();
      const list = res?.data ?? res ?? [];
      setFacilities(list);
      if (list.length > 0) {
        setSelectedFacilityId(list[0].facilityId);
      }
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi tải danh sách cơ sở.');
    } finally {
      setIsLoadingFacilities(false);
    }
  }, []);

  // Load bank accounts for selected facility
  const fetchBankAccounts = useCallback(async (facilityId) => {
    if (!facilityId) return;
    setIsLoadingAccounts(true);
    try {
      const res = await getBankAccountsAPI(facilityId);
      setBankAccounts(res?.data ?? res ?? []);
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi tải danh sách tài khoản ngân hàng.');
    } finally {
      setIsLoadingAccounts(false);
    }
  }, []);

  useEffect(() => {
    fetchFacilities();
  }, [fetchFacilities]);

  const fetchPaymentConfig = useCallback(async (facilityId) => {
    if (!facilityId) return;
    setIsLoadingConfig(true);
    try {
      const res = await getFacilityPaymentConfigAPI(facilityId);
      const data = res?.data ?? res;
      setPaymentModel(data.paymentModel || 1);
      setPayosConfig({
        clientId: data.clientId || '',
        apiKey: data.apiKey || '',
        checksumKey: data.checksumKey || ''
      });
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi tải cấu hình thanh toán.');
    } finally {
      setIsLoadingConfig(false);
    }
  }, []);

  useEffect(() => {
    if (selectedFacilityId) {
      fetchBankAccounts(selectedFacilityId);
      fetchPaymentConfig(selectedFacilityId);
    } else {
      setBankAccounts([]);
      setPaymentModel(1);
    }
  }, [selectedFacilityId, fetchBankAccounts, fetchPaymentConfig]);

  useEffect(() => {
    if (!isFacilityDropdownOpen) return;
    const handleOutsideClick = (e) => {
      const selector = document.getElementById('facility-selector-container');
      if (selector && !selector.contains(e.target)) {
        setIsFacilityDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [isFacilityDropdownOpen]);

  const handleOpenAddModal = () => {
    setBankName('');
    setAccountNumber('');
    setAccountHolder('');
    setShowBankDropdown(false);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (account) => {
    setEditingAccount(account);
    setBankName(account.bankName);
    setAccountNumber(account.accountNumber);
    setAccountHolder(account.accountHolder);
    setShowBankDropdown(false);
    setIsEditModalOpen(true);
  };

  const handleAccountHolderChange = (e) => {
    // Standardize holder name to uppercase and remove diacritics
    let val = e.target.value.toUpperCase();
    val = val.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // strip Vietnamese accents
    val = val.replace(/Đ/g, 'D');
    setAccountHolder(val);
  };

  const handleAddAccount = async (e) => {
    e.preventDefault();
    if (!bankName || !accountNumber || !accountHolder) {
      toast.error('Vui lòng nhập đầy đủ thông tin.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createBankAccountAPI(selectedFacilityId, {
        bankName,
        accountNumber,
        accountHolder
      });

      toast.success(res.message || 'Thêm tài khoản thành công.');
      setIsAddModalOpen(false);
      fetchBankAccounts(selectedFacilityId);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Lỗi khi thêm tài khoản.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateAccount = async (e) => {
    e.preventDefault();
    if (!bankName || !accountNumber || !accountHolder) {
      toast.error('Vui lòng nhập đầy đủ thông tin.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await updateBankAccountAPI(
        selectedFacilityId,
        editingAccount.bankAccountId,
        {
          bankName,
          accountNumber,
          accountHolder
        }
      );

      toast.success(res.message || 'Cập nhật tài khoản thành công.');
      setIsEditModalOpen(false);
      fetchBankAccounts(selectedFacilityId);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Lỗi khi cập nhật tài khoản.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDeleteModal = (account) => {
    setAccountToDelete(account);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!accountToDelete) return;
    setIsSubmitting(true);
    try {
      const res = await deleteBankAccountAPI(selectedFacilityId, accountToDelete.bankAccountId);
      toast.success(res.message || 'Đã xóa tài khoản ngân hàng.');
      setIsDeleteModalOpen(false);
      setAccountToDelete(null);
      fetchBankAccounts(selectedFacilityId);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Lỗi khi xóa tài khoản.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSavePayOSConfig = async (e) => {
    e.preventDefault();
    if (!payosConfig.clientId || !payosConfig.apiKey || !payosConfig.checksumKey) {
      toast.error('Vui lòng nhập đầy đủ 3 Key của PayOS.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await updateFacilityPaymentConfigAPI(selectedFacilityId, {
        paymentModel: 3,
        clientId: payosConfig.clientId,
        apiKey: payosConfig.apiKey,
        checksumKey: payosConfig.checksumKey
      });
      toast.success('Lưu cấu hình PayOS thành công.');
      setIsEditingConfig(false);
      fetchPaymentConfig(selectedFacilityId);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Lỗi khi lưu cấu hình.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSwitchModel = async (model) => {
    if (model === paymentModel) return;
    setIsSubmitting(true);
    try {
      await updateFacilityPaymentConfigAPI(selectedFacilityId, {
        paymentModel: model,
        clientId: payosConfig.clientId,
        apiKey: payosConfig.apiKey,
        checksumKey: payosConfig.checksumKey
      });
      setPaymentModel(model);
      toast.success(`Đã chuyển sang mô hình ${model === 1 ? 'Thu Hộ' : 'Trực Tiếp'}.`);
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi chuyển mô hình.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedFacility = facilities.find(f => f.facilityId === selectedFacilityId);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#0b0f19] text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300 overflow-hidden">
      {/* Navigation Sidebar */}
      <Sidebar activeMenu="payment-management" />

      {/* Main Panel Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Scrollable container */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-gray-50 dark:bg-[#0e1322] relative">
          <SportyWatermarks />

          <div className="max-w-6xl mx-auto space-y-6 relative z-10">
            {/* Title Block */}
            <div className="space-y-1">
              <h1 className="text-2xl md:text-3xl font-extrabold font-display leading-tight dark:text-white">
                Quản lý nhận tiền
              </h1>
              <p className="text-xs text-gray-550 dark:text-gray-400">
                Đăng ký thông tin tài khoản ngân hàng để làm nơi nhận các khoản tiền thanh toán và rút số dư ví của cơ sở.
              </p>
            </div>

            {/* Facility Selector Card (Matches image 1) */}
            {!isLoadingFacilities && facilities.length > 0 && (
              <div 
                id="facility-selector-container"
                className="relative"
              >
                <button
                  type="button"
                  onClick={() => setIsFacilityDropdownOpen(!isFacilityDropdownOpen)}
                  className="w-full text-left bg-white dark:bg-[#0b0f19]/60 p-4 md:p-6 rounded-3xl border border-gray-150/80 dark:border-white/5 shadow-sm flex justify-between items-center gap-4 hover:border-emerald-500/50 dark:hover:border-emerald-500/30 transition-all duration-200 cursor-pointer focus:outline-none animate-fadeIn"
                >
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-extrabold text-gray-400 dark:text-gray-550 uppercase tracking-widest font-label block mb-1">
                      CHỌN CƠ SỞ QUẢN LÝ
                    </span>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-emerald-500 shrink-0" />
                      <span className="text-base font-extrabold text-gray-900 dark:text-white truncate">
                        {selectedFacility?.name} {selectedFacility?.statusId === 1 ? ' (Chờ duyệt)' : ''}
                      </span>
                    </div>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 shrink-0 ${isFacilityDropdownOpen ? 'transform rotate-180 text-emerald-500' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isFacilityDropdownOpen && (
                  <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-[#0f172a] border border-gray-150/80 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden z-[100] animate-fadeIn">
                    <div className="max-h-60 overflow-y-auto scrollbar-thin">
                      {facilities.map((fac) => (
                        <button
                          key={fac.facilityId}
                          type="button"
                          onClick={() => {
                            setSelectedFacilityId(fac.facilityId);
                            setIsFacilityDropdownOpen(false);
                          }}
                          className={`w-full text-left px-5 py-3.5 text-sm font-extrabold flex items-center justify-between transition-colors cursor-pointer
                            ${fac.facilityId === selectedFacilityId
                              ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
                            }`}
                        >
                          <span className="flex items-center gap-2">
                            <Building2 className={`w-4 h-4 ${fac.facilityId === selectedFacilityId ? 'text-emerald-500' : 'text-gray-400'}`} />
                            <span>
                              {fac.name} {fac.statusId === 1 ? ' (Chờ duyệt)' : ''}
                            </span>
                          </span>
                          {fac.facilityId === selectedFacilityId && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Facility Address (Matches image 1) */}
            {!isLoadingFacilities && selectedFacility && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 pl-1">
                <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Địa chỉ: {selectedFacility.address}, {selectedFacility.district}, {selectedFacility.city}</span>
              </div>
            )}

            {/* Main Content Area */}
            {isLoadingFacilities ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                <p className="text-xs text-gray-455">Đang tải danh sách cơ sở...</p>
              </div>
            ) : facilities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-500 bg-white dark:bg-[#0b0f19]/40 rounded-3xl border border-dashed border-gray-200 dark:border-white/10 p-8 text-center max-w-xl mx-auto shadow-sm">
                <Building2 className="w-12 h-12 mb-3 text-emerald-500/20 dark:text-primary/20" />
                <h3 className="font-bold text-gray-700 dark:text-gray-300">Chưa Đăng Ký Cơ Sở Nào</h3>
                <p className="text-xs text-gray-455 mt-1 max-w-xs leading-normal">
                  Bạn cần có ít nhất một cơ sở thể thao hoạt động trên hệ thống để bắt đầu cấu hình tài khoản nhận tiền.
                </p>
              </div>
            ) : (
              <div className="space-y-6">

                {/* Tabs to switch Payment Model */}
                <div className="flex p-1 bg-gray-200/50 dark:bg-white/5 rounded-2xl w-fit">
                  <button
                    onClick={() => handleSwitchModel(1)}
                    className={`px-6 py-2.5 rounded-xl text-sm font-extrabold transition-all duration-300 ${
                      paymentModel === 1 
                        ? 'bg-white dark:bg-[#1e293b] text-emerald-600 dark:text-emerald-400 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                    }`}
                  >
                    Thu hộ qua Nền tảng
                  </button>
                  <button
                    onClick={() => handleSwitchModel(3)}
                    className={`px-6 py-2.5 rounded-xl text-sm font-extrabold transition-all duration-300 ${
                      paymentModel === 3
                        ? 'bg-white dark:bg-[#1e293b] text-emerald-600 dark:text-emerald-400 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                    }`}
                  >
                    PayOS Cá Nhân (BYOG)
                  </button>
                </div>

                {paymentModel === 1 ? (
                  <>
                    {/* Add Button & Grid */}
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-extrabold text-gray-400 uppercase tracking-wider font-label">
                        Danh sách tài khoản ngân hàng ({bankAccounts.length})
                      </h3>
                      <Button
                        onClick={handleOpenAddModal}
                        variant="primary"
                        className="!py-2 !px-4 text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95"
                      >
                        <Plus className="w-4 h-4" />
                        Thêm tài khoản
                      </Button>
                    </div>

                    {isLoadingAccounts ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2].map((n) => (
                          <div key={n} className="h-48 rounded-3xl bg-white dark:bg-[#0b0f19]/40 border border-gray-150 dark:border-white/5 animate-pulse" />
                        ))}
                      </div>
                    ) : bankAccounts.length === 0 ? (
                      <div className="text-center py-16 bg-white dark:bg-[#0b0f19]/35 rounded-3xl border border-dashed border-gray-200 dark:border-white/10">
                        <CreditCard className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-700" />
                        <p className="font-bold text-gray-700 dark:text-gray-300">Chưa có tài khoản ngân hàng nào</p>
                        <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">Vui lòng bấm nút phía trên để liên kết tài khoản ngân hàng đầu tiên nhận tiền cho cơ sở này.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {bankAccounts.map((account, index) => {
                          const theme = CARD_THEMES[index % CARD_THEMES.length];
                          return (
                            <div
                              key={account.bankAccountId}
                              className={`relative overflow-hidden p-6 rounded-3xl bg-gradient-to-br ${theme.bg} ${theme.text} border ${theme.border} shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between h-48`}
                            >
                              {/* Decorative card stripes */}
                              <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-8 translate-y-8">
                                <Landmark className="w-48 h-48" />
                              </div>

                              {/* Top Row: Bank Info and Primary status */}
                              <div className="flex justify-between items-start gap-4">
                                <div className="flex items-center gap-2">
                                  <Landmark className="w-5 h-5 text-white/90" />
                                  <h4 className="font-black text-base tracking-wide truncate max-w-[180px] text-white drop-shadow-sm">{account.bankName}</h4>
                                </div>

                                {account.isPrimary ? (
                                  <span className={`px-2.5 py-1 text-[10px] font-black rounded-full ${theme.badge} uppercase tracking-widest font-label shadow-sm`}>
                                    Mặc định
                                  </span>
                                ) : (
                                  <span className={`px-2.5 py-1 text-[10px] font-black rounded-full ${theme.badgeSecondary} uppercase tracking-widest font-label`}>
                                    Phụ
                                  </span>
                                )}
                              </div>

                              {/* Mid Row: Account Number */}
                              <div className="my-2">
                                <div className={`text-xs font-bold ${theme.label} uppercase tracking-wider font-label`}>Số tài khoản</div>
                                <div className="text-xl md:text-2xl font-mono font-extrabold tracking-widest mt-1 text-white drop-shadow-sm">
                                  {account.accountNumber}
                                </div>
                              </div>

                              {/* Bottom Row: Account Holder and Actions */}
                              <div className="flex justify-between items-end border-t border-white/10 pt-3">
                                <div>
                                  <div className={`text-[11px] font-bold ${theme.label} uppercase tracking-wider font-label`}>Chủ tài khoản</div>
                                  <div className="text-sm font-extrabold tracking-wider uppercase mt-0.5 text-white drop-shadow-sm">{account.accountHolder}</div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 relative z-10">
                                  <button
                                    onClick={() => handleOpenEditModal(account)}
                                    className={`p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white ${theme.actionEdit} transition-colors cursor-pointer active:scale-90`}
                                    title="Chỉnh sửa"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleOpenDeleteModal(account)}
                                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white hover:text-red-300 transition-colors cursor-pointer active:scale-90"
                                    title="Xóa"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="bg-white dark:bg-[#0b0f19]/40 p-6 rounded-3xl border border-gray-150 dark:border-white/5 space-y-6 animate-fadeIn relative overflow-hidden">
                    <div className="absolute right-0 top-0 opacity-[0.03] pointer-events-none transform translate-x-1/4 -translate-y-1/4">
                      <ShieldCheck className="w-64 h-64" />
                    </div>
                    
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-black dark:text-white flex items-center gap-2">
                          <ShieldCheck className="w-5 h-5 text-emerald-500" />
                          Cấu hình PayOS Cá Nhân
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xl leading-relaxed">
                          Nhập thông tin API Key từ trang quản trị PayOS của bạn. Tiền thanh toán của khách sẽ chuyển thẳng vào tài khoản ngân hàng của bạn.
                        </p>
                      </div>
                      
                      {!isEditingConfig && (
                        <Button 
                          onClick={() => setIsEditingConfig(true)}
                          variant="secondary"
                          className="!py-2 !px-4 text-xs font-bold"
                        >
                          <Edit3 className="w-3.5 h-3.5 mr-1.5" /> Chỉnh sửa
                        </Button>
                      )}
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-200/50 dark:border-amber-500/20">
                      <div className="flex gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-bold text-amber-800 dark:text-amber-400 mb-1">Thiết lập Webhook PayOS</h4>
                          <p className="text-xs text-amber-700/80 dark:text-amber-500/80 leading-relaxed mb-2">
                            Bạn cần dán đường dẫn Webhook dưới đây vào mục Cài Đặt trên trang quản trị PayOS để hệ thống có thể tự động xác nhận đơn đặt sân khi khách chuyển khoản thành công.
                          </p>
                          <code className="block p-2 bg-white/50 dark:bg-black/20 rounded font-mono text-xs text-amber-900 dark:text-amber-300 select-all border border-amber-200 dark:border-amber-500/30">
                            https://api.smashclub.com/api/payments/webhook/booking
                          </code>
                        </div>
                      </div>
                    </div>

                    <form onSubmit={handleSavePayOSConfig} className="space-y-4 relative z-10">
                      <div className="grid grid-cols-1 gap-4 max-w-2xl">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-550 dark:text-gray-400 font-label mb-1.5">
                            Client ID
                          </label>
                          <input
                            type="text"
                            value={payosConfig.clientId}
                            onChange={e => setPayosConfig({...payosConfig, clientId: e.target.value})}
                            disabled={!isEditingConfig}
                            className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-emerald-500 dark:focus:border-primary disabled:opacity-60 disabled:cursor-not-allowed text-sm font-mono dark:text-white"
                            placeholder="Ví dụ: 12345678-abcd-1234..."
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-550 dark:text-gray-400 font-label mb-1.5">
                            API Key
                          </label>
                          <input
                            type="password"
                            value={payosConfig.apiKey}
                            onChange={e => setPayosConfig({...payosConfig, apiKey: e.target.value})}
                            disabled={!isEditingConfig}
                            className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-emerald-500 dark:focus:border-primary disabled:opacity-60 disabled:cursor-not-allowed text-sm font-mono dark:text-white"
                            placeholder="••••••••••••••••"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-550 dark:text-gray-400 font-label mb-1.5">
                            Checksum Key
                          </label>
                          <input
                            type="password"
                            value={payosConfig.checksumKey}
                            onChange={e => setPayosConfig({...payosConfig, checksumKey: e.target.value})}
                            disabled={!isEditingConfig}
                            className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-emerald-500 dark:focus:border-primary disabled:opacity-60 disabled:cursor-not-allowed text-sm font-mono dark:text-white"
                            placeholder="••••••••••••••••"
                          />
                        </div>
                      </div>

                      {isEditingConfig && (
                        <div className="flex gap-3 pt-2 max-w-2xl">
                          <Button 
                            type="button" 
                            variant="secondary" 
                            className="flex-1"
                            onClick={() => {
                              setIsEditingConfig(false);
                              fetchPaymentConfig(selectedFacilityId);
                            }}
                          >
                            Hủy bỏ
                          </Button>
                          <Button 
                            type="submit" 
                            variant="primary" 
                            className="flex-1"
                            isLoading={isSubmitting}
                          >
                            Lưu cấu hình
                          </Button>
                        </div>
                      )}
                    </form>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add Bank Account Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="absolute inset-0" onClick={() => setIsAddModalOpen(false)}></div>
          <form
            onSubmit={handleAddAccount}
            className="relative w-full max-w-md bg-white dark:bg-[#0f172a] rounded-3xl border border-gray-150 dark:border-white/10 overflow-hidden shadow-2xl p-6 z-10 space-y-4 animate-scaleUp"
          >
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-3">
              <h3 className="text-base font-extrabold font-display dark:text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-500" />
                Thêm Tài Khoản Nhận Tiền
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-405 hover:text-gray-600 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              {/* Bank Name Selector */}
              <div className="relative">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-550 dark:text-gray-400 font-label mb-1.5">
                  Tên Ngân Hàng
                </label>
                <input
                  type="text"
                  placeholder="Nhập tên ngân hàng (Ví dụ: MB Bank, Vietcombank...)"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  onFocus={() => setShowBankDropdown(true)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-emerald-500 dark:focus:border-primary dark:text-white font-bold text-sm"
                  required
                />

                {showBankDropdown && (
                  <div className="absolute left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-white/10 rounded-xl shadow-lg z-20 scrollbar-thin">
                    <div className="p-2 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider font-label border-b border-gray-100 dark:border-white/5 px-4 py-2 bg-gray-50 dark:bg-slate-800">
                      Gợi ý phổ biến
                    </div>
                    {POPULAR_BANKS.map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => {
                          setBankName(b);
                          setShowBankDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-800 dark:text-gray-200 hover:bg-emerald-500/15 hover:text-emerald-700 dark:hover:bg-primary/20 dark:hover:text-primary transition-colors cursor-pointer"
                      >
                        {b}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setShowBankDropdown(false)}
                      className="w-full text-center py-2.5 text-xs font-bold text-gray-500 dark:text-gray-455 bg-gray-50 dark:bg-white/5 border-t border-gray-150 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                    >
                      Đóng danh sách
                    </button>
                  </div>
                )}
              </div>

              {/* Account Number */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-550 dark:text-gray-400 font-label mb-1.5">
                  Số Tài Khoản
                </label>
                <input
                  type="text"
                  placeholder="Nhập số tài khoản ngân hàng"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-emerald-500 dark:focus:border-primary dark:text-white font-mono font-bold text-sm"
                  required
                />
              </div>

              {/* Account Holder */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-550 dark:text-gray-400 font-label mb-1.5">
                  Tên Chủ Tài Khoản
                </label>
                <input
                  type="text"
                  placeholder="VIET HOA KHONG DAU (Ví dụ: NGUYEN VAN A)"
                  value={accountHolder}
                  onChange={handleAccountHolderChange}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-emerald-500 dark:focus:border-primary dark:text-white font-bold tracking-wider text-sm"
                  required
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 border-t border-gray-100 dark:border-white/5 pt-4 mt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsAddModalOpen(false)}
                className="flex-1 !py-2.5 rounded-xl text-xs font-bold"
              >
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                className="flex-1 !py-2.5 rounded-xl text-xs font-bold text-[#052e14]"
              >
                {!isSubmitting && <CheckCircle2 className="w-3.5 h-3.5 mr-1" />}
                Thêm tài khoản
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Bank Account Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="absolute inset-0" onClick={() => setIsEditModalOpen(false)}></div>
          <form
            onSubmit={handleUpdateAccount}
            className="relative w-full max-w-md bg-white dark:bg-[#0f172a] rounded-3xl border border-gray-150 dark:border-white/10 overflow-hidden shadow-2xl p-6 z-10 space-y-4 animate-scaleUp"
          >
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-3">
              <h3 className="text-base font-extrabold font-display dark:text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-emerald-500" />
                Chỉnh Sửa Tài Khoản
              </h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-450 hover:text-gray-600 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4 text-sm">
              {/* Bank Name Selector */}
              <div className="relative">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-550 dark:text-gray-400 font-label mb-1.5">
                  Tên Ngân Hàng
                </label>
                <input
                  type="text"
                  placeholder="Nhập tên ngân hàng"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  onFocus={() => setShowBankDropdown(true)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-emerald-500 dark:focus:border-primary dark:text-white font-bold text-sm"
                  required
                />

                {showBankDropdown && (
                  <div className="absolute left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-white/10 rounded-xl shadow-lg z-20 scrollbar-thin">
                    <div className="p-2 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider font-label border-b border-gray-100 dark:border-white/5 px-4 py-2 bg-gray-50 dark:bg-slate-800">
                      Gợi ý phổ biến
                    </div>
                    {POPULAR_BANKS.map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => {
                          setBankName(b);
                          setShowBankDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-800 dark:text-gray-200 hover:bg-emerald-500/15 hover:text-emerald-700 dark:hover:bg-primary/20 dark:hover:text-primary transition-colors cursor-pointer"
                      >
                        {b}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setShowBankDropdown(false)}
                      className="w-full text-center py-2.5 text-xs font-bold text-gray-500 dark:text-gray-450 bg-gray-50 dark:bg-white/5 border-t border-gray-150 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                    >
                      Đóng danh sách
                    </button>
                  </div>
                )}
              </div>

              {/* Account Number */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-550 dark:text-gray-400 font-label mb-1.5">
                  Số Tài Khoản
                </label>
                <input
                  type="text"
                  placeholder="Nhập số tài khoản"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-emerald-500 dark:focus:border-primary dark:text-white font-mono font-bold text-sm"
                  required
                />
              </div>

              {/* Account Holder */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-550 dark:text-gray-400 font-label mb-1.5">
                  Tên Chủ Tài Khoản
                </label>
                <input
                  type="text"
                  placeholder="VIET HOA KHONG DAU"
                  value={accountHolder}
                  onChange={handleAccountHolderChange}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-emerald-500 dark:focus:border-primary dark:text-white font-bold tracking-wider text-sm"
                  required
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 border-t border-gray-100 dark:border-white/5 pt-4 mt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 !py-2.5 rounded-xl text-xs font-bold"
              >
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                className="flex-1 !py-2.5 rounded-xl text-xs font-bold text-[#052e14]"
              >
                {!isSubmitting && <CheckCircle2 className="w-3.5 h-3.5 mr-1" />}
                Lưu thay đổi
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Bank Account Confirmation Modal */}
      <DeleteBankAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        account={accountToDelete}
        onConfirm={handleConfirmDelete}
        isConfirming={isSubmitting}
      />
    </div>
  );
}
