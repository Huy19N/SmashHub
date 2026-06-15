export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pt-12">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold font-display text-white tracking-tight">
          Giới Thiệu <span className="text-primary">SmashHub</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Tìm hiểu về hành trình, cơ sở vật chất đẳng cấp thế giới và sứ mệnh nâng tầm trải nghiệm cầu lông của chúng tôi.
        </p>
      </div>
      <div className="glass-panel p-12 text-center border border-border-dark shadow-2xl rounded-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full" />
        <div className="h-16 w-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
          <span className="text-primary font-bold text-xl">GT</span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">Trang Giới Thiệu</h2>
        <p className="text-gray-400 max-w-md mx-auto">
          Trang giới thiệu đang được xây dựng và sẽ sớm ra mắt với đầy đủ thông tin về câu lạc bộ.
        </p>
      </div>
    </div>
  );
}
