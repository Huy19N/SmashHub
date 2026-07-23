import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: '0 VND',
    period: '/tháng',
    features: [
      'Truy cập các khung giờ giao lưu (số lượng có hạn)',
      'Truy cập diễn đàn cộng đồng cơ bản'
    ],
    buttonText: 'Tham gia Miễn Phí',
    isPopular: false
  },
  {
    name: 'Basic',
    price: '49k',
    currency: 'VND',
    period: '/tháng',
    features: [
      'Ưu tiên đặt sân (trước 48h)',
      '1 buổi tập nhóm/tháng',
      'Giảm giá 10% tại cửa hàng'
    ],
    buttonText: 'Chọn Gói Cơ Bản',
    isPopular: true
  },
  {
    name: 'Pro',
    price: '99k',
    currency: 'VND',
    period: '/tháng',
    features: [
      'Đặt sân không giới hạn (trước 1 tuần)',
      '4 buổi huấn luyện nhóm/tháng',
      'Giảm giá 20% tại cửa hàng',
      'Dịch vụ căng vợt miễn phí (1 lần/tháng)'
    ],
    buttonText: 'Chọn Gói Pro',
    isPopular: false
  }
];

export default function PremiumSection() {
  return (
    <section id="premium-section" className="relative w-full bg-white dark:bg-[#0b0f19] py-32 z-20 font-sans overflow-hidden transition-colors duration-500">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">

          <h2 className="text-4xl sm:text-6xl font-black text-gray-900 dark:text-white mb-6 font-display drop-shadow-sm tracking-tight">Gói Hội Viên</h2>
          <p className="text-slate-600 dark:text-gray-300 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed font-sans">
            Chọn gói hội viên phù hợp với đam mê và tần suất thi đấu của bạn. Mở khóa các đặc quyền cao cấp và gia nhập cộng đồng của chúng tôi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`relative glass-panel-hover rounded-3xl p-8 sm:p-10 flex flex-col h-full border border-slate-200/60 dark:border-white/10
                ${plan.isPopular ? 'border-2 border-emerald-500/50 dark:border-emerald-500/50 shadow-[0_20px_50px_-12px_rgba(16,185,129,0.2)] md:scale-105 z-10' : 'shadow-lg'}
              `}
            >
              {plan.isPopular && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-[#052e14] dark:text-white shadow-lg shadow-emerald-500/30 font-extrabold text-xs px-5 py-2 rounded-full uppercase tracking-widest whitespace-nowrap">
                  Phổ biến nhất
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-extrabold text-slate-900 dark:text-white tracking-tighter">{plan.price}</span>
                  {plan.currency && <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 ml-1">{plan.currency}</span>}
                  <span className="text-sm font-semibold text-slate-500 ml-1">{plan.period}</span>
                </div>
              </div>

              <div className="flex-1 space-y-5 mb-10 mt-4">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="mt-1 flex-shrink-0">
                      <div className="h-5 w-5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                        <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" strokeWidth={4} />
                      </div>
                    </div>
                    <span className="text-slate-700 dark:text-gray-300 text-sm leading-relaxed font-medium">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                className={`w-full font-extrabold py-4 px-4 rounded-full transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer text-sm tracking-wider uppercase
                  ${plan.isPopular
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-[#052e14] dark:text-white shadow-lg shadow-emerald-500/20'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white border border-slate-200 dark:border-white/10'
                  }
                `}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
