import React from 'react';
import MediaImage from '../../../components/ui/MediaImage';

const PostMediaGrid = ({ mediaFileIds }) => {
  if (!mediaFileIds || mediaFileIds.length === 0) return null;

  const count = mediaFileIds.length;

  // 1 Image
  if (count === 1) {
    return (
      <div className="w-full max-h-[500px] rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <MediaImage 
          fileId={mediaFileIds[0]} 
          alt="Post media" 
          className="w-full h-full object-contain max-h-[500px]"
        />
      </div>
    );
  }

  // 2 Images
  if (count === 2) {
    return (
      <div className="grid grid-cols-2 gap-1 rounded-2xl overflow-hidden h-72 sm:h-[400px]">
        <div className="w-full h-full bg-gray-100 dark:bg-gray-800">
          <MediaImage fileId={mediaFileIds[0]} alt="Post media 1" className="w-full h-full object-cover" />
        </div>
        <div className="w-full h-full bg-gray-100 dark:bg-gray-800">
          <MediaImage fileId={mediaFileIds[1]} alt="Post media 2" className="w-full h-full object-cover" />
        </div>
      </div>
    );
  }

  // 3 Images
  if (count === 3) {
    return (
      <div className="grid grid-cols-2 grid-rows-2 gap-1 rounded-2xl overflow-hidden h-80 sm:h-[450px]">
        <div className="w-full h-full bg-gray-100 dark:bg-gray-800 row-span-2">
          <MediaImage fileId={mediaFileIds[0]} alt="Post media 1" className="w-full h-full object-cover" />
        </div>
        <div className="w-full h-full bg-gray-100 dark:bg-gray-800">
          <MediaImage fileId={mediaFileIds[1]} alt="Post media 2" className="w-full h-full object-cover" />
        </div>
        <div className="w-full h-full bg-gray-100 dark:bg-gray-800">
          <MediaImage fileId={mediaFileIds[2]} alt="Post media 3" className="w-full h-full object-cover" />
        </div>
      </div>
    );
  }

  // 4 Images
  if (count === 4) {
    return (
      <div className="grid grid-cols-2 grid-rows-2 gap-1 rounded-2xl overflow-hidden h-80 sm:h-[450px]">
        {mediaFileIds.map((id, idx) => (
          <div key={id} className="w-full h-full bg-gray-100 dark:bg-gray-800">
            <MediaImage fileId={id} alt={`Post media ${idx + 1}`} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
    );
  }

  // 5+ Images
  return (
    <div className="grid grid-cols-2 grid-rows-2 gap-1 rounded-2xl overflow-hidden h-80 sm:h-[450px]">
      {mediaFileIds.slice(0, 3).map((id, idx) => (
        <div key={id} className="w-full h-full bg-gray-100 dark:bg-gray-800">
          <MediaImage fileId={id} alt={`Post media ${idx + 1}`} className="w-full h-full object-cover" />
        </div>
      ))}
      <div className="relative w-full h-full bg-gray-100 dark:bg-gray-800 group cursor-pointer">
        <MediaImage fileId={mediaFileIds[3]} alt="Post media 4" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/50 transition-colors flex items-center justify-center">
          <span className="text-white text-3xl font-bold tracking-wider">
            +{count - 4}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PostMediaGrid;
