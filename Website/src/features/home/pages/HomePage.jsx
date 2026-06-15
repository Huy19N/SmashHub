import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Flame,
  ArrowDown,
  Shield,
  Trophy,
  Activity,
  ArrowRight,
  Sun,
  Moon
} from 'lucide-react';
import { PATHS } from '../../../routes/paths';
import SEOManager from '../../../components/seo/SEOManager';
import videoBg from '../../../assets/video_smash_club.mp4';
import CollectionsSection from '../components/CollectionsSection';
import PremiumSection from '../components/PremiumSection';
import ContactSection from '../components/ContactSection';
import { useTheme } from '../../../contexts/ThemeContext';
import AOS from 'aos';
import 'aos/dist/aos.css';

/**
 * HomePage
 * Optimized 60fps Scrollytelling implementation.
 */
export default function HomePage() {
  const { theme, toggleTheme } = useTheme();
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingComplete, setLoadingComplete] = useState(false);
  const [showHomepage, setShowHomepage] = useState(false);

  const heroContentRef = useRef(null);
  const scrollIndicatorRef = useRef(null);

  const videoRef = useRef(null);
  const targetTime = useRef(0);
  const currentTime = useRef(0);
  const rafId = useRef(null);
  const lastSeekTime = useRef(0);

  // 1. Asset Loader Loop
  useEffect(() => {
    let progress = 0;
    const interval = setInterval(() => {
      if (progress < 40) {
        progress += Math.floor(Math.random() * 8) + 4;
      } else if (progress < 85) {
        progress += Math.floor(Math.random() * 4) + 1;
      } else if (progress < 99) {
        progress += 1;
      } else {
        clearInterval(interval);
      }
      setLoadingProgress(Math.min(progress, 99));
    }, 40);

    const handleVideoCanPlay = () => {
      clearInterval(interval);
      setLoadingProgress(100);
      setTimeout(() => {
        setLoadingComplete(true);
        setTimeout(() => setShowHomepage(true), 800);
      }, 500);
    };

    const video = videoRef.current;
    if (video) {
      const attemptPlay = () => {
        video.play().then(() => {
          video.pause();
          // Only force frame render if duration is safely parsed to prevent stalling the decoder
          if (!isNaN(video.duration) && video.duration > 0) {
            video.currentTime = 0.01;
          }
        }).catch(() => { });
      };

      if (video.readyState >= 3) {
        attemptPlay();
        handleVideoCanPlay();
      } else {
        video.addEventListener('canplaythrough', () => {
          attemptPlay();
          handleVideoCanPlay();
        }, { once: true });

        // Ensure we try again if metadata loads late
        video.addEventListener('loadedmetadata', () => {
          if (video.readyState >= 1) attemptPlay();
        }, { once: true });

        setTimeout(handleVideoCanPlay, 3000); // Fallback
      }
    } else {
      setTimeout(handleVideoCanPlay, 2000);
    }

    return () => {
      clearInterval(interval);
    };
  }, []);

  // 1b. Initialize AOS
  useEffect(() => {
    if (showHomepage) {
      AOS.init({
        duration: 800,
        easing: 'ease-out-cubic',
        once: false,
        offset: 80,
        delay: 0,
      });
    }
  }, [showHomepage]);

  // 2. High-Performance Hybrid Scroll Syncer (zero React re-renders during scroll)
  useEffect(() => {
    if (!showHomepage) return;

    // Track last values to avoid redundant DOM writes
    let lastOpacity = -1;

    const updateVideoTimeline = () => {
      const video = videoRef.current;
      if (video && !isNaN(video.duration) && video.duration > 0) {

        if (window.scrollY <= 10) {
          // Native playback mode: Keep our ref synced with actual playback
          currentTime.current = video.currentTime;
        } else {
          // Scrubbing mode — higher easing = more responsive, less lag
          const ease = 0.15;
          const difference = targetTime.current - currentTime.current;

          if (Math.abs(difference) > 0.001) {
            currentTime.current += difference * ease;

            if (currentTime.current < 0) currentTime.current = 0;
            if (currentTime.current > video.duration) {
              currentTime.current = video.duration;
            }

            // Only seek when the delta is meaningful (avoids flooding the decoder)
            const seekDelta = Math.abs(video.currentTime - currentTime.current);
            const now = performance.now();
            if (!video.seeking && seekDelta > 0.05 && now - lastSeekTime.current > 60) {
              try {
                video.currentTime = currentTime.current;
                lastSeekTime.current = now;
              } catch (e) { }
            }
          }
        }
      }
      rafId.current = requestAnimationFrame(updateVideoTimeline);
    };

    const handleScrollEvent = () => {
      const video = videoRef.current;
      if (!video || isNaN(video.duration) || video.duration === 0) return;

      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;

      if (docHeight <= 0) return;

      // Fade-out Hero Logic via direct DOM manipulation (no React re-render)
      const fadeStart = 300;
      const fadeEnd = 900;
      let opacity = 1;
      if (scrollY > fadeStart) {
        opacity = Math.max(1 - (scrollY - fadeStart) / (fadeEnd - fadeStart), 0);
      }

      // Round to 2 decimal places to reduce redundant writes
      const roundedOpacity = Math.round(opacity * 100) / 100;
      if (roundedOpacity !== lastOpacity) {
        lastOpacity = roundedOpacity;
        if (heroContentRef.current) {
          heroContentRef.current.style.opacity = roundedOpacity;
          heroContentRef.current.style.pointerEvents = roundedOpacity > 0.5 ? 'auto' : 'none';
        }
        if (scrollIndicatorRef.current) {
          // Fade indicator slightly faster than hero text
          const indicatorOpacity = Math.max(1 - scrollY / 300, 0);
          scrollIndicatorRef.current.style.opacity = Math.round(indicatorOpacity * 100) / 100;
        }
      }

      // HYBRID VIDEO LOGIC
      if (scrollY <= 10) {
        if (video.paused) {
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise.catch(() => { });
          }
        }
      } else {
        if (!video.paused) {
          video.pause();
        }
        // Map scroll percentage of the document to video.currentTime
        const scrollPercent = scrollY / docHeight;
        targetTime.current = scrollPercent * video.duration;
      }
    };

    window.addEventListener('scroll', handleScrollEvent, { passive: true });

    // Dynamically recalculate if the new video loads duration parameters late
    if (videoRef.current) {
      videoRef.current.addEventListener('loadedmetadata', handleScrollEvent);
      videoRef.current.addEventListener('durationchange', handleScrollEvent);
    }

    rafId.current = requestAnimationFrame(updateVideoTimeline);
    handleScrollEvent();

    return () => {
      window.removeEventListener('scroll', handleScrollEvent);
      if (videoRef.current) {
        videoRef.current.removeEventListener('loadedmetadata', handleScrollEvent);
        videoRef.current.removeEventListener('durationchange', handleScrollEvent);
      }
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [showHomepage]);

  return (
    <>
      <SEOManager
        title="Immersive Badminton Club Experience"
        description="Experience the thrill of SmashHub. Real-time cinematic video scroll synchronization highlights our premium courts."
      />

      {/* ---------------- PRELOADER ---------------- */}
      {!showHomepage && (
        <div
          className={`fixed inset-0 bg-[#0b0f19] z-[100] flex flex-col justify-between p-8 sm:p-12 select-none transition-all duration-800 cubic-bezier(0.16, 1, 0.3, 1)
            ${loadingComplete ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}
          `}
        >
          <div className="flex items-center justify-between text-xs tracking-[0.2em] font-semibold text-gray-500 font-label">
            <div>SMASHHUB · EST. 2026</div>
            <div className="hidden sm:block">COURT MANAGEMENT v1.0</div>
          </div>
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse-slow" />
              <div className="relative h-20 w-20 rounded-full border border-primary/20 bg-[#1E293B]/80 flex items-center justify-center">
                <Flame className="h-10 w-10 text-primary animate-pulse" />
              </div>
            </div>
            <div className="text-xs font-semibold text-gray-400 tracking-[0.3em] uppercase animate-pulse font-label">
              Buffering Cinematics
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-end justify-between font-label">
              <div className="text-xs sm:text-sm font-bold tracking-widest text-gray-400 uppercase">
                LOADING EXPERIENCE
              </div>
              <div className="text-4xl sm:text-6xl font-extrabold font-display text-gradient-primary">
                {loadingProgress}%
              </div>
            </div>
            <div className="h-[2px] w-full bg-border-dark/60 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300 ease-out"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ---------------- IMMERSIVE EXPERIENCE CONTAINER ---------------- */}
      <div className="relative w-full text-slate-900 dark:text-white bg-transparent">

        {/* VIDEO BACKGROUND */}
        <video
          ref={videoRef}
          src={videoBg}
          className="fixed inset-0 w-full h-full object-cover z-0 select-none pointer-events-none"
          style={{ transform: 'translate3d(0,0,0)' }}
          muted
          playsInline
          loop
          preload="auto"
          autoPlay
        />

        {/* BRIGHT / DARK SHADER */}
        <div
          className="fixed inset-0 bg-gradient-to-b from-white/5 via-white/10 to-white/5 dark:from-black/60 dark:via-black/40 dark:to-black/70 z-[2] pointer-events-none transition-colors duration-500"
          style={{ transform: 'translate3d(0,0,0)' }}
        />

        {/* ---------------- SCOLLYTELLING SECTIONS ---------------- */}
        <main className="relative z-10 w-full select-none pb-[20vh]">

          {/* SECTION 1: HERO VIDEO-ONLY (Sticks to screen — no text, just the shuttlecock video) */}
          <section className="h-[200vh] relative w-full">
            <div className="sticky top-0 h-screen flex flex-col justify-end px-4 max-w-5xl mx-auto text-left">
              <div
                ref={heroContentRef}
                style={{ opacity: 1, pointerEvents: 'auto', transition: 'opacity 0.1s ease-out' }}
              >
                {/* Scroll Down Indicator */}
                <div
                  ref={scrollIndicatorRef}
                  className="flex flex-col items-center gap-2 text-slate-500 dark:text-gray-400 animate-pulse font-label pb-10"
                  style={{ opacity: 1, transition: 'opacity 0.15s ease-out' }}
                >
                  <span className="text-xs font-semibold tracking-widest uppercase text-slate-900 dark:text-white drop-shadow-md">Cuộn để khám phá</span>
                  <ArrowDown className="h-5 w-5 animate-bounce text-emerald-600 dark:text-primary" />
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 1B: HERO TEXT (Appears below, with AOS animations) */}
          <section className="h-[200vh] relative w-full">
            <div className="sticky top-0 h-screen flex flex-col justify-center items-end px-4 max-w-5xl mx-auto text-right">
              <div className="space-y-6 max-w-3xl">
                <span
                  data-aos="fade-left"
                  data-aos-delay="0"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider text-emerald-600 dark:text-primary bg-emerald-100 dark:bg-primary/10 border border-emerald-200 dark:border-primary/20 uppercase font-label"
                >
                  <Shield className="h-3.5 w-3.5 text-emerald-600 dark:text-primary" />
                  Sân đấu đẳng cấp
                </span>

                <h1
                  data-aos="fade-left"
                  data-aos-delay="100"
                  className="text-5xl sm:text-8xl font-black tracking-tighter leading-none font-display text-slate-900 dark:text-white drop-shadow-2xl"
                >
                  PHÁ VỠ <br />
                  <span className="text-gradient-primary font-bold italic">GIỚI HẠN.</span>
                </h1>

                <p
                  data-aos="fade-left"
                  data-aos-delay="200"
                  className="text-slate-700 dark:text-gray-200 text-lg sm:text-2xl font-light leading-relaxed max-w-2xl font-sans drop-shadow-md ml-auto"
                >
                  Trải nghiệm thể thao đẳng cấp với hệ thống sân chất lượng cao, đặt sân tự động và hệ thống chiếu sáng chuyên nghiệp.
                </p>

                <div
                  data-aos="fade-left"
                  data-aos-delay="350"
                  className="flex flex-wrap gap-4 pt-6 font-label justify-end"
                >
                  <Link
                    to={PATHS.BOOKING}
                    className="px-8 py-4 rounded-full font-bold bg-emerald-500 hover:bg-emerald-600 dark:bg-primary dark:hover:bg-primary-dark text-[#052e14] transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg shadow-emerald-500/20 cursor-pointer inline-flex items-center gap-2"
                  >
                    Đặt Sân Ngay
                    <ArrowRight className="h-5 w-5 text-[#052e14]" />
                  </Link>
                  <Link
                    to={PATHS.MEMBERS}
                    className="px-8 py-4 rounded-full font-bold bg-transparent border border-slate-300 dark:border-white/40 hover:border-emerald-500 dark:hover:border-primary text-slate-800 dark:text-white hover:text-emerald-600 transition-all duration-300 cursor-pointer inline-block backdrop-blur-sm"
                  >
                    Quyền Lợi Hội Viên
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 2: ARENA (Sticks to screen) */}
          <section className="h-[200vh] relative w-full">
            <div className="sticky top-0 h-screen flex items-center px-4 max-w-5xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center w-full">
                <div className="space-y-6">
                  <span data-aos="fade-right" className="text-emerald-600 dark:text-primary font-bold text-sm tracking-widest uppercase font-label drop-shadow-md">01 / Sân Đấu</span>
                  <h2 data-aos="fade-up" data-aos-delay="100" className="text-4xl sm:text-5xl font-extrabold font-display leading-tight text-slate-900 dark:text-white drop-shadow-lg">
                    Thiết Kế Cho <br />
                    <span className="text-gradient-primary italic">Tốc Độ & Sức Bật</span>
                  </h2>
                  <p data-aos="fade-up" data-aos-delay="200" className="text-slate-700 dark:text-gray-200 leading-relaxed text-base sm:text-lg font-sans drop-shadow-md">
                    Mỗi sân tại SmashHub đều được trang bị hệ thống sàn chống sốc chuyên nghiệp và bề mặt PVC tiêu chuẩn. Hệ thống đèn LED dọc công suất cao mang đến tầm nhìn hoàn hảo mà không gây chói mắt.
                  </p>
                  <div data-aos="fade-up" data-aos-delay="300" className="grid grid-cols-2 gap-4 pt-4 font-label">
                    <div className="glass-panel p-4 rounded-2xl flex items-start gap-3 border border-slate-200/50 dark:border-white/10 shadow-lg">
                      <Activity className="h-5 w-5 text-emerald-500 dark:text-secondary mt-0.5 shrink-0" />
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">Chống Sốc</h4>
                        <p className="text-xs text-slate-500 dark:text-gray-400">Sàn lõi đàn hồi kép</p>
                      </div>
                    </div>
                    <div className="glass-panel p-4 rounded-2xl flex items-start gap-3 border border-slate-200/50 dark:border-white/10 shadow-lg">
                      <Shield className="h-5 w-5 text-emerald-600 dark:text-primary mt-0.5 shrink-0" />
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">Chống Trượt</h4>
                        <p className="text-xs text-slate-500 dark:text-gray-400">Hệ số bám sàn 0.58</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div data-aos="fade-left" data-aos-delay="200" className="glass-panel p-8 rounded-3xl border border-slate-200/60 dark:border-white/10 space-y-6 shadow-2xl">
                  <div className="h-1 bg-gradient-to-r from-emerald-500 to-emerald-300 dark:from-primary dark:to-secondary rounded-full w-20" />
                  <h3 className="text-2xl font-bold font-display text-slate-900 dark:text-white">Đặt Sân Tự Động</h3>
                  <p className="text-slate-600 dark:text-gray-300 text-sm leading-relaxed font-sans">
                    Giữ chỗ sân yêu thích chỉ trong vài giây. Hệ thống lịch tự động kiểm tra tình trạng sân theo thời gian thực, đồng bộ ngay với thẻ hội viên và hỗ trợ mời bạn bè thách đấu dễ dàng.
                  </p>
                  <Link
                    to={PATHS.BOOKING}
                    className="inline-flex items-center gap-2 text-emerald-600 dark:text-primary font-bold hover:text-emerald-700 dark:hover:text-primary-dark transition-colors text-sm cursor-pointer font-label"
                  >
                    Lịch đặt sân trực quan
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 3: COMMUNITY (Sticks to screen) */}
          <section className="h-[200vh] relative w-full">
            <div className="sticky top-0 h-screen flex items-center px-4 max-w-5xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center w-full">
                <div data-aos="fade-right" data-aos-delay="200" className="glass-panel p-8 rounded-3xl border border-slate-200/60 dark:border-white/10 space-y-6 shadow-2xl order-2 md:order-1">
                  <Trophy className="h-10 w-10 text-emerald-600 dark:text-primary" />
                  <h3 className="text-2xl font-bold font-display text-slate-900 dark:text-white">Giải Đấu Sôi Động</h3>
                  <p className="text-slate-600 dark:text-gray-300 text-sm leading-relaxed font-sans">
                    Thử sức cú smash của bạn trước những tay vợt hàng đầu khu vực. Hệ thống xếp hạng ghép cặp theo trình độ, theo dõi tỷ lệ thắng/thua và trao thưởng trang bị chuyên nghiệp cho các vị trí đầu bảng.
                  </p>
                  <Link
                    to={PATHS.MEMBERS}
                    className="inline-flex items-center gap-2 text-emerald-600 dark:text-primary font-bold hover:text-emerald-700 dark:hover:text-primary-dark transition-colors text-sm cursor-pointer font-label"
                  >
                    Tham gia bảng xếp hạng
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                <div className="order-1 md:order-2 space-y-6">
                  <span data-aos="fade-left" className="text-emerald-600 dark:text-primary font-bold text-sm tracking-widest uppercase font-label drop-shadow-md">02 / Cộng Đồng</span>
                  <h2 data-aos="fade-up" data-aos-delay="100" className="text-4xl sm:text-5xl font-extrabold font-display leading-tight text-slate-900 dark:text-white drop-shadow-lg">
                    Chinh Phục <br />
                    <span className="text-gradient-primary italic">Bảng Xếp Hạng</span>
                  </h2>
                  <p data-aos="fade-up" data-aos-delay="200" className="text-slate-700 dark:text-gray-200 leading-relaxed text-base sm:text-lg font-sans drop-shadow-md">
                    Tham gia giải đấu, ghép cặp với đối thủ cùng trình độ và luyện tập cùng các huấn luyện viên quốc gia. Gói hội viên mang đến quyền truy cập cao nhất vào hệ thống sân đấu chuyên nghiệp.
                  </p>
                  <div data-aos="fade-up" data-aos-delay="300" className="flex gap-6 pt-4 text-left font-label">
                    <div>
                      <h4 className="text-3xl font-black text-gradient-primary font-display drop-shadow-md">1.2K+</h4>
                      <p className="text-xs text-slate-500 dark:text-gray-300 uppercase tracking-wider">Hội viên</p>
                    </div>
                    <div>
                      <h4 className="text-3xl font-black text-slate-900 dark:text-white font-display drop-shadow-md">12</h4>
                      <p className="text-xs text-slate-500 dark:text-gray-300 uppercase tracking-wider">Sân chuyên nghiệp</p>
                    </div>
                    <div>
                      <h4 className="text-3xl font-black text-gradient-primary font-display drop-shadow-md">98%</h4>
                      <p className="text-xs text-slate-500 dark:text-gray-300 uppercase tracking-wider">Ghép cặp thành công</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 4: CALL TO ACTION (Sticks to screen) */}
          <section className="h-[100vh] relative w-full">
            <div className="sticky top-0 h-screen flex flex-col justify-center items-center px-4 max-w-5xl mx-auto text-center">
              <div data-aos="zoom-in" className="glass-panel p-8 sm:p-16 rounded-[2.5rem] border border-slate-200/60 dark:border-white/10 space-y-8 max-w-3xl relative overflow-hidden shadow-2xl">
                <div className="absolute -top-24 -left-24 h-48 w-48 bg-primary/20 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
                <div className="absolute -bottom-24 -right-24 h-48 w-48 bg-secondary/20 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />

                <div className="relative space-y-6">
                  <span data-aos="fade-down" data-aos-delay="100" className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold tracking-wider text-emerald-600 dark:text-primary bg-emerald-100 dark:bg-primary/10 border border-emerald-200 dark:border-primary/20 uppercase font-label">
                    Bắt đầu ngay
                  </span>
                  <h2 data-aos="fade-up" data-aos-delay="200" className="text-3xl sm:text-5xl font-extrabold font-display tracking-tight text-slate-900 dark:text-white leading-tight">
                    Sẵn Sàng <br />
                    Chinh Phục Sân Đấu?
                  </h2>
                  <p data-aos="fade-up" data-aos-delay="300" className="text-slate-600 dark:text-gray-300 text-sm sm:text-base max-w-lg mx-auto leading-relaxed font-sans">
                    Tham gia SmashHub ngay hôm nay để đặt sân tự động, sắm trang bị chuyên nghiệp tại cửa hàng Pro Shop và thử sức trên bảng xếp hạng.
                  </p>

                  <div data-aos="fade-up" data-aos-delay="400" className="flex flex-wrap justify-center gap-4 pt-4 font-label">
                    <Link
                      to={PATHS.BOOKING}
                      className="px-8 py-4 rounded-full font-bold bg-emerald-500 hover:bg-emerald-600 dark:bg-primary dark:hover:bg-primary-dark text-[#052e14] transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg shadow-emerald-500/20 cursor-pointer"
                    >
                      Đặt Sân Đầu Tiên
                    </Link>
                    <Link
                      to={PATHS.SHOP}
                      className="px-8 py-4 rounded-full font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white border border-slate-200 dark:border-white/10 transition-all duration-300 cursor-pointer"
                    >
                      Xem Trang Bị Pro
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </main>

        {/* ---------------- PREMIUM SECTION ---------------- */}
        <PremiumSection />

        {/* ---------------- COLLECTIONS SECTION ---------------- */}
        <CollectionsSection />

        {/* ---------------- CONTACT SECTION ---------------- */}
        <ContactSection />

        {/* ---------------- FOOTER ---------------- */}
        <footer className="relative z-10 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0b0f19] py-12 font-label transition-colors duration-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="bg-emerald-500/10 dark:bg-primary/10 p-2 rounded-lg border border-emerald-500/20 dark:border-primary/20">
                <Flame className="h-5 w-5 text-emerald-600 dark:text-primary" />
              </div>
              <span className="text-lg font-bold font-display text-gradient-primary">
                SMASH<span className="text-slate-900 dark:text-white">HUB</span>
              </span>
            </div>
            <div className="text-slate-500 dark:text-gray-500 text-xs sm:text-sm text-center md:text-left">
              © {new Date().getFullYear()} SmashHub. Mọi quyền được bảo lưu.
            </div>
            <div className="flex gap-6 text-xs sm:text-sm text-slate-500 dark:text-gray-400">
              <a href="#privacy" className="hover:text-emerald-500 dark:hover:text-primary transition-colors">Chính sách bảo mật</a>
              <a href="#terms" className="hover:text-emerald-500 dark:hover:text-primary transition-colors">Điều khoản sử dụng</a>
              <a href="#support" className="hover:text-emerald-500 dark:hover:text-primary transition-colors">Hỗ trợ</a>
            </div>
          </div>
        </footer>

      </div>

      {/* ---------------- FLOATING THEME SWITCHER (BOTTOM-LEFT) ---------------- */}
      <div className="fixed bottom-6 left-6 z-[99] select-none">
        <button
          onClick={toggleTheme}
          className="group relative flex h-14 w-14 items-center justify-center rounded-full glass-panel border border-emerald-500/30 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer"
          aria-label="Chuyển đổi giao diện"
        >
          {/* Subtle Outer Glow */}
          <div className="absolute inset-0 rounded-full bg-emerald-500/15 dark:bg-primary/20 opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-300 pointer-events-none" />

          <div className="relative h-6 w-6 overflow-hidden flex items-center justify-center">
            {theme === 'dark' ? (
              <Sun className="h-6 w-6 text-amber-400 transform rotate-0 scale-100 transition-all duration-500 group-hover:rotate-45" />
            ) : (
              <Moon className="h-6 w-6 text-emerald-600 dark:text-emerald-400 transform rotate-0 scale-100 transition-all duration-500 group-hover:-rotate-12" />
            )}
          </div>
        </button>
      </div>
    </>
  );
}
