import api from '../../../config/axios';

export const getMyPaymentsAPI = async (params) => {
  const response = await api.get('/payments/my', { params });
  return response.data;
};
