import React from 'react';
import { Trash2, X } from 'lucide-react';
import Button from '../../../components/ui/Button';

export default function DeleteBankAccountModal({
  isOpen,
  onClose,
  account,
  onConfirm,
  isConfirming
}) {
  if (!isOpen || !account) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="absolute inset-0" onClick={onClose}></div>
      <div
        className="relative w-full max-w-md bg-white dark:bg-[#0f172a] rounded-3xl border border-gray-150 dark:border-white/10 overflow-hidden shadow-2xl p-6 z-10 space-y-4 animate-scaleUp text-sm"
      >
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-3">
          <h3 className="text-base font-extrabold font-display dark:text-white flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-red-500" />
            Xác Nhận Xóa Tài Khoản
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 text-gray-600 dark:text-gray-300">
          <p className="leading-relaxed">
            Bạn có chắc chắn muốn <span className="font-black text-red-500">XÓA</span> tài khoản ngân hàng này không? Hành động này không thể hoàn tác.
          </p>
          <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">Ngân hàng</span>
              <span className="font-extrabold text-gray-800 dark:text-white">{account.bankName}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">Số tài khoản</span>
              <span className="font-mono font-extrabold text-gray-800 dark:text-white">{account.accountNumber}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">Chủ tài khoản</span>
              <span className="font-extrabold text-gray-800 dark:text-white uppercase tracking-wider">{account.accountHolder}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 border-t border-gray-100 dark:border-white/5 pt-4 mt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1 !py-2.5 rounded-xl text-xs font-bold"
          >
            Hủy bỏ
          </Button>
          <Button
            type="button"
            variant="danger"
            isLoading={isConfirming}
            onClick={onConfirm}
            className="flex-1 !py-2.5 rounded-xl text-xs font-bold"
          >
            {!isConfirming && <Trash2 className="w-3.5 h-3.5 mr-1" />}
            Xác nhận xóa
          </Button>
        </div>
      </div>
    </div>
  );
}
