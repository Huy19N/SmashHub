import React, { useState, useEffect } from 'react';
import { useMatchmaking } from '../hooks/useMatchmaking';
import { useTeams } from '../hooks/useGroups';
import Sidebar from '../../../components/layout/Sidebar';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Users, Filter, Search, X } from 'lucide-react';
import Button from '../../../components/ui/Button';
import toast from 'react-hot-toast';

// Fix leaf icon issue with react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const customMarkerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const hoangSaIcon = L.divIcon({
  className: 'custom-island-label',
  html: '<div style="font-weight: 900; color: #b91c1c; text-shadow: 2px 2px 0 #fff, -2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff; font-size: 14px; white-space: nowrap;">Hoàng Sa (Việt Nam)</div>',
  iconSize: [150, 20],
  iconAnchor: [75, 10]
});

const truongSaIcon = L.divIcon({
  className: 'custom-island-label',
  html: '<div style="font-weight: 900; color: #b91c1c; text-shadow: 2px 2px 0 #fff, -2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff; font-size: 14px; white-space: nowrap;">Trường Sa (Việt Nam)</div>',
  iconSize: [150, 20],
  iconAnchor: [75, 10]
});

const southSeaIcon = L.divIcon({
  className: 'custom-sea-label',
  html: '<div style="font-weight: bold; color: #1d4ed8; text-shadow: 1px 1px 0 #fff, -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff; font-size: 16px; font-style: italic; white-space: nowrap;">Biển Đông (South Sea)</div>',
  iconSize: [200, 20],
  iconAnchor: [100, 10]
});

