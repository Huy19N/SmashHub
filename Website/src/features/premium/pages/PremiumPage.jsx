export default function PremiumPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pt-12">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold font-display text-white tracking-tight">
          SmashClub <span className="text-primary">Cao Cấp</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Mở khóa quyền truy cập sân VIP, phân tích nâng cao và ưu tiên đặt sân với các gói hội viên cao cấp của chúng tôi.
        </p>
      </div>
      <div className="glass-panel p-12 text-center border border-border-dark shadow-2xl rounded-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full" />
        <div className="h-16 w-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
          <span className="text-primary font-bold text-xl">CC</span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">Trang Hội Viên Cao Cấp</h2>
        <p className="text-gray-400 max-w-md mx-auto">
          Trang hội viên cao cấp đang được xây dựng với các gói dịch vụ đặc biệt dành cho bạn.
        </p>
      </div>
    </div>
  );
}
