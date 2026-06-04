import { Send } from 'lucide-react';
import bannerBg from '../../../assets/smashclub_banner.png';
import founderTeamImg from '../../../assets/founder_team.jpg';

export default function ContactSection() {
  return (
    <section id="contact-section" className="relative w-full bg-[#0b0f19] pt-24 pb-24 z-20 font-sans overflow-hidden">
      {/* Background Image Container with Gradient Fade */}
      <div className="absolute top-0 left-0 w-full h-[500px]">
        <div className="absolute inset-0 bg-black/60 z-10" />
        <img src={bannerBg} alt="SmashClub Banner" className="w-full h-full object-cover object-top opacity-80" />
        <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-[#0b0f19] to-transparent z-10" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 mt-12">
        <div className="rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row border border-white/5">
          {/* Left side: Form */}
          <div className="w-full md:w-[60%] p-10 md:p-14 bg-[#111722]">
            <div className="mb-10">
              <h4 className="text-primary font-black text-xs tracking-widest uppercase mb-3 font-label">Liên hệ với chúng tôi</h4>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4 tracking-tight">Hãy liên hệ với chúng tôi</h2>
              <p className="text-gray-400 text-sm leading-relaxed max-w-md">
                Bạn có thắc mắc về giải đấu sắp tới hoặc tư cách thành viên? Hãy gửi cho chúng tôi và nhóm của chúng tôi sẽ liên hệ lại với bạn sớm nhất.
              </p>
            </div>

            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white tracking-widest uppercase font-label">Họ tên</label>
                  <input
                    type="text"
                    placeholder="Smashclub"
                    className="w-full bg-[#1a2130] border border-transparent rounded-lg px-4 py-3.5 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-colors text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white tracking-widest uppercase font-label">Địa chỉ Email</label>
                  <input
                    type="email"
                    placeholder="....@gmail.com"
                    className="w-full bg-[#1a2130] border border-transparent rounded-lg px-4 py-3.5 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-colors text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-white tracking-widest uppercase font-label">Tiêu đề</label>
                <input
                  type="text"
                  placeholder="Đăng ký giải đấu"
                  className="w-full bg-[#1a2130] border border-transparent rounded-lg px-4 py-3.5 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-colors text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-white tracking-widest uppercase font-label">Nội dung</label>
                <textarea
                  rows="5"
                  placeholder="Chúng tôi có thể giúp gì cho bạn?"
                  className="w-full bg-[#1a2130] border border-transparent rounded-lg px-4 py-3.5 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-colors text-sm resize-none"
                ></textarea>
              </div>

              <button
                type="button"
                className="bg-primary hover:bg-primary-dark text-[#052e14] font-bold py-3.5 px-6 rounded-lg transition-colors duration-300 flex items-center gap-2 mt-2 text-sm shadow-[0_0_20px_rgba(34,197,94,0.2)] hover:shadow-[0_0_25px_rgba(34,197,94,0.4)] font-label"
              >
                Gửi tin nhắn <Send className="h-4 w-4" />
              </button>
            </form>
          </div>

          {/* Right side: Image Panel */}
          <div className="w-full md:w-[40%] hidden md:block relative bg-[#1a2130]">
            <img
              src={founderTeamImg}
              alt="SmashClub Founder Team"
              className="absolute inset-0 w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity duration-500"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
