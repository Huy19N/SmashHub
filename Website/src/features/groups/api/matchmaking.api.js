import api from '../../../config/axios';

// Create a match challenge (Team Leader only)
export const createChallengeAPI = async (data) => {
    // data: { scheduleId: number, level: string, message: string }
    const response = await api.post('/matchmaking', data);
    return response.data;
};

// Get active challenges (Public)
export const getActiveChallengesAPI = async (params) => {
    // params: { sportId?: int, city?: string, district?: string }
    const response = await api.get('/matchmaking', { params });
    return response.data;
};

// Get challenges for map (Public)
export const getChallengesForMapAPI = async () => {
    const response = await api.get('/matchmaking/map');
    return response.data;
};

// Join a challenge as opponent (Challenger Team Leader only)
export const joinChallengeAPI = async (challengeId, data) => {
    // data: { challengerTeamId: int }
    const response = await api.post(`/matchmaking/${challengeId}/join`, data);
    return response.data;
};

// Get acceptances for a challenge (Host Team Leader only)
export const getAcceptancesAPI = async (challengeId) => {
    const response = await api.get(`/matchmaking/${challengeId}/acceptances`);
    return response.data;
};

// Respond to an acceptance (Host Team Leader only)
export const respondToAcceptanceAPI = async (acceptanceId, accept) => {
    const response = await api.post(`/matchmaking/acceptances/${acceptanceId}/respond`, null, {
        params: { accept }
    });
    return response.data;
};

// Get challenges for a specific team (both host and guest)
export const getTeamChallengesAPI = async (teamId) => {
    const response = await api.get(`/matchmaking/teams/${teamId}`);
    return response.data;
};
