import { Smartphone, Download, ShieldCheck, Zap, Bell, Users, ExternalLink, CheckCircle2 } from 'lucide-react';
import smartphoneImg from '../../../assets/phone.png';

export default function DownloadAppSection() {
  const downloadLink = "https://apkpure.com/vn/smashhub/com.knowhope.smashhub#google_vignette";

  const appFeatures = [
    {
      icon: Zap,
      title: 'Đặt sân siêu tốc 24/7',
      desc: 'Giữ chỗ sân cầu lông chỉ với 3 thao tác đơn giản trên điện thoại.'
    },
    {
      icon: Bell,
      title: 'Thông báo nhắc lịch tức thì',
      desc: 'Nhận thông báo push trước giờ thi đấu, không bao giờ bỏ lỡ trận cầu.'
    },
    {
      icon: Users,
      title: 'Ghép trận & Tìm đối thủ',
      desc: 'Kết nối nhanh với các vận động viên cùng trình độ gần bạn.'
    },
    {
      icon: ShieldCheck,
      title: 'Xác thực & An toàn',
      desc: 'Ứng dụng đã được kiểm duyệt an toàn 100% trên hệ thống APKPure.'
    }
  ];

  return (
    <section id="download-app-section" className="relative z-10 py-20 font-label select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Main Banner Card */}
        <div
          data-aos="zoom-in"
          className="glass-panel relative rounded-[2.5rem] border border-slate-200/60 dark:border-white/10 p-8 sm:p-12 lg:p-16 overflow-hidden shadow-2xl bg-gradient-to-br from-white/80 via-white/50 to-emerald-50/50 dark:from-[#0f172a]/90 dark:via-[#0b0f19]/90 dark:to-[#061e12]/80 backdrop-blur-2xl"
        >
          {/* Ambient Glowing Background Orbs */}
          <div className="absolute -top-32 -left-32 w-80 h-80 bg-emerald-500/20 dark:bg-primary/20 rounded-full blur-[100px] pointer-events-none animate-pulse-slow" />
          <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-teal-500/20 dark:bg-emerald-600/20 rounded-full blur-[100px] pointer-events-none animate-pulse-slow" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">

            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-8 text-left">

              {/* Top Badge */}
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-xs font-bold tracking-wider text-emerald-700 dark:text-primary bg-emerald-500/10 dark:bg-primary/10 border border-emerald-500/20 dark:border-primary/20 uppercase font-label">
                <Smartphone className="w-4 h-4 text-emerald-600 dark:text-primary" />
                <span>SmashHub Mobile App for Android</span>
              </div>

              {/* Heading */}
              <div className="space-y-4">
                <h2 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-slate-900 dark:text-white leading-tight">
                  Trải Nghiệm Đặt Sân <br />
                  <span className="text-gradient-primary italic font-bold">Mượt Mà Trên Di Động</span>
                </h2>
                <p className="text-slate-600 dark:text-gray-300 text-base sm:text-lg leading-relaxed max-w-2xl font-sans font-light">
                  Tải ngay ứng dụng <strong className="text-slate-800 dark:text-white font-semibold">SmashHub</strong> trên thiết bị Android để tìm sân, quản lý lịch đặt, nhận thông báo trận đấu và giao lưu cùng cộng đồng cầu lông mọi lúc, mọi nơi.
                </p>
              </div>

              {/* Features List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {appFeatures.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-2xl bg-white/40 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 backdrop-blur-sm">
                    <div className="p-2 rounded-xl bg-emerald-500/10 dark:bg-primary/10 text-emerald-600 dark:text-primary shrink-0">
                      <feat.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{feat.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5 leading-snug">{feat.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Download Buttons Section with APKPure branding */}
              <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">

                {/* Main Download Button */}
                <a
                  href={downloadLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-extrabold text-base text-[#052e14] dark:text-[#052e14] bg-emerald-500 hover:bg-emerald-400 dark:bg-primary dark:hover:bg-primary-dark transition-all duration-300 transform hover:-translate-y-1 shadow-xl shadow-emerald-500/25 dark:shadow-primary/25 cursor-pointer overflow-hidden active:scale-95"
                >
                  {/* Subtle shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />

                  <Download className="w-6 h-6 text-[#052e14] group-hover:scale-110 transition-transform duration-300" />

                  <div className="text-left flex flex-col">
                    <span className="text-[10px] uppercase font-bold opacity-80 leading-none tracking-wider">Tải APK Miễn Phí Trên</span>
                    <span className="text-lg font-black tracking-wide leading-tight">APKPure Store</span>
                  </div>

                  <ExternalLink className="w-4 h-4 ml-1 opacity-75 group-hover:opacity-100 transition-opacity" />
                </a>

                {/* APKPure Badge indicator */}
                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-emerald-500/5 dark:bg-white/5 border border-emerald-500/15 dark:border-white/10">
                  <div className="w-9 h-9 rounded-xl bg-[#24b47e] text-white flex items-center justify-center font-black text-sm shadow-md shrink-0">
                    APK
                  </div>
                  <div className="text-left text-xs font-sans">
                    <div className="font-bold text-slate-800 dark:text-gray-200 flex items-center gap-1">
                      <span>An toàn & Bảo mật</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    </div>
                    <div className="text-slate-500 dark:text-gray-400 text-[11px]">Phiên bản Android mới nhất</div>
                  </div>
                </div>

              </div>

            </div>

            {/* Right Column / Transparent Smartphone Image */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center relative my-auto">
              {/* Glowing Ambient Background Orb */}
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/30 via-teal-400/20 to-emerald-400/20 rounded-full blur-3xl transform scale-95 pointer-events-none" />

              <div className="relative z-10 w-full flex justify-center items-center">
                <img
                  src={smartphoneImg}
                  alt="SmashHub Mobile App"
                  className="w-full max-w-[360px] sm:max-w-[400px] lg:max-w-[440px] max-h-[560px] lg:max-h-[620px] object-contain drop-shadow-[0_20px_40px_rgba(11,232,96,0.3)] hover:scale-105 transition-transform duration-500 ease-out"
                />
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
