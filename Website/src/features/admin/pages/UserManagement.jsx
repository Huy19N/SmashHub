import { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  UserCheck,
  UserX,
  AlertCircle
} from 'lucide-react';
import { useAdminUsers } from '../hooks/useAdmin';
import MediaImage from '../../../components/ui/MediaImage';
import { getAllUserByIdAPI } from '../../profiles/api/profiles.api.js';
import toast from 'react-hot-toast';
export default function UserManagement() {
  const { users, isLoading, fetchUsers, changeRole, toggleStatus, banUser, unbanUser } = useAdminUsers();
  const [searchQuery, setSearchQuery] = useState('');
  const [avatars, setAvatars] = useState({});
  const [roleFilter, setRoleFilter] = useState('all');
  const roles = [
    { id: 1, name: 'Admin' },
    { id: 2, name: 'User' },
    { id: 3, name: 'FacilityOwner' }
  ];

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (users.length > 0) {
      users.forEach(async (u) => {
        if (!u.avatarFileId && avatars[u.userId] === undefined) {
          try {
            const res = await getAllUserByIdAPI(u.userId);
            setAvatars(prev => ({ ...prev, [u.userId]: res.data?.avatarFileId || null }));
          } catch (e) {
            setAvatars(prev => ({ ...prev, [u.userId]: null }));
          }
        }
      });
    }
  }, [users]);

  // Handle role change
  const handleRoleChange = async (userId, newRoleId) => {
    await changeRole(userId, newRoleId, roles);
  };

  // Handle status toggle
  const handleToggleStatus = async (userId) => {
    await toggleStatus(userId);
  };

  const handleBanUser = async (userId) => {
    const days = window.prompt("Nhập số ngày cấm (ví dụ: 7):");
    if (!days || isNaN(days)) return;
    const reason = window.prompt("Nhập lý do cấm:");
    if (!reason) return;

    const untilDate = new Date();
    untilDate.setDate(untilDate.getDate() + parseInt(days));

    await banUser(userId, untilDate.toISOString(), reason);
  };

  const handleUnbanUser = async (userId) => {
    if (!window.confirm("Bạn có chắc muốn bỏ cấm người dùng này?")) return;
    await unbanUser(userId);
  };
  // Search & filter filtering logic
  const filteredUsers = users.filter(user => {
    const matchesSearch = (user.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.phoneNumber || '').includes(searchQuery);
    const matchesRole = roleFilter === 'all' || user.roleId.toString() === roleFilter;
    return matchesSearch && matchesRole;
  });
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold font-display leading-tight dark:text-white">Quản Lý Người Dùng</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Xem danh sách, phân quyền và khóa/mở khóa tài khoản thành viên.</p>
      </div>
      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center glass-panel p-4 sm:p-6 rounded-3xl shadow-lg border border-white/20 w-full mb-6">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo tên, email, sđt..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-emerald-500 dark:focus:border-primary transition-colors dark:text-white"
          />
        </div>
        {/* Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-emerald-500 dark:focus:border-primary transition-colors dark:text-white cursor-pointer"
          >
            <option value="all" className="dark:bg-[#0b0f19] dark:text-white">Tất cả quyền</option>
            <option value="1" className="dark:bg-[#0b0f19] dark:text-white">Admin</option>
            <option value="2" className="dark:bg-[#0b0f19] dark:text-white">User (Người chơi)</option>
            <option value="3" className="dark:bg-[#0b0f19] dark:text-white">FacilityOwner (Chủ sân)</option>
          </select>
        </div>
      </div>
      {/* Users Table */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl shadow-xl border border-white/20">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <AlertCircle className="w-12 h-12 mb-3 text-amber-500/80 animate-bounce" />
            <p>Không tìm thấy người dùng nào phù hợp.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-y-3 text-left">
              <thead>
                <tr className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider font-label px-4">
                  <th className="py-3 px-4 whitespace-nowrap">Ảnh đại diện</th>
                  <th className="py-3 px-4 whitespace-nowrap">Thông tin cá nhân</th>
                  <th className="py-3 px-4 whitespace-nowrap">Số điện thoại</th>
                  <th className="py-3 px-4 whitespace-nowrap">Vai trò (Role)</th>
                  <th className="py-3 px-4 whitespace-nowrap">Ngày tham gia</th>
                  <th className="py-3 px-4 text-center whitespace-nowrap">Trạng thái</th>
                  <th className="py-3 px-4 text-center whitespace-nowrap">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-sm">
                {filteredUsers.map((u) => (
                  <tr key={u.userId} className="bg-white/60 dark:bg-gray-800/40 hover:bg-white dark:hover:bg-gray-700/60 transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-1 rounded-2xl group">
                    <td className="py-3 px-4 rounded-l-2xl whitespace-nowrap">
                      {u.avatarFileId || avatars[u.userId] ? (
                        <MediaImage
                          fileId={u.avatarFileId || avatars[u.userId]}
                          alt={u.fullName}
                          className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-white/10"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div
                        style={{ display: u.avatarFileId || avatars[u.userId] ? 'none' : 'flex' }}
                        className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 items-center justify-center text-white font-bold text-xs select-none"
                      >
                        {getInitials(u.fullName)}
                      </div>
                    </td>
                    <td className="py-4 px-5 whitespace-nowrap">
                      <p className="font-extrabold text-gray-900 dark:text-white group-hover:text-emerald-600 transition-colors">{u.fullName}</p>
                      <p className="text-xs text-gray-500 font-medium">{u.email}</p>
                    </td>
                    <td className="py-3.5 px-4 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      {u.phoneNumber || <span className="text-gray-400 italic">Chưa cập nhật</span>}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <select
                        value={u.roleId}
                        onChange={(e) => handleRoleChange(u.userId, parseInt(e.target.value))}
                        className="px-2.5 py-1 text-xs bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:border-emerald-500 dark:focus:border-primary transition-colors cursor-pointer dark:text-white"
                      >
                        {roles.map(r => (
                          <option key={r.id} value={r.id} className="dark:bg-[#0b0f19] dark:text-white">
                            {r.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {u.banUntil && new Date(u.banUntil) > new Date() ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-label uppercase bg-red-500/10 text-red-600 border border-red-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                          Đang bị cấm
                        </span>
                      ) : (
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-label uppercase ${u.isActive
                          ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                          : 'bg-gray-500/10 text-gray-600 border border-gray-500/20'
                          }`}>
                          {u.isActive ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                              Hoạt động
                            </>
                          ) : (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
                              Tạm ngưng
                            </>
                          )}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="flex justify-center gap-2">
                        {u.banUntil && new Date(u.banUntil) > new Date() ? (
                          <button
                            onClick={() => handleUnbanUser(u.userId)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold font-label cursor-pointer active:scale-95 transition-all border bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/25 border-emerald-500/20"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            Bỏ cấm
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBanUser(u.userId)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold font-label cursor-pointer active:scale-95 transition-all border bg-red-500/10 text-red-600 hover:bg-red-500/25 border-red-500/20"
                          >
                            <UserX className="w-3.5 h-3.5" />
                            Cấm
                          </button>
                        )}
                        <button
                          onClick={() => handleToggleStatus(u.userId)}
                          className="p-1.5 rounded-lg text-xs font-bold font-label cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
                          title="Đổi trạng thái active"
                        >
                          <AlertCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}