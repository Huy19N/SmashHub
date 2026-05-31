export default function CollectionsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pt-12">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold font-display text-white tracking-tight">
          Bộ Sưu Tập <span className="text-primary">Chuyên Nghiệp</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          Khám phá bộ sưu tập trang phục và dụng cụ thi đấu cầu lông cao cấp độc quyền từ SmashClub.
        </p>
      </div>
      <div className="glass-panel p-12 text-center border border-border-dark shadow-2xl rounded-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full" />
        <div className="h-16 w-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
          <span className="text-primary font-bold text-xl">BST</span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">Cổng Bộ Sưu Tập Đã Sẵn Sàng</h2>
        <p className="text-gray-400 max-w-md mx-auto">
          Danh mục sản phẩm, vợt thi đấu thế hệ mới và thời trang thể thao cao cấp đang được chuẩn bị để mang lại trải nghiệm mua sắm tuyệt vời nhất cho hội viên.
        </p>
      </div>
    </div>
  );
}
