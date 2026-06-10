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

/** Xóa khung giờ & giá (DELETE /api/court-costs/{courtCostId}) */
export const deleteCourtCostAPI = async (courtCostId) => {
  const response = await api.delete(`/court-costs/${courtCostId}`);
  return response.data;
};
