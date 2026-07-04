import api from "../../../config/axios";

// -Bookings CRUD-
export const getAllBookingAPI = async () => {
    const response = await api.get('/bookings/my');
    return response.data;
}

export const getBookingByIdAPI = async (bookingId) => {
    const response = await api.get(`/bookings/${bookingId}`);
    return response.data;
}

export const createBookingAPI = async (bookingData) => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
}

export const createBatchBookingAPI = async (bookingDataList) => {
    const response = await api.post('/bookings/batch', bookingDataList);
    return response.data;
}

export const updateBookingAPI = async (bookingId, bookingData) => {
    const response = await api.put(`/bookings/${bookingId}`, bookingData);
    return response.data;
}

export const deleteBookingAPI = async (bookingId) => {
    const response = await api.delete(`/bookings/${bookingId}`);
    return response.data;
}

// -Courts CRUD-
export const getCourtByfacilityIdAPI = async (facilityId) => {
    const response = await api.get(`/facilities/${facilityId}/courts`);
    return response.data;
}

export const getCourtByIdAPI = async (courtId) => {
    const response = await api.get(`/courts/${courtId}`);
    return response.data;
}

export const createCourtAPI = async (facilityId, courtData) => {
    const response = await api.post(`/facilities/${facilityId}/courts`, courtData);
    return response.data;
}

export const updateCourtAPI = async (courtId, courtData) => {
    const response = await api.put(`/courts/${courtId}`, courtData);
    return response.data;
}

export const getCourtStatusAPI = async (facilityId, date) => {
    const response = await api.get(`/facilities/${facilityId}/courts/status`, { params: { date } });
    return response.data;
}

// -CourtCosts CRUD-

export const getCourtCostByCourtIdAPI = async (courtId) => {
    const response = await api.get(`/courts/${courtId}/costs`);
    return response.data;
}

export const createCourtCostAPI = async (courtId, courtCostData) => {
    const response = await api.post(`/courts/${courtId}/costs`, courtCostData);
    return response.data;
}

export const updateCourtCostAPI = async (courtCostId, courtCostData) => {
    const response = await api.put(`/court-costs/${courtCostId}`, courtCostData);
    return response.data;
}

export const deleteCourtCostAPI = async (courtCostId) => {
    const response = await api.delete(`/court-costs/${courtCostId}`);
    return response.data;
}

// -Facilities CRUD-

export const getAllFacilityAPI = async () => {
    const response = await api.get(`/facilities`);
    return response.data;
}

export const getFilteredFacilitiesAPI = async (params) => {
    const response = await api.get('/facilities/filter', { params });
    return response.data;
}

export const getFacilityByIdAPI = async (facilityId) => {
    const response = await api.get(`/facilities/${facilityId}`);
    return response.data;
}

export const createFacilityAPI = async (facilityData) => {
    const response = await api.post('/facilities', facilityData);
    return response.data;
}

export const updateFacilityAPI = async (facilityId, facilityData) => {
    const response = await api.put(`/facilities/${facilityId}`, facilityData);
    return response.data;
}

export const getFacilityOperatingHoursAPI = async (facilityId) => {
    const response = await api.get(`/facilities/${facilityId}/operating-hours`);
    return response.data;
}

// -Sports CRUD-

export const getAllSportsAPI = async () => {
    const response = await api.get('/sports');
    return response.data;
}

export const getSportLevelAPI = async (sportId) => {
    const response = await api.get(`/sports/${sportId}/levels`);
    return response.data;
}

