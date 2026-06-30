import api from '../../../config/axios';

/** Lấy danh sách cơ sở của chủ sân (GET /api/facilities/my) */
export const getMyFacilitiesAPI = async () => {
  const response = await api.get('/facilities/my');
  return response.data;
};

/** Tạo cơ sở mới (POST /api/facilities) */
export const createFacilityAPI = async (facilityData) => {
  const response = await api.post('/facilities', facilityData);
  return response.data;
};

/** Cập nhật thông tin cơ sở (PUT /api/facilities/{facilityId}) */
export const updateFacilityAPI = async (facilityId, facilityData) => {
  const response = await api.put(`/facilities/${facilityId}`, facilityData);
  return response.data;
};

/** Cập nhật giờ hoạt động của cơ sở (PUT /api/facilities/{facilityId}/operating-hours) */
export const updateFacilityOperatingHoursAPI = async (facilityId, hoursData) => {
  const response = await api.put(`/facilities/${facilityId}/operating-hours`, hoursData);
  return response.data;
};

/** Lấy giờ hoạt động của cơ sở (GET /api/facilities/{facilityId}/operating-hours) */
export const getFacilityOperatingHoursAPI = async (facilityId) => {
  const response = await api.get(`/facilities/${facilityId}/operating-hours`);
  return response.data;
};

/** Lấy danh sách sân theo cơ sở (GET /api/facilities/{facilityId}/courts) */
export const getCourtsByFacilityAPI = async (facilityId) => {
  const response = await api.get(`/facilities/${facilityId}/courts`);
  return response.data;
};

/** Tạo sân mới trong cơ sở (POST /api/facilities/{facilityId}/courts) */
export const createCourtAPI = async (facilityId, courtData) => {
  const response = await api.post(`/facilities/${facilityId}/courts`, courtData);
  return response.data;
};

/** Cập nhật thông tin sân (PUT /api/courts/{courtId}) */
export const updateCourtAPI = async (courtId, courtData) => {
  const response = await api.put(`/courts/${courtId}`, courtData);
  return response.data;
};

/** Xóa sân (DELETE /api/courts/{courtId}) */
export const deleteCourtAPI = async (courtId) => {
  const response = await api.delete(`/courts/${courtId}`);
  return response.data;
};

/** Lấy danh sách tất cả môn thể thao (GET /api/sports) */
export const getAllSportsAPI = async () => {
  const response = await api.get('/sports');
  return response.data;
};

/** Lấy danh sách trạng thái sân (GET /api/statuses/court) */
export const getCourtStatusesAPI = async () => {
  const response = await api.get('/statuses/court');
  return response.data;
};

// --- API for Court Costs ---

/** Lấy danh sách khung giờ & giá của sân (GET /api/courts/{courtId}/costs) */
export const getCourtCostsAPI = async (courtId) => {
  const response = await api.get(`/courts/${courtId}/costs`);
  return response.data;
};

/** Thêm khung giờ & giá cho sân (POST /api/courts/{courtId}/costs) */
export const createCourtCostAPI = async (courtId, costData) => {
  const response = await api.post(`/courts/${courtId}/costs`, costData);
  return response.data;
};

/** Cập nhật khung giờ & giá (PUT /api/court-costs/{courtCostId}) */
export const updateCourtCostAPI = async (courtCostId, costData) => {
  const response = await api.put(`/court-costs/${courtCostId}`, costData);
  return response.data;
};

/** Cập nhật toàn bộ bảng giá sân (PUT /api/courts/{courtId}/costs/bulk) */
export const updateCourtAllAPI = async (courtId, costsData) => {
  const response = await api.put(`/courts/${courtId}/costs/bulk`, costsData);
  return response.data;
};

/** Xóa khung giờ & giá (DELETE /api/court-costs/{courtCostId}) */
export const deleteCourtCostAPI = async (courtCostId) => {
  const response = await api.delete(`/court-costs/${courtCostId}`);
  return response.data;
};

/** Lấy danh sách tài khoản ngân hàng của cơ sở (GET /api/facilities/{facilityId}/bank-accounts) */
export const getBankAccountsAPI = async (facilityId) => {
  const response = await api.get(`/facilities/${facilityId}/bank-accounts`);
  return response.data;
};

/** Thêm tài khoản ngân hàng cho cơ sở (POST /api/facilities/{facilityId}/bank-accounts) */
export const createBankAccountAPI = async (facilityId, bankAccountData) => {
  const response = await api.post(`/facilities/${facilityId}/bank-accounts`, bankAccountData);
  return response.data;
};

/** Cập nhật tài khoản ngân hàng (PUT /api/facilities/{facilityId}/bank-accounts/{bankAccountId}) */
export const updateBankAccountAPI = async (facilityId, bankAccountId, bankAccountData) => {
  const response = await api.put(`/facilities/${facilityId}/bank-accounts/${bankAccountId}`, bankAccountData);
  return response.data;
};

/** Xóa tài khoản ngân hàng (DELETE /api/facilities/{facilityId}/bank-accounts/{bankAccountId}) */
export const deleteBankAccountAPI = async (facilityId, bankAccountId) => {
  const response = await api.delete(`/facilities/${facilityId}/bank-accounts/${bankAccountId}`);
  return response.data;
};

/** Lấy cấu hình thanh toán (GET /api/facilities/{facilityId}/payment-config) */
export const getFacilityPaymentConfigAPI = async (facilityId) => {
  const response = await api.get(`/facilities/${facilityId}/payment-config`);
  return response.data;
};

/** Cập nhật cấu hình thanh toán (PUT /api/facilities/{facilityId}/payment-config) */
export const updateFacilityPaymentConfigAPI = async (facilityId, configData) => {
  const response = await api.put(`/facilities/${facilityId}/payment-config`, configData);
  return response.data;
};
