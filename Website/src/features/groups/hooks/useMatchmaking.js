import { useState, useCallback } from 'react';
import {
    createChallengeAPI,
    getActiveChallengesAPI,
    getChallengesForMapAPI,
    joinChallengeAPI,
    getAcceptancesAPI,
    respondToAcceptanceAPI
} from '../api/matchmaking.api';

export const useMatchmaking = () => {
    const [challenges, setChallenges] = useState([]);
    const [mapChallenges, setMapChallenges] = useState([]);
    const [acceptances, setAcceptances] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchActiveChallenges = useCallback(async (params) => {
        try {
            setLoading(true);
            setError(null);
            const response = await getActiveChallengesAPI(params);
            setChallenges(response.data);
            return response.data;
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchMapChallenges = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getChallengesForMapAPI();
            setMapChallenges(response.data);
            return response.data;
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const createChallenge = async (data) => {
        try {
            setLoading(true);
            setError(null);
            const response = await createChallengeAPI(data);
            return response.data;
        } catch (err) {
            const msg = err.response?.data?.message || err.message;
            setError(msg);
            throw new Error(msg);
        } finally {
            setLoading(false);
        }
    };

    const joinChallenge = async (challengeId, data) => {
        try {
            setLoading(true);
            setError(null);
            const response = await joinChallengeAPI(challengeId, data);
            return response.data;
        } catch (err) {
            const msg = err.response?.data?.message || err.message;
            setError(msg);
            throw new Error(msg);
        } finally {
            setLoading(false);
        }
    };

    const fetchAcceptances = useCallback(async (challengeId) => {
        try {
            setLoading(true);
            setError(null);
            const response = await getAcceptancesAPI(challengeId);
            setAcceptances(response.data);
            return response.data;
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const respondToAcceptance = async (acceptanceId, accept) => {
        try {
            setLoading(true);
            setError(null);
            const response = await respondToAcceptanceAPI(acceptanceId, accept);
            return response;
        } catch (err) {
            const msg = err.response?.data?.message || err.message;
            setError(msg);
            throw new Error(msg);
        } finally {
            setLoading(false);
        }
    };

    return {
        challenges,
        mapChallenges,
        acceptances,
        loading,
        error,
        fetchActiveChallenges,
        fetchMapChallenges,
        createChallenge,
        joinChallenge,
        fetchAcceptances,
        respondToAcceptance
    };
};
