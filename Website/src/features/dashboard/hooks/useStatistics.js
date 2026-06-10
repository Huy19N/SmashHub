import { useState, useEffect, useCallback } from 'react';
import { getStatisticsAPI } from '../api/statisticsApi';

export const useStatistics = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStatistics = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getStatisticsAPI();
      setData(response?.data ?? response);
    } catch (err) {
      setError(err.message || 'Lỗi khi tải bảng thống kê.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  return { data, isLoading, error, refetch: fetchStatistics };
};
export default useStatistics;
