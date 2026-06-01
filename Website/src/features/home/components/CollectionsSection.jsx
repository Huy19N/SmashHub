import { useState } from 'react';
import volleyballImg from '../../../assets/volleyball.jpg';
import tennisImg from '../../../assets/tennis.jpg';
import soccerImg from '../../../assets/soccer.jpg';
import basketballImg from '../../../assets/basketball.jpg';
import badmintonImg from '../../../assets/badminton.jpg';

const collections = [
  {
    id: 1,
    title: 'Cầu Lông',
    subtitle: 'Đỉnh cao tốc độ',
    image: badmintonImg,
    color: 'from-blue-600/80',
  },
  {
    id: 2,
    title: 'Quần Vợt',
    subtitle: 'Sức mạnh & Kỹ thuật',
    image: tennisImg,
    color: 'from-emerald-600/80',
  },
  {
    id: 3,
    title: 'Bóng Đá',
    subtitle: 'Đam mê sân cỏ',
    image: soccerImg,
    color: 'from-rose-600/80',
  },
  {
    id: 4,
    title: 'Bóng Rổ',
    subtitle: 'Bứt phá không gian',
    image: basketballImg,
    color: 'from-orange-600/80',
  },
  {
    id: 5,
    title: 'Bóng Chuyền',
    subtitle: 'Đoàn kết vươn xa',
    image: volleyballImg,
    color: 'from-cyan-600/80',
  },
];

export default function CollectionsSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section id="collections-section" className="relative w-full bg-[#0b0f19] py-20 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center md:text-left">
          <span className="text-primary font-bold text-sm tracking-widest uppercase font-label drop-shadow-md">
            Bộ Sưu Tập
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold font-display leading-tight text-white mt-2">
            Khám Phá <span className="text-gradient-primary italic">Đam Mê</span>
          </h2>
          <p className="text-gray-400 mt-4 max-w-2xl text-sm sm:text-base font-sans">
            Trải nghiệm không gian thể thao đa dạng với hệ thống sân bãi đạt chuẩn. Từ mặt sàn thi đấu đến ánh sáng, mọi thứ đều được thiết kế hoàn hảo.
          </p>
        </div>

        {/* Desktop: Expanding Cards Effect, Mobile: Horizontal Scroll */}
        <div className="flex flex-row overflow-x-auto md:overflow-visible snap-x snap-mandatory hide-scrollbar gap-4 h-[400px] md:h-[600px] w-full">
          {collections.map((item, index) => {
            const isActive = activeIndex === index;

            return (
              <div
                key={item.id}
                onMouseEnter={() => setActiveIndex(index)}
                className={`relative shrink-0 snap-center rounded-3xl overflow-hidden cursor-pointer transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] group
                  ${isActive ? 'w-[75vw] md:w-auto md:flex-[4]' : 'w-[60vw] md:w-auto md:flex-[1]'}
                  h-full
                `}
              >
                {/* Background Image with parallax-like slight scale */}
                <img
                  src={item.image}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />

                {/* Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t ${item.color} to-transparent opacity-60 md:opacity-40 transition-opacity duration-500 group-hover:opacity-80`} />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />

                {/* Content */}
                <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full flex flex-col justify-end">
                  <div className={`transform transition-all duration-500 delay-100 ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0 md:opacity-100 md:translate-y-0'}`}>
                    <div className={`flex items-center gap-3 md:flex-col md:items-start lg:flex-row lg:items-center`}>
                      <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/30">
                        <span className="text-white font-bold font-display">{item.id}</span>
                      </div>
                      <div className={`transition-all duration-500 ${isActive ? 'opacity-100 max-w-full' : 'opacity-0 max-w-0 md:opacity-100 md:max-w-full lg:opacity-0 lg:max-w-0'} overflow-hidden whitespace-nowrap`}>
                        <h3 className="text-2xl sm:text-3xl font-bold font-display text-white drop-shadow-lg">{item.title}</h3>
                        <p className="text-sm font-label text-white/80 uppercase tracking-wider">{item.subtitle}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
