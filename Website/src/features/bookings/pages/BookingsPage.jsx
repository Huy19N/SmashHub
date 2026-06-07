import React, { useState } from 'react';
import { Filter, CalendarDays, Plus, Grid, List, Activity, Circle, Users, Flame } from 'lucide-react';
import Sidebar from '../../../components/layout/Sidebar';
import CourtCard from '../components/CourtCard';
import Button from '../../../components/ui/Button';

import BookingModal from '../components/BookingModal';
import { useFacility } from '../hooks/useBookings';

export default function BookingsPage() {
  const [viewMode, setViewMode] = useState('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState(null);

  const { facilities, fetchFacilities, loading } = useFacility();

  React.useEffect(() => {
    fetchFacilities();
  }, [fetchFacilities]);

  const handleBookNow = (facility) => {
    setSelectedFacility(facility);
    setIsModalOpen(true);
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] dark:bg-[#0a0d14] transition-colors duration-300">
      <Sidebar activeMenu="Bookings" />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 space-y-10">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <h1 className="text-[40px] font-bold font-display text-[#1e293b] dark:text-white mb-3 tracking-tight">
                Đặt sân
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed">
                Theo dõi trạng thái và điều phối lịch đặt sân cho các thành viên trong thời gian thực.
              </p>
            </div>
            <Button className="shrink-0 flex items-center gap-2 px-8 py-3.5 rounded-full text-base shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-shadow">
              <Plus size={20} />
              <span>Tìm sân phù hợp</span>
            </Button>
          </div>

          {/* Filters Bar */}
          <div className="bg-white dark:bg-card-dark border border-gray-100 dark:border-border-dark rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-5 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 font-bold text-[13px] tracking-wider shrink-0 ml-2">
                <Filter size={16} />
                <span>LỌC THEO:</span>
              </div>
              <div className="relative">
                <select className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl pl-4 pr-10 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none appearance-none min-w-[160px] cursor-pointer hover:border-gray-300 transition-colors">
                  <option>Vị trí địa lý</option>
                  <option>Quận 1</option>
                  <option>Quận 2</option>
                  <option>Quận 7</option>
                  <option>Thủ Đức</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                </div>
              </div>
              <div className="relative">
                <select className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl pl-4 pr-10 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none appearance-none min-w-[160px] cursor-pointer hover:border-gray-300 transition-colors">
                  <option>Môn thể thao</option>
                  <option>Cầu lông</option>
                  <option>Tennis</option>
                  <option>Pickleball</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                </div>
              </div>
            </div>

            <div className="flex items-center bg-gray-50 dark:bg-gray-800/50 rounded-xl p-1 shrink-0 border border-gray-100 dark:border-gray-700/50">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2.5 rounded-lg transition-all duration-200 ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700 shadow-sm text-emerald-600 dark:text-primary' : 'text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
              >
                <Grid size={18} strokeWidth={2.5} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2.5 rounded-lg transition-all duration-200 ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow-sm text-emerald-600 dark:text-primary' : 'text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
              >
                <List size={18} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
          ) : facilities.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              Không có sân nào hiển thị.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {facilities.map(facility => (
                <CourtCard
                  key={facility.facilityId}
                  title={facility.name}
                  subtitle={facility.address + (facility.district ? `, ${facility.district}` : '')}
                  status="Sẵn sàng"
                  image={'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=800'} // Default image since API might not have it
                  onBook={() => handleBookNow(facility)}
                />
              ))}
            </div>
          )}

        </div>
      </main>

      {/* Booking Modal */}
      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        facility={selectedFacility}
      />
    </div>
  );
}
