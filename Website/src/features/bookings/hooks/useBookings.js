import { useState, useEffect, useCallback } from 'react';
import {
    getAllBookingAPI,
    getBookingByIdAPI,
    createBookingAPI,
    updateBookingAPI,
    deleteBookingAPI,
    getCourtByfacilityIdAPI,
    getCourtByIdAPI,
    createCourtAPI,
    updateCourtAPI,
    getCourtCostByCourtIdAPI,
    createCourtCostAPI,
    updateCourtCostAPI,
    deleteCourtCostAPI,
    getAllFacilityAPI,
    getFacilityByIdAPI,
    createFacilityAPI,
    updateFacilityAPI,
    getFilteredFacilitiesAPI,
    getCourtStatusAPI
} from '../api/bookings.api.js';


//   useBookings Hook
export const useBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch all bookings
    const fetchBookings = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getAllBookingAPI();
            setBookings(response.data?.items || response.data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch booking by ID
    const fetchBookingById = useCallback(async (bookingId) => {
        try {
            setLoading(true);
            setError(null);
            const response = await getBookingByIdAPI(bookingId);
            return response.data;
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Create booking
    const createBooking = useCallback(async (bookingData) => {
        try {
            setLoading(true);
            setError(null);
            const response = await createBookingAPI(bookingData);
            fetchBookings(); // Refresh bookings list
            return response.data;
        } catch (err) {
            const msg = err.response?.data?.message || err.message;
            setError(msg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchBookings]);

    // Update booking
    const updateBooking = useCallback(async (bookingId, bookingData) => {
        try {
            setLoading(true);
            setError(null);
            const response = await updateBookingAPI(bookingId, bookingData);
            fetchBookings(); // Refresh bookings list
            return response.data;
        } catch (err) {
            const msg = err.response?.data?.message || err.message;
            setError(msg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchBookings]);

    // Delete booking
    const deleteBooking = useCallback(async (bookingId) => {
        try {
            setLoading(true);
            setError(null);
            const response = await deleteBookingAPI(bookingId);
            fetchBookings(); // Refresh bookings list
            return response.data;
        } catch (err) {
            const msg = err.response?.data?.message || err.message;
            setError(msg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchBookings]);

    return {
        bookings,
        loading,
        error,
        fetchBookings,
        fetchBookingById,
        createBooking,
        updateBooking,
        deleteBooking,
    };
};


// useCourt Hook
export const useCourt = () => {
    const [courts, setCourts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [courtStatuses, setCourtStatuses] = useState([]);

    // Fetch all courts for a facility
    const fetchCourts = useCallback(async (facilityId) => {
        try {
            setLoading(true);
            setError(null);
            const response = await getCourtByfacilityIdAPI(facilityId);
            setCourts(response.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch court by ID
    const fetchCourtById = useCallback(async (courtId) => {
        try {
            setLoading(true);
            setError(null);
            const response = await getCourtByIdAPI(courtId);
            return response.data;
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Create court
    const createCourt = useCallback(async (courtData) => {
        try {
            setLoading(true);
            setError(null);
            const response = await createCourtAPI(courtData);
            fetchCourts(); // Refresh courts list
            return response.data;
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [fetchCourts]);

    // Update court
    const updateCourt = useCallback(async (courtId, courtData) => {
        try {
            setLoading(true);
            setError(null);
            const response = await updateCourtAPI(courtId, courtData);
            fetchCourts(); // Refresh courts list
            return response.data;
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [fetchCourts]);

    // Fetch court status
    const fetchCourtStatus = useCallback(async (facilityId, date) => {
        try {
            setLoading(true);
            setError(null);
            const response = await getCourtStatusAPI(facilityId, date);
            setCourtStatuses(response.data);
            return response.data;
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        courts,
        courtStatuses,
        loading,
        error,
        fetchCourts,
        fetchCourtById,
        createCourt,
        updateCourt,
        fetchCourtStatus,
    };
};


// useCourtCost Hook
export const useCourtCost = () => {
    const [courtCosts, setCourtCosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch all court costs for a court
    const fetchCourtCosts = useCallback(async (courtId) => {
        try {
            setLoading(true);
            setError(null);
            const response = await getCourtCostByCourtIdAPI(courtId);
            setCourtCosts(response.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch court cost by ID
    const fetchCourtCostById = useCallback(async (courtCostId) => {
        try {
            setLoading(true);
            setError(null);
            const response = await getCourtCostByCourtIdAPI(courtCostId);
            return response.data;
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Create court cost
    const createCourtCost = useCallback(async (courtCostData) => {
        try {
            setLoading(true);
            setError(null);
            const response = await createCourtCostAPI(courtCostData);
            fetchCourtCosts(); // Refresh court costs list
            return response.data;
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [fetchCourtCosts]);

    // Update court cost
    const updateCourtCost = useCallback(async (courtCostId, courtCostData) => {
        try {
            setLoading(true);
            setError(null);
            const response = await updateCourtCostAPI(courtCostId, courtCostData);
            fetchCourtCosts(); // Refresh court costs list
            return response.data;
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [fetchCourtCosts]);

    // Delete court cost
    const deleteCourtCost = useCallback(async (courtCostId) => {
        try {
            setLoading(true);
            setError(null);
            const response = await deleteCourtCostAPI(courtCostId);
            fetchCourtCosts(); // Refresh court costs list
            return response.data;
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [fetchCourtCosts]);

    return {
        courtCosts,
        loading,
        error,
        fetchCourtCosts,
        fetchCourtCostById,
        createCourtCost,
        updateCourtCost,
        deleteCourtCost,
    };
};


// useFacility Hook
export const useFacility = () => {
    const [facilities, setFacilities] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch all facilities
    const fetchFacilities = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getAllFacilityAPI();
            setFacilities(response.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch filtered facilities
    const fetchFilteredFacilities = useCallback(async (params) => {
        try {
            setLoading(true);
            setError(null);
            const response = await getFilteredFacilitiesAPI(params);
            setFacilities(response.data);
            return response.data;
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch facility by ID
    const fetchFacilityById = useCallback(async (facilityId) => {
        try {
            setLoading(true);
            setError(null);
            const response = await getFacilityByIdAPI(facilityId);
            return response.data;
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Create facility
    const createFacility = useCallback(async (facilityData) => {
        try {
            setLoading(true);
            setError(null);
            const response = await createFacilityAPI(facilityData);
            fetchFacilities(); // Refresh facilities list
            return response.data;
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [fetchFacilities]);

    // Update facility
    const updateFacility = useCallback(async (facilityId, facilityData) => {
        try {
            setLoading(true);
            setError(null);
            const response = await updateFacilityAPI(facilityId, facilityData);
            fetchFacilities(); // Refresh facilities list
            return response.data;
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [fetchFacilities]);

    return {
        facilities,
        loading,
        error,
        fetchFacilities,
        fetchFilteredFacilities,
        fetchFacilityById,
        createFacility,
        updateFacility,
    };
};