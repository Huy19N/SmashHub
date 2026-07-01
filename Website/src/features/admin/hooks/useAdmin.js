import { useState, useCallback } from 'react';
import * as adminApi from '../api/admin.api';
import toast from 'react-hot-toast';

export const useAdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await adminApi.getAdminStatisticsAPI();
      if (response.success) {
        setStats(response.data);
      } else {
        toast.error(response.message || 'Lỗi khi tải số liệu thống kê.');
      }
    } catch (error) {
      console.error(error);
      toast.error('Không thể kết nối đến server.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { stats, isLoading, fetchStats };
};

export const useAdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await adminApi.getAdminUsersAPI();
      if (response.success) {
        setUsers(response.data);
      } else {
        toast.error(response.message || 'Lỗi khi tải danh sách người dùng.');
      }
    } catch (error) {
      console.error(error);
      toast.error('Không thể kết nối đến server.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const changeRole = async (userId, newRoleId, roles) => {
    try {
      const response = await adminApi.changeUserRoleAPI(userId, newRoleId);
      if (response.success) {
        toast.success(response.message || 'Cập nhật quyền thành công.');
        setUsers(prev => prev.map(u => 
          u.userId === userId ? { ...u, roleId: newRoleId, roleName: roles.find(r => r.id === newRoleId)?.name } : u
        ));
        return true;
      } else {
        toast.error(response.message || 'Lỗi khi cập nhật quyền.');
        return false;
      }
    } catch (error) {
      console.error(error);
      toast.error('Lỗi khi thực hiện cập nhật quyền.');
      return false;
    }
  };

  const toggleStatus = async (userId) => {
    try {
      const response = await adminApi.toggleUserStatusAPI(userId);
      if (response.success) {
        toast.success(response.message || 'Cập nhật trạng thái thành công.');
        setUsers(prev => prev.map(u => 
          u.userId === userId ? { ...u, isActive: !u.isActive } : u
        ));
        return true;
      } else {
        toast.error(response.message || 'Lỗi khi cập nhật trạng thái.');
        return false;
      }
    } catch (error) {
      console.error(error);
      toast.error('Lỗi khi thực hiện khóa/mở khóa.');
      return false;
    }
  };

  const banUser = async (userId, until, reason) => {
    try {
      const response = await adminApi.banUserAPI(userId, until, reason);
      if (response.isSuccess) {
        toast.success(response.message || 'Cấm tài khoản thành công.');
        setUsers(prev => prev.map(u => 
          u.userId === userId ? { ...u, banUntil: until } : u
        ));
        return true;
      } else {
        toast.error(response.message || 'Lỗi khi cấm tài khoản.');
        return false;
      }
    } catch (error) {
      console.error(error);
      toast.error('Lỗi khi thực hiện cấm tài khoản.');
      return false;
    }
  };

  const unbanUser = async (userId) => {
    try {
      const response = await adminApi.unbanUserAPI(userId);
      if (response.isSuccess) {
        toast.success(response.message || 'Mở khóa tài khoản thành công.');
        setUsers(prev => prev.map(u => 
          u.userId === userId ? { ...u, banUntil: null } : u
        ));
        return true;
      } else {
        toast.error(response.message || 'Lỗi khi mở khóa tài khoản.');
        return false;
      }
    } catch (error) {
      console.error(error);
      toast.error('Lỗi khi thực hiện mở khóa tài khoản.');
      return false;
    }
  };

  return { users, isLoading, fetchUsers, changeRole, toggleStatus, banUser, unbanUser };
};

