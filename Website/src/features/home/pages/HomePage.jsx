import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Flame,
  ArrowDown,
  Shield,
  Trophy,
  Activity,
  ArrowRight
} from 'lucide-react';
import { PATHS } from '../../../routes/paths';
import SEOManager from '../../../components/seo/SEOManager';
import videoBg from '../../../assets/video_smash_club.mp4';

/**
 * HomePage
 * Optimized 60fps Scrollytelling implementation.
 */
export default function HomePage() {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingComplete, setLoadingComplete] = useState(false);
  const [showHomepage, setShowHomepage] = useState(false);

  const heroContentRef = useRef(null);
  const scrollIndicatorRef = useRef(null);

  const videoRef = useRef(null);
  const targetTime = useRef(0);
  const currentTime = useRef(0);
  const rafId = useRef(null);

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
            if (seekDelta > 0.03) {
              try {
                video.currentTime = currentTime.current;
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

      // Fade-in Hero Logic via direct DOM manipulation (no React re-render)
      const fadeStart = 100;
      const fadeEnd = 400;
      let opacity = 0;
      if (scrollY > fadeStart) {
        opacity = Math.min((scrollY - fadeStart) / (fadeEnd - fadeStart), 1);
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
          scrollIndicatorRef.current.style.opacity = roundedOpacity === 0 ? 1 : 0;
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
        description="Experience the thrill of SmashClub. Real-time cinematic video scroll synchronization highlights our premium courts."
      />

      {/* ---------------- PRELOADER ---------------- */}
      {!showHomepage && (
        <div
          className={`fixed inset-0 bg-[#0b0f19] z-[100] flex flex-col justify-between p-8 sm:p-12 select-none transition-all duration-800 cubic-bezier(0.16, 1, 0.3, 1)
            ${loadingComplete ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}
          `}
        >
          <div className="flex items-center justify-between text-xs tracking-[0.2em] font-semibold text-gray-500 font-label">
            <div>SMASHCLUB · EST. 2026</div>
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
      <div className="relative w-full text-white bg-transparent">

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

        {/* DARK SHADER */}
        {/* Changed to a semi-transparent gradient so the video is clearly visible to the bottom */}
        <div
          className="fixed inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70 z-[2] pointer-events-none"
          style={{ transform: 'translate3d(0,0,0)' }}
        />

        {/* ---------------- SCOLLYTELLING SECTIONS ---------------- */}
        <main className="relative z-10 w-full select-none pb-[20vh]">

          {/* SECTION 1: HERO (Sticks to screen) */}
          <section className="h-[200vh] relative w-full">
            <div className="sticky top-0 h-screen flex flex-col justify-center px-4 max-w-5xl mx-auto text-left">
              {/* Fade in wrapper so logo is unobstructed initially */}
              <div
                ref={heroContentRef}
                className="space-y-6 max-w-3xl"
                style={{ opacity: 0, pointerEvents: 'none', transition: 'opacity 0.1s ease-out' }}
              >
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wider text-primary bg-primary/10 border border-primary/20 uppercase font-label">
                  <Shield className="h-3.5 w-3.5 text-primary" />
                  State-of-the-Art Arenas
                </span>

                <h1 className="text-5xl sm:text-8xl font-black tracking-tighter leading-none font-display drop-shadow-2xl">
                  SMASH THE <br />
                  <span className="text-gradient-primary font-bold italic">LIMITS.</span>
                </h1>

                <p className="text-gray-200 text-lg sm:text-2xl font-light leading-relaxed max-w-2xl font-sans drop-shadow-md">
                  Experience badminton with cinema-grade scroll fluid kinetics. Premium anti-slip wood courts, automated booking, and professional lighting optimized for speed.
                </p>

                <div className="flex flex-wrap gap-4 pt-6 font-label">
                  <Link
                    to={PATHS.BOOKING}
                    className="px-8 py-4 rounded-lg font-bold bg-primary hover:bg-primary-dark text-[#052e14] transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg shadow-primary/20 cursor-pointer inline-flex items-center gap-2"
                  >
                    Reserve A Court
                    <ArrowRight className="h-5 w-5 text-[#052e14]" />
                  </Link>
                  <Link
                    to={PATHS.MEMBERS}
                    className="px-8 py-4 rounded-lg font-bold bg-transparent border border-white/40 hover:border-primary hover:text-primary text-white transition-all duration-300 cursor-pointer inline-block backdrop-blur-sm"
                  >
                    View Membership Perks
                  </Link>
                </div>
              </div>

              {/* Scroll Down Indicator */}
              <div
                ref={scrollIndicatorRef}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-400 animate-pulse font-label"
                style={{ opacity: 1, transition: 'opacity 0.15s ease-out' }}
              >
                <span className="text-xs font-semibold tracking-widest uppercase text-white drop-shadow-md">Scroll to Discover</span>
                <ArrowDown className="h-5 w-5 animate-bounce text-primary" />
              </div>
            </div>
          </section>

          {/* SECTION 2: ARENA (Sticks to screen) */}
          <section className="h-[200vh] relative w-full">
            <div className="sticky top-0 h-screen flex items-center px-4 max-w-5xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center w-full">
                <div className="space-y-6">
                  <span className="text-primary font-bold text-sm tracking-widest uppercase font-label drop-shadow-md">01 / The Arena</span>
                  <h2 className="text-4xl sm:text-5xl font-extrabold font-display leading-tight drop-shadow-lg">
                    Engineered For <br />
                    <span className="text-gradient-primary italic">Agility & Speed</span>
                  </h2>
                  <p className="text-gray-200 leading-relaxed text-base sm:text-lg font-sans drop-shadow-md">
                    Every court at SmashClub is equipped with professional anti-shock subfloor cushioning and Olympic standard PVC surfaces. The high-lux vertical LED arrays provide absolute visibility without blinding glares.
                  </p>
                  <div className="grid grid-cols-2 gap-4 pt-4 font-label">
                    <div className="bg-black/40 backdrop-blur-md p-4 rounded-lg flex items-start gap-3 border border-white/10">
                      <Activity className="h-5 w-5 text-secondary mt-0.5 shrink-0" />
                      <div>
                        <h4 className="font-bold text-white text-sm">Shock Absorption</h4>
                        <p className="text-xs text-gray-300">Dual elasticity core subfloor</p>
                      </div>
                    </div>
                    <div className="bg-black/40 backdrop-blur-md p-4 rounded-lg flex items-start gap-3 border border-white/10">
                      <Shield className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <div>
                        <h4 className="font-bold text-white text-sm">Anti-Slip Grip</h4>
                        <p className="text-xs text-gray-300">Traction level coefficient 0.58</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-black/50 backdrop-blur-xl p-8 rounded-2xl border border-white/10 space-y-6 shadow-2xl">
                  <div className="h-1 bg-gradient-to-r from-primary to-secondary rounded-full w-20" />
                  <h3 className="text-2xl font-bold font-display text-white">Automated Booking</h3>
                  <p className="text-gray-300 text-sm leading-relaxed font-sans">
                    Lock down your favorite court times in seconds. Our automated calendar checks court usage in real-time, instantly syncs with your digital pass, and allows hassle-free peer challenge invites.
                  </p>
                  <Link
                    to={PATHS.BOOKING}
                    className="inline-flex items-center gap-2 text-primary font-bold hover:text-primary-dark transition-colors text-sm cursor-pointer font-label"
                  >
                    Interactive Court Planner
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
                <div className="bg-black/50 backdrop-blur-xl p-8 rounded-2xl border border-white/10 space-y-6 shadow-2xl order-2 md:order-1">
                  <Trophy className="h-10 w-10 text-primary" />
                  <h3 className="text-2xl font-bold font-display text-white">Active Tournaments</h3>
                  <p className="text-gray-300 text-sm leading-relaxed font-sans">
                    Test your baseline smash against the region's top players. Our ladder system pairs you with compatible skill classes, tracks win-loss ratio, and rewards top club spots with pro equipment.
                  </p>
                  <Link
                    to={PATHS.MEMBERS}
                    className="inline-flex items-center gap-2 text-primary font-bold hover:text-primary-dark transition-colors text-sm cursor-pointer font-label"
                  >
                    Join SmashClub Ladder
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                <div className="order-1 md:order-2 space-y-6">
                  <span className="text-primary font-bold text-sm tracking-widest uppercase font-label drop-shadow-md">02 / Community</span>
                  <h2 className="text-4xl sm:text-5xl font-extrabold font-display leading-tight drop-shadow-lg">
                    Climb the Club <br />
                    <span className="text-gradient-primary italic">Leaderboard</span>
                  </h2>
                  <p className="text-gray-200 leading-relaxed text-base sm:text-lg font-sans drop-shadow-md">
                    Join leagues, match up with players in your exact rating class, and participate in training camps hosted by national champions. Our member subscriptions provide ultimate access to elite court systems.
                  </p>
                  <div className="flex gap-6 pt-4 text-left font-label">
                    <div>
                      <h4 className="text-3xl font-black text-gradient-primary font-display drop-shadow-md">1.2K+</h4>
                      <p className="text-xs text-gray-300 uppercase tracking-wider">Active Members</p>
                    </div>
                    <div>
                      <h4 className="text-3xl font-black text-white font-display drop-shadow-md">12</h4>
                      <p className="text-xs text-gray-300 uppercase tracking-wider">Professional Courts</p>
                    </div>
                    <div>
                      <h4 className="text-3xl font-black text-gradient-primary font-display drop-shadow-md">98%</h4>
                      <p className="text-xs text-gray-300 uppercase tracking-wider">Success Matches</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 4: CALL TO ACTION (Sticks to screen) */}
          <section className="h-[100vh] relative w-full">
            <div className="sticky top-0 h-screen flex flex-col justify-center items-center px-4 max-w-5xl mx-auto text-center">
              <div className="bg-black/60 backdrop-blur-xl p-8 sm:p-16 rounded-3xl border border-white/10 space-y-8 max-w-3xl relative overflow-hidden shadow-2xl">
                <div className="absolute -top-24 -left-24 h-48 w-48 bg-primary/20 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
                <div className="absolute -bottom-24 -right-24 h-48 w-48 bg-secondary/20 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />

                <div className="relative space-y-6">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider text-primary bg-primary/10 border border-primary/20 uppercase font-label">
                    Take the Leap
                  </span>
                  <h2 className="text-3xl sm:text-5xl font-extrabold font-display tracking-tight text-white leading-tight">
                    Ready to Own <br />
                    the Court?
                  </h2>
                  <p className="text-gray-300 text-sm sm:text-base max-w-lg mx-auto leading-relaxed font-sans">
                    Join SmashClub today to automate your scheduling, grab professional gear at our Pro Shop, and test your skills on the ladder. Fully indexed for peak speed.
                  </p>

                  <div className="flex flex-wrap justify-center gap-4 pt-4 font-label">
                    <Link
                      to={PATHS.BOOKING}
                      className="px-8 py-4 rounded-lg font-bold bg-primary hover:bg-primary-dark text-[#052e14] transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg shadow-primary/20 cursor-pointer"
                    >
                      Book Your First Court
                    </Link>
                    <Link
                      to={PATHS.SHOP}
                      className="px-8 py-4 rounded-lg font-bold bg-[#334155] border border-white/10 hover:bg-slate-600 text-white transition-all duration-300 cursor-pointer"
                    >
                      Browse Pro Gear
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </main>

        {/* ---------------- FOOTER ---------------- */}
        <footer className="relative z-10 border-t border-white/10 bg-[#0b0f19] py-12 font-label">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 p-2 rounded-lg border border-primary/20">
                <Flame className="h-5 w-5 text-primary" />
              </div>
              <span className="text-lg font-bold font-display text-gradient-primary">
                SMASH<span className="text-white">CLUB</span>
              </span>
            </div>
            <div className="text-gray-500 text-xs sm:text-sm text-center md:text-left">
              © {new Date().getFullYear()} SmashClub. All rights reserved. Immersive requestAnimationFrame video engine locked at 60fps.
            </div>
            <div className="flex gap-6 text-xs sm:text-sm text-gray-400">
              <a href="#privacy" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#terms" className="hover:text-primary transition-colors">Terms of Service</a>
              <a href="#support" className="hover:text-primary transition-colors">Support</a>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}
