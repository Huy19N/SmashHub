import React from 'react';
import { MapPin } from 'lucide-react';

export default function CourtCard({
  image,
  status,
  title,
  subtitle,
  distanceKm,
  icon: Icon,
  onBook
}) {
  const isAvailable = status === 'Sẵn sàng';
  const isBusy = status === 'Đang bận';
  const isMaintenance = status === 'Đang bảo trì';

  return (
    <div className="bg-white dark:bg-card-dark rounded-[20px] border border-gray-100 dark:border-border-dark overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col">
      <div className="relative h-[200px] w-full overflow-hidden p-2">
        <div className="w-full h-full rounded-[14px] overflow-hidden relative">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          {/* Status Badge */}
          <div className="absolute top-3 right-3">
            <span className={`px-3.5 py-1.5 text-[11px] font-bold rounded-full uppercase tracking-wide flex items-center shadow-lg ${
              isAvailable ? 'bg-emerald-500/95 backdrop-blur-sm text-white' :
              isBusy ? 'bg-rose-500/95 backdrop-blur-sm text-white' :
              'bg-slate-800/80 backdrop-blur-sm text-white'
            }`}>
              <span className={`mr-2 inline-block w-1.5 h-1.5 rounded-full ${isMaintenance ? 'bg-slate-400' : 'bg-white animate-pulse'}`}></span>
              {status}
            </span>
          </div>
        </div>
      </div>
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-1.5">
          <h3 className="font-bold text-xl text-gray-900 dark:text-white font-display leading-tight">
            {title}
          </h3>
          {Icon && <Icon className="text-emerald-600 dark:text-primary w-5 h-5 shrink-0 mt-0.5" />}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 font-medium">
          {subtitle}
          {distanceKm !== undefined && distanceKm !== null && (
            <span className="block mt-1 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
              <MapPin className="w-3 h-3 inline-block mr-1 -mt-0.5" />
              Cách đây {distanceKm.toFixed(1)} km
            </span>
          )}
        </p>
        
        <div className="mt-auto">
          <button
            onClick={onBook}
            disabled={isMaintenance}
            className={`w-full py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
              !isMaintenance 
                ? 'bg-emerald-200/60 text-emerald-800 hover:bg-emerald-300/80 dark:bg-emerald-500/20 dark:text-emerald-300 dark:hover:bg-emerald-500/30' 
                : 'bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-gray-800/50 dark:text-gray-500'
            }`}
          >
            {!isMaintenance ? 'Đặt ngay' : 'Tạm đóng'}
          </button>
        </div>
      </div>
    </div>
  );
}