export const useAdminFacilities = () => {
  const [facilities, setFacilities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFacilities = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await adminApi.getAdminFacilitiesAPI();
      if (response.success) {
        setFacilities(response.data);
      } else {
        toast.error(response.message || 'Lỗi khi tải danh sách cơ sở.');
      }
    } catch (error) {
      console.error(error);
      toast.error('Không thể kết nối đến server.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const approveFacility = async (facilityId) => {
    try {
      const response = await adminApi.approveFacilityAPI(facilityId);
      if (response.success) {
        toast.success(response.message || 'Phê duyệt cơ sở thành công.');
        setFacilities(prev => prev.map(f => 
          f.facilityId === facilityId ? { ...f, statusId: 2, statusName: 'Đã duyệt' } : f
        ));
        return true;
      } else {
        toast.error(response.message || 'Lỗi khi phê duyệt cơ sở.');
        return false;
      }
    } catch (error) {
      console.error(error);
      toast.error('Có lỗi xảy ra khi phê duyệt.');
      return false;
    }
  };

  const rejectFacility = async (facilityId) => {
    try {
      const response = await adminApi.rejectFacilityAPI(facilityId);
      if (response.success) {
        toast.success(response.message || 'Từ chối cơ sở thành công.');
        setFacilities(prev => prev.map(f => 
          f.facilityId === facilityId ? { ...f, statusId: 3, statusName: 'Đã từ chối' } : f
        ));
        return true;
      } else {
        toast.error(response.message || 'Lỗi khi từ chối cơ sở.');
        return false;
      }
    } catch (error) {
      console.error(error);
      toast.error('Có lỗi xảy ra khi từ chối.');
      return false;
    }
  };

  const deleteFacility = async (facilityId) => {
    try {
      const response = await adminApi.deleteFacilityAPI(facilityId);
      if (response.success) {
        toast.success(response.message || 'Xóa cơ sở thành công.');
        setFacilities(prev => prev.filter(f => f.facilityId !== facilityId));
        return true;
      } else {
        toast.error(response.message || 'Lỗi khi xóa cơ sở.');
        return false;
      }
    } catch (error) {
      console.error(error);
      toast.error('Có lỗi xảy ra khi xóa.');
      return false;
    }
  };

  return { facilities, isLoading, fetchFacilities, approveFacility, rejectFacility, deleteFacility };
};

export const useAdminPayouts = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPayoutRequests = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await adminApi.getPayoutRequestsAPI();
      if (response.success) {
        setRequests(response.data);
      } else {
        toast.error(response.message || 'Lỗi khi tải danh sách yêu cầu rút tiền.');
      }
    } catch (error) {
      console.error(error);
      toast.error('Không thể kết nối đến server.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const approvePayout = async (payoutId, payload) => {
    try {
      setIsSubmitting(true);
      const response = await adminApi.approvePayoutAPI(payoutId, payload);
      if (response.success) {
        toast.success(response.message || 'Phê duyệt yêu cầu rút tiền thành công.');
        await fetchPayoutRequests();
        return true;
      } else {
        toast.error(response.message || 'Lỗi khi phê duyệt yêu cầu.');
        return false;
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi phê duyệt.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const rejectPayout = async (payoutId, payload) => {
    try {
      setIsSubmitting(true);
      const response = await adminApi.rejectPayoutAPI(payoutId, payload);
      if (response.success) {
        toast.success(response.message || 'Đã từ chối yêu cầu rút tiền.');
        await fetchPayoutRequests();
        return true;
      } else {
        toast.error(response.message || 'Lỗi khi từ chối yêu cầu.');
        return false;
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi từ chối.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { requests, isLoading, isSubmitting, fetchPayoutRequests, approvePayout, rejectPayout };
};

export const useSystemSettings = () => {
  const [settings, setSettings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await adminApi.getSystemSettingsAPI();
      if (response.success) {
        setSettings(response.data);
      } else {
        toast.error(response.message || 'Lỗi khi tải cài đặt hệ thống.');
      }
    } catch (error) {
      console.error(error);
      toast.error('Không thể kết nối đến server.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSetting = async (key, value) => {
    try {
      const response = await adminApi.updateSystemSettingAPI(key, value);
      if (response.success) {
        toast.success(response.message || 'Cập nhật cài đặt thành công.');
        setSettings(prev => prev.map(s => 
          s.settingKey === key ? { ...s, settingValue: value } : s
        ));
        return true;
      } else {
        toast.error(response.message || 'Lỗi khi cập nhật cài đặt.');
        return false;
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật.');
      return false;
    }
  };

  return { settings, isLoading, fetchSettings, updateSetting };
};
