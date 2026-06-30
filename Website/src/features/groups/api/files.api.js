import api, { getAccessToken } from '../../../config/axios';

export const uploadFileAPI = async (file, purpose = 'General') => {
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await api.post(`/files/upload?purpose=${purpose}`, formData);
        return response.data;
    } catch (error) {
        const errMsg = error.response?.data?.message || error.response?.data?.Message;
        if (errMsg) {
            throw new Error(errMsg);
        }
        throw error;
    }
};

export const getFileUrl = (fileId) => {
    return `${api.defaults.baseURL}/files/${fileId}`;
};
