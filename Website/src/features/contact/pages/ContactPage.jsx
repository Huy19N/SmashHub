export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pt-12">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold font-display text-white tracking-tight">
          Liên <span className="text-primary">Hệ</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Bạn có câu hỏi hoặc cần hỗ trợ? Liên hệ đội ngũ chăm sóc khách hàng của chúng tôi, chúng tôi sẽ phản hồi sớm nhất.
        </p>
      </div>
      <div className="glass-panel p-12 text-center border border-border-dark shadow-2xl rounded-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full" />
        <div className="h-16 w-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
          <span className="text-primary font-bold text-xl">LH</span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">Trang Liên Hệ</h2>
        <p className="text-gray-400 max-w-md mx-auto">
          Trang liên hệ đang được xây dựng và sẽ sớm ra mắt với form liên hệ và thông tin hỗ trợ.
        </p>
      </div>
    </div>
  );
}
