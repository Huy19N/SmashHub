import React, { useState, useEffect } from 'react';
import api from '../../config/axios';

const MediaImage = ({ fileId, alt, className, onClick, onError }) => {
    const [imageUrl, setImageUrl] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        if (!fileId) {
            setLoading(false);
            return;
        }

        const fetchImage = async () => {
            try {
                const res = await api.get(`/files/${fileId}`);
                if (isMounted && res.data?.data?.url) {
                    setImageUrl(res.data.data.url);
                }
            } catch (error) {
                console.error("Failed to load image from MinIO", error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchImage();
        return () => { isMounted = false; };
    }, [fileId]);

    if (loading) {
        return <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>;
    }

    if (!imageUrl) {
        // Fallback for broken or missing image
        return (
            <div className={`bg-gray-100 flex items-center justify-center text-gray-400 text-xs overflow-hidden ${className}`}>
                No Img
            </div>
        );
    }

    return (
        <img 
            src={imageUrl} 
            alt={alt || "Media"} 
            className={className} 
            onClick={() => {
                if (onClick) onClick(imageUrl);
            }} 
            onError={onError}
        />
    );
};

export default MediaImage;
