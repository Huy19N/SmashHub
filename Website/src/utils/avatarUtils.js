export const getAvatarUrl = (avatarFileId) => {
  if (!avatarFileId) return null;
  const baseUrl = import.meta.env.VITE_API_URL || 'https://localhost:7020/api';
  return `${baseUrl}/files/${avatarFileId}`;
};
