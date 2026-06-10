import { useState, useEffect, useCallback } from 'react';
import {
  getMyFacilitiesAPI,
  createFacilityAPI,
  getCourtsByFacilityAPI,
  createCourtAPI,
  updateCourtAPI,
  deleteCourtAPI,
  getAllSportsAPI,
  getCourtStatusesAPI,
  getCourtCostsAPI,
  createCourtCostAPI,
  updateCourtCostAPI,
  deleteCourtCostAPI
} from '../api/courtsManagement.api';

export const useCourtsManagement = () => {
  const [facilities, setFacilities] = useState([]);
  const [selectedFacilityId, setSelectedFacilityId] = useState(null);
  const [courts, setCourts] = useState([]);
  const [sports, setSports] = useState([]);
  const [courtStatuses, setCourtStatuses] = useState([]);
  
  const [isLoadingFacilities, setIsLoadingFacilities] = useState(false);
  const [isLoadingCourts, setIsLoadingCourts] = useState(false);
  const [isLoadingSports, setIsLoadingSports] = useState(false);
  const [isLoadingStatuses, setIsLoadingStatuses] = useState(false);
  const [error, setError] = useState(null);

  // Fetch facilities
  const fetchFacilities = useCallback(async () => {
    setIsLoadingFacilities(true);
    setError(null);
    try {
      const res = await getMyFacilitiesAPI();
      const facilityList = res?.data ?? res ?? [];
      setFacilities(facilityList);
      if (facilityList.length > 0 && !selectedFacilityId) {
        setSelectedFacilityId(facilityList[0].facilityId);
      }
    } catch (err) {
      setError(err.message || 'Lỗi khi tải danh sách cơ sở.');
    } finally {
      setIsLoadingFacilities(false);
    }
  }, [selectedFacilityId]);

  // Fetch courts for selected facility
  const fetchCourts = useCallback(async (facilityId) => {
    if (!facilityId) {
      setCourts([]);
      return;
    }
    setIsLoadingCourts(true);
    setError(null);
    try {
      const res = await getCourtsByFacilityAPI(facilityId);
      setCourts(res?.data ?? res ?? []);
    } catch (err) {
      setError(err.message || 'Lỗi khi tải danh sách sân.');
    } finally {
      setIsLoadingCourts(false);
    }
  }, []);

  // Fetch sports
  const fetchSports = useCallback(async () => {
    setIsLoadingSports(true);
    try {
      const res = await getAllSportsAPI();
      setSports(res?.data ?? res ?? []);
    } catch (err) {
      console.error('Lỗi khi tải danh sách môn thể thao:', err);
    } finally {
      setIsLoadingSports(false);
    }
  }, []);

  // Fetch court statuses
  const fetchCourtStatuses = useCallback(async () => {
    setIsLoadingStatuses(true);
    try {
      const res = await getCourtStatusesAPI();
      setCourtStatuses(res?.data ?? res ?? []);
    } catch (err) {
      console.error('Lỗi khi tải danh sách trạng thái sân:', err);
    } finally {
      setIsLoadingStatuses(false);
    }
  }, []);

  // Load facilities, sports, and statuses on mount
  useEffect(() => {
    fetchFacilities();
    fetchSports();
    fetchCourtStatuses();
  }, [fetchFacilities, fetchSports, fetchCourtStatuses]);

  // Fetch courts when facility changes
  useEffect(() => {
    if (selectedFacilityId) {
      fetchCourts(selectedFacilityId);
    } else {
      setCourts([]);
    }
  }, [selectedFacilityId, fetchCourts]);

  // Create facility
  const createFacility = async (facilityData) => {
    setError(null);
    try {
      const res = await createFacilityAPI(facilityData);
      const newFacility = res?.data ?? res;
      setFacilities((prev) => [...prev, newFacility]);
      setSelectedFacilityId(newFacility.facilityId);
      return newFacility;
    } catch (err) {
      setError(err.message || 'Lỗi khi tạo cơ sở mới.');
      throw err;
    }
  };

  // Create court
  const createCourt = async (courtData) => {
    if (!selectedFacilityId) throw new Error('Vui lòng chọn cơ sở trước.');
    setError(null);
    try {
      const res = await createCourtAPI(selectedFacilityId, courtData);
      const newCourt = res?.data ?? res;
      setCourts((prev) => [...prev, newCourt]);
      return newCourt;
    } catch (err) {
      setError(err.message || 'Lỗi khi tạo sân mới.');
      throw err;
    }
  };

  // Update court
  const updateCourt = async (courtId, courtData) => {
    setError(null);
    try {
      const res = await updateCourtAPI(courtId, courtData);
      const updated = res?.data ?? res;
      setCourts((prev) => prev.map((c) => (c.courtId === courtId ? updated : c)));
      return updated;
    } catch (err) {
      setError(err.message || 'Lỗi khi cập nhật sân.');
      throw err;
    }
  };

  // Delete court
  const deleteCourt = async (courtId) => {
    setError(null);
    try {
      await deleteCourtAPI(courtId);
      setCourts((prev) => prev.filter((c) => c.courtId !== courtId));
      return true;
    } catch (err) {
      setError(err.message || 'Lỗi khi xóa sân.');
      throw err;
    }
  };

  // --- Court Costs ---
  const fetchCourtCosts = async (courtId) => {
    try {
      const res = await getCourtCostsAPI(courtId);
      return res?.data ?? res ?? [];
    } catch (err) {
      console.error('Lỗi khi tải giá sân:', err);
      throw err;
    }
  };

  const createCourtCost = async (courtId, costData) => {
    try {
      const res = await createCourtCostAPI(courtId, costData);
      return res?.data ?? res;
    } catch (err) {
      console.error('Lỗi khi tạo giá sân:', err);
      throw err;
    }
  };

  const updateCourtCost = async (courtCostId, costData) => {
    try {
      const res = await updateCourtCostAPI(courtCostId, costData);
      return res?.data ?? res;
    } catch (err) {
      console.error('Lỗi khi cập nhật giá sân:', err);
      throw err;
    }
  };

  const deleteCourtCost = async (courtCostId) => {
    try {
      await deleteCourtCostAPI(courtCostId);
      return true;
    } catch (err) {
      console.error('Lỗi khi xóa giá sân:', err);
      throw err;
    }
  };

  return {
    facilities,
    selectedFacilityId,
    setSelectedFacilityId,
    courts,
    sports,
    courtStatuses,
    isLoadingFacilities,
    isLoadingCourts,
    isLoadingSports,
    isLoadingStatuses,
    error,
    refetchFacilities: fetchFacilities,
    refetchCourts: () => fetchCourts(selectedFacilityId),
    createFacility,
    createCourt,
    updateCourt,
    deleteCourt,
    fetchCourtCosts,
    createCourtCost,
    updateCourtCost,
    deleteCourtCost
  };
};
export default useCourtsManagement;
