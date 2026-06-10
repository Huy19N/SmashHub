import api from '../../../config/axios';

/**
 * Get user dashboard statistics (GET /api/statistics/me)
 */
export const getStatisticsAPI = async () => {
  const response = await api.get('/statistics/me');
  return response.data;
};
