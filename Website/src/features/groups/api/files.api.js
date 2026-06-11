import api, { getAccessToken } from '../../../config/axios';

export const uploadFileAPI = async (file, purpose = 'General') => {
    const formData = new FormData();
    formData.append('file', file);

    const token = getAccessToken();
    const apiUrl = import.meta.env.VITE_API_URL || api.defaults.baseURL;

    const response = await fetch(`${apiUrl}/files/upload?purpose=${purpose}`, {
        method: 'POST',
        body: formData,
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`);
    }

    return response.json();
};

export const getFileUrl = (fileId) => {
    return `${api.defaults.baseURL}/files/${fileId}`;
};