export default function MatchmakingPage() {
  const { challenges, mapChallenges, fetchActiveChallenges, fetchMapChallenges, loading, joinChallenge } = useMatchmaking();
  const { teams } = useTeams();

  const [sportId, setSportId] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [selectedTeamId, setSelectedTeamId] = useState('');

  useEffect(() => {
    fetchMapChallenges();
    fetchActiveChallenges({});
  }, [fetchMapChallenges, fetchActiveChallenges]);

  const handleSearch = () => {
    fetchActiveChallenges({
      sportId: sportId ? parseInt(sportId) : undefined,
      city: city || undefined,
      district: district || undefined,
    });
  };

  const currentUserId = localStorage.getItem('userId');
  const myLeaderTeams = teams?.filter(t => {
      // Find current user in members and check role
      // Since useTeams only returns teams where user is a member, 
      // we don't have member roles easily accessible here unless we fetch them or they are included.
      // But we can just list the teams the user belongs to.
      // Ideally, the user must be a Leader to join a challenge.
      return true; // We'll let backend validate if they are a leader
  });

  const handleJoinChallengeClick = (challenge) => {
    if (!myLeaderTeams || myLeaderTeams.length === 0) {
      toast.error('Bạn cần tham gia hoặc tạo một nhóm trước khi bắt kèo!');
      return;
    }
    setSelectedChallenge(challenge);
    setSelectedTeamId(myLeaderTeams[0].teamId || myLeaderTeams[0].id);
  };

  const submitJoinChallenge = async () => {
    if (!selectedChallenge || !selectedTeamId) return;
    try {
      await joinChallenge(selectedChallenge.challengeId, { challengerTeamId: selectedTeamId });
      toast.success('Đã gửi yêu cầu ghép đấu thành công! Chờ đối thủ xác nhận.');
      setSelectedChallenge(null);
    } catch (err) {
      toast.error('Lỗi khi gửi yêu cầu: ' + (err.message || 'Unknown'));
    }
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] dark:bg-[#0a0d14] transition-colors duration-300">
      <Sidebar activeMenu="matchmaking" />

      <main className="flex-1 overflow-y-auto animate-page">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 space-y-10">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <h1 className="text-[40px] font-bold font-display text-[#1e293b] dark:text-white mb-3 tracking-tight">
                Bắt Kèo Ghép Đấu
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed">
                Tìm kiếm đối thủ và giao lưu với các đội nhóm khác trên hệ thống.
              </p>
            </div>
          </div>

          {/* Map Area */}
          <div className="bg-white dark:bg-card-dark border border-gray-100 dark:border-border-dark rounded-2xl overflow-hidden shadow-sm h-[400px] relative z-0">
             <MapContainer 
               center={[10.762622, 106.660172]} 
               zoom={11} 
               minZoom={5}
               maxBounds={[[4.0, 100.0], [24.0, 122.0]]}
               maxBoundsViscosity={1.0}
               style={{ height: '100%', width: '100%' }}
             >
                <TileLayer
                  attribution='&copy; Google Maps'
                  url="https://mt1.google.com/vt/lyrs=m&hl=vi&gl=VN&x={x}&y={y}&z={z}"
                />
                <Marker position={[16.5, 112.0]} icon={hoangSaIcon} interactive={false} />
                <Marker position={[10.0, 114.0]} icon={truongSaIcon} interactive={false} />
                <Marker position={[14.0, 113.0]} icon={southSeaIcon} interactive={false} />
                {mapChallenges?.map((loc, idx) => (
                  <Marker 
                    key={idx} 
                    position={[loc.latitude, loc.longitude]}
                    icon={customMarkerIcon}
                  >
                    <Popup>
                      <div className="font-bold">{loc.facilityName}</div>
                      <div className="text-sm text-gray-600">Đang có {loc.activeChallengeCount} kèo ghép đấu</div>
                    </Popup>
                  </Marker>
                ))}
             </MapContainer>
          </div>

          {/* Filters Bar */}
          <div className="bg-white dark:bg-card-dark border border-gray-100 dark:border-border-dark rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3 w-full overflow-x-auto pb-2 md:pb-0 flex-wrap">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 font-bold text-[13px] tracking-wider shrink-0 ml-2">
                <Filter size={16} />
                <span>LỌC:</span>
              </div>

              <input 
                  type="text"
                  placeholder="Thành phố..."
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none w-40"
              />

              <input 
                  type="text"
                  placeholder="Quận/Huyện..."
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none w-40"
              />

              <select 
                value={sportId}
                onChange={(e) => setSportId(e.target.value)}
                className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl pl-4 pr-10 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none appearance-none min-w-[140px]"
              >
                <option value="">Tất cả môn</option>
                <option value="1">Cầu lông</option>
                <option value="2">Tennis</option>
                <option value="3">Pickleball</option>
              </select>
              
              <button 
                onClick={handleSearch}
                className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 p-2.5 rounded-xl hover:bg-emerald-200 transition-colors"
              >
                <Search size={18} />
              </button>
            </div>
          </div>

          {/* List of Challenges */}
          {loading ? (
             <div className="flex justify-center py-10"><div className="animate-spin h-8 w-8 border-b-2 border-emerald-500 rounded-full"></div></div>
          ) : challenges?.length === 0 ? (
             <div className="text-center py-10 text-gray-500 font-bold">Hiện không có kèo ghép đấu nào!</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {challenges?.map(c => (
                <div key={c.challengeId} className="bg-white dark:bg-card-dark rounded-2xl border border-gray-100 dark:border-border-dark p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                        {c.hostTeamName}
                      </h3>
                      <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded inline-block mt-1">
                        Trình độ: {c.level}
                      </div>
                    </div>
                    <Users className="text-gray-400" size={20}/>
                  </div>
                  
                  <div className="space-y-2 mb-6">
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      <strong>Sân:</strong> {c.facilityName} - {c.courtName}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      <strong>Thời gian:</strong> {new Date(c.startTime).toLocaleString('vi-VN')}
                    </div>
                    {c.message && (
                      <div className="text-sm text-gray-500 italic mt-2">
                        "{c.message}"
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-auto">
                    <Button onClick={() => handleJoinChallengeClick(c)} className="w-full font-bold">
                      Bắt kèo ngay
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Join Challenge Modal */}
      {selectedChallenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedChallenge(null)} />
          <div className="relative w-full max-w-sm bg-white dark:bg-card-dark rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-border-dark p-6 text-center space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white font-display">Bắt Kèo</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-label">
              Bạn đang yêu cầu ghép đấu với đội <strong>{selectedChallenge.hostTeamName}</strong>. 
            </p>
            <div className="text-left space-y-2 mt-4">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Chọn đội của bạn:</label>
              <select 
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-border-dark text-gray-900 dark:text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
              >
                {myLeaderTeams.map(t => (
                  <option key={t.teamId || t.id} value={t.teamId || t.id}>
                    {t.teamName}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setSelectedChallenge(null)}
                className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-white/5 dark:hover:bg-white/10 dark:text-gray-300 transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={submitJoinChallenge}
                className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
              >
                Gửi yêu cầu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
