import { Send } from 'lucide-react';
import bannerBg from '../../../assets/smashhub_banner.png';
import founderTeamImg from '../../../assets/founder_team.jpg';

export default function ContactSection() {
  return (
    <section id="contact-section" className="relative w-full bg-white dark:bg-[#0b0f19] pt-32 pb-32 z-20 font-sans overflow-hidden transition-colors duration-500">
      {/* Background Image Container with Gradient Fade */}
      <div className="absolute top-0 left-0 w-full h-[500px]">
        <div className="absolute inset-0 bg-white/40 dark:bg-black/60 z-10 transition-colors duration-500" />
        <img src={bannerBg} alt="SmashHub Banner" className="w-full h-full object-cover object-top opacity-80" />
        <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-white dark:from-[#0b0f19] to-transparent z-10 transition-colors duration-500" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 mt-12">
        <div className="rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row border border-slate-200/60 dark:border-white/5">
          {/* Left side: Form */}
          <div className="w-full md:w-[60%] p-10 md:p-14 bg-slate-50/90 dark:bg-[#111722]/95 backdrop-blur-md transition-colors duration-500">
            <div className="mb-10">
              <h4 className="text-emerald-600 dark:text-primary font-black text-xs tracking-widest uppercase mb-3 font-label">Liên hệ với chúng tôi</h4>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-slate-900 dark:text-white mb-4 tracking-tight">Hãy liên hệ với chúng tôi</h2>
              <p className="text-slate-600 dark:text-gray-400 text-sm leading-relaxed max-w-md">
                Bạn có thắc mắc về giải đấu sắp tới hoặc tư cách thành viên? Hãy gửi cho chúng tôi và nhóm của chúng tôi sẽ liên hệ lại với bạn sớm nhất.
              </p>
            </div>

            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-800 dark:text-white tracking-widest uppercase font-label">Họ tên</label>
                  <input
                    type="text"
                    placeholder="Smashhub"
                    className="w-full bg-slate-100 dark:bg-[#1a2130] border border-slate-200 dark:border-transparent rounded-2xl px-4 py-3.5 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-emerald-500 dark:focus:border-primary/50 focus:ring-1 focus:ring-emerald-500 dark:focus:ring-primary/50 transition-all duration-300 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-800 dark:text-white tracking-widest uppercase font-label">Địa chỉ Email</label>
                  <input
                    type="email"
                    placeholder="....@gmail.com"
                    className="w-full bg-slate-100 dark:bg-[#1a2130] border border-slate-200 dark:border-transparent rounded-2xl px-4 py-3.5 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-emerald-500 dark:focus:border-primary/50 focus:ring-1 focus:ring-emerald-500 dark:focus:ring-primary/50 transition-all duration-300 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-800 dark:text-white tracking-widest uppercase font-label">Tiêu đề</label>
                <input
                  type="text"
                  placeholder="Đăng ký giải đấu"
                  className="w-full bg-slate-100 dark:bg-[#1a2130] border border-slate-200 dark:border-transparent rounded-2xl px-4 py-3.5 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-emerald-500 dark:focus:border-primary/50 focus:ring-1 focus:ring-emerald-500 dark:focus:ring-primary/50 transition-all duration-300 text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-800 dark:text-white tracking-widest uppercase font-label">Nội dung</label>
                <textarea
                  rows="5"
                  placeholder="Chúng tôi có thể giúp gì cho bạn?"
                  className="w-full bg-slate-100 dark:bg-[#1a2130] border border-slate-200 dark:border-transparent rounded-2xl px-4 py-3.5 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-emerald-500 dark:focus:border-primary/50 focus:ring-1 focus:ring-emerald-500 dark:focus:ring-primary/50 transition-all duration-300 text-sm resize-none"
                ></textarea>
              </div>

              <button
                type="button"
                className="bg-emerald-500 hover:bg-emerald-600 dark:bg-primary dark:hover:bg-primary-dark text-[#052e14] dark:text-white font-bold py-3.5 px-8 rounded-full transition-all duration-300 flex items-center gap-2 mt-2 text-sm shadow-[0_4px_20px_rgba(16,185,129,0.15)] hover:shadow-[0_4px_25px_rgba(16,185,129,0.3)] cursor-pointer hover:-translate-y-0.5 font-label"
              >
                Gửi tin nhắn <Send className="h-4 w-4" />
              </button>
            </form>
          </div>

          {/* Right side: Image Panel */}
          <div className="w-full md:w-[40%] hidden md:block relative bg-slate-100 dark:bg-[#1a2130] transition-colors duration-500">
            <img
              src={founderTeamImg}
              alt="SmashHub Founder Team"
              className="absolute inset-0 w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity duration-500"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
