import { useState } from 'react';
import {
  MessageSquare,
  Star,
  Search,
  Filter,
  ThumbsUp,
  Building2,
  Calendar,
  ShieldCheck
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function FeedbackManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRating, setSelectedRating] = useState('all');

  // Hardcoded 25 rich feedback items
  const initialFeedbacks = [
    {
      id: 1,
      customerName: 'Nguyễn Văn Hùng',
      customerEmail: 'hung.nguyen@gmail.com',
      avatar: 'NH',
      facilityName: 'SmashHub Badminton Center - Tân Bình',
      rating: 5,
      comment: 'Sân có hệ thống ánh sáng cực kỳ tốt, không bị chói mắt khi đánh những quả cầu cao sâu. Thảm sân đạt tiêu chuẩn thi đấu BWF rất êm.',
      date: '2026-07-22 19:30',
      status: 'Đã duyệt',
      isFeatured: true
    },
    {
      id: 2,
      customerName: 'Trần Thị Mai',
      customerEmail: 'mai.tran@gmail.com',
      avatar: 'TM',
      facilityName: 'SmashHub Arena - Quận 7',
      rating: 5,
      comment: 'Nhân viên phục vụ chu đáo, nhiệt tình. Nước uống và phòng thay đồ rất sạch sẽ, thoáng mát.',
      date: '2026-07-22 18:15',
      status: 'Đã duyệt',
      isFeatured: true
    },
    {
      id: 3,
      customerName: 'Lê Minh Trí',
      customerEmail: 'tri.le@gmail.com',
      avatar: 'LT',
      facilityName: 'SmashHub Club - Bình Thạnh',
      rating: 5,
      comment: 'Sân sạch đẹp, bãi đỗ xe rộng rãi đậu được cả xe ô tô và xe máy an toàn. Đặt sân trên web thao tác nhanh chưa tới 30 giây!',
      date: '2026-07-21 20:45',
      status: 'Đã duyệt',
      isFeatured: true
    },
    {
      id: 4,
      customerName: 'Phạm Hoàng Nam',
      customerEmail: 'nam.pham@gmail.com',
      avatar: 'PN',
      facilityName: 'SmashHub Badminton Center - Tân Bình',
      rating: 4,
      comment: 'Dịch vụ căng vợt ngay tại sân rất nhanh chóng và chuẩn số kg. Sẽ tiếp tục quay lại tập luyện.',
      date: '2026-07-21 16:20',
      status: 'Đã duyệt',
      isFeatured: false
    },
    {
      id: 5,
      customerName: 'Đặng Thu Hà',
      customerEmail: 'ha.dang@gmail.com',
      avatar: 'DH',
      facilityName: 'SmashHub Arena - Quận 7',
      rating: 5,
      comment: 'Không gian thoáng mát, điều hòa quạt hút mùi hoạt động rất tốt nên không bị ngột ngạt dù đông người chơi.',
      date: '2026-07-20 21:10',
      status: 'Đã duyệt',
      isFeatured: true
    },
    {
      id: 6,
      customerName: 'Vũ Quốc Anh',
      customerEmail: 'anh.vu@gmail.com',
      avatar: 'VA',
      facilityName: 'SmashHub Club - Cầu Giấy',
      rating: 5,
      comment: 'Tính năng bắt kèo ghép đối thủ trên SmashHub cực kỳ xịn! Nhờ đó mà mình tìm được nhóm đánh vừa sức hằng tuần.',
      date: '2026-07-20 17:00',
      status: 'Đã duyệt',
      isFeatured: true
    },
    {
      id: 7,
      customerName: 'Bùi Thị Dung',
      customerEmail: 'dung.bui@gmail.com',
      avatar: 'BD',
      facilityName: 'SmashHub Badminton Center - Tân Bình',
      rating: 5,
      comment: 'Giá thuê sân hợp lý so với chất lượng dịch vụ cao cấp. Nút tải app tiện lợi, thông báo nhắc giờ đánh chuẩn xác.',
      date: '2026-07-19 19:15',
      status: 'Đã duyệt',
      isFeatured: false
    },
    {
      id: 8,
      customerName: 'Phan Tuấn Kiệt',
      customerEmail: 'kiet.phan@gmail.com',
      avatar: 'PK',
      facilityName: 'SmashHub Arena - Quận 7',
      rating: 4,
      comment: 'Sân đẹp, lưới căng đúng chuẩn thi đấu. Điểm cộng lớn là nhà vệ sinh sạch sẽ thơm tho.',
      date: '2026-07-19 15:40',
      status: 'Đã duyệt',
      isFeatured: false
    },
    {
      id: 9,
      customerName: 'Ngô Thanh Tùng',
      customerEmail: 'tung.ngo@gmail.com',
      avatar: 'NT',
      facilityName: 'SmashHub Club - Bình Thạnh',
      rating: 5,
      comment: 'Chủ sân và các bạn nhân viên lễ tân cực kỳ thân thiện. Hỗ trợ cho mượn mút cuốn cán khi mình quên mang đồ.',
      date: '2026-07-18 20:00',
      status: 'Đã duyệt',
      isFeatured: true
    },
    {
      id: 10,
      customerName: 'Đỗ Quỳnh Chi',
      customerEmail: 'chi.do@gmail.com',
      avatar: 'DC',
      facilityName: 'SmashHub Badminton Center - Tân Bình',
      rating: 5,
      comment: 'Đã mua gói Hội viên Premium và thấy cực kỳ hời. Ưu tiên giữ lịch giữ sân trước cả tuần.',
      date: '2026-07-18 14:30',
      status: 'Đã duyệt',
      isFeatured: true
    },
    {
      id: 11,
      customerName: 'Dương Văn Khoa',
      customerEmail: 'khoa.duong@gmail.com',
      avatar: 'DK',
      facilityName: 'SmashHub Arena - Quận 7',
      rating: 4,
      comment: 'Ánh sáng chống chói mắt xuất sắc, trần sân cao đúng tiêu chuẩn đánh cầu lông chuyên nghiệp.',
      date: '2026-07-17 18:50',
      status: 'Đã duyệt',
      isFeatured: false
    },
    {
      id: 12,
      customerName: 'Lý Bảo Ngọc',
      customerEmail: 'ngoc.ly@gmail.com',
      avatar: 'LN',
      facilityName: 'SmashHub Club - Cầu Giấy',
      rating: 5,
      comment: 'Thanh toán trực tuyến bằng VNPAY / Momo siêu mượt, nhận email xác nhận tức thì không cần đợi lâu.',
      date: '2026-07-17 11:20',
      status: 'Đã duyệt',
      isFeatured: false
    },
    {
      id: 13,
      customerName: 'Hồ Tấn Phát',
      customerEmail: 'phat.ho@gmail.com',
      avatar: 'HP',
      facilityName: 'SmashHub Club - Bình Thạnh',
      rating: 5,
      comment: 'Sân có bán sẵn cầu lông chất lượng cao giá tốt, nước bắp và nước tăng lực lạnh sẵn sàng cho anh em.',
      date: '2026-07-16 21:00',
      status: 'Đã duyệt',
      isFeatured: false
    },
    {
      id: 14,
      customerName: 'Võ Đức Tài',
      customerEmail: 'tai.vo@gmail.com',
      avatar: 'VT',
      facilityName: 'SmashHub Badminton Center - Tân Bình',
      rating: 5,
      comment: 'App SmashHub tải qua APKPure chạy rất mượt trên điện thoại Android của mình.',
      date: '2026-07-16 16:45',
      status: 'Đã duyệt',
      isFeatured: false
    },
    {
      id: 15,
      customerName: 'Trịnh Bảo Trâm',
      customerEmail: 'tram.trinh@gmail.com',
      avatar: 'TT',
      facilityName: 'SmashHub Arena - Quận 7',
      rating: 5,
      comment: 'Không gian thiết kế hiện đại sang trọng, góc check-in sống ảo cực đẹp cho các bạn trẻ.',
      date: '2026-07-15 19:10',
      status: 'Đã duyệt',
      isFeatured: true
    },
    {
      id: 16,
      customerName: 'Lương Tuấn Đạt',
      customerEmail: 'dat.luong@gmail.com',
      avatar: 'LD',
      facilityName: 'SmashHub Club - Cầu Giấy',
      rating: 4,
      comment: 'Hệ thống ghép đội thông minh giúp CLB mình tìm đối giao lưu hằng tuần không bị chán.',
      date: '2026-07-15 15:30',
      status: 'Đã duyệt',
      isFeatured: false
    },
    {
      id: 17,
      customerName: 'Mai Đức Chính',
      customerEmail: 'chinh.mai@gmail.com',
      avatar: 'MC',
      facilityName: 'SmashHub Club - Bình Thạnh',
      rating: 5,
      comment: 'Độ nảy thảm tiêu chuẩn, bước di chuyển cứu cầu cảm giác chắc chân không sợ lật cổ chân.',
      date: '2026-07-14 20:15',
      status: 'Đã duyệt',
      isFeatured: false
    },
    {
      id: 18,
      customerName: 'Cao Nhật Khánh',
      customerEmail: 'khanh.cao@gmail.com',
      avatar: 'CK',
      facilityName: 'SmashHub Badminton Center - Tân Bình',
      rating: 5,
      comment: 'Thái độ phục vụ của các bạn nhân viên cực kỳ lịch sự và chuyên nghiệp. 10/10 điểm!',
      date: '2026-07-14 17:40',
      status: 'Đã duyệt',
      isFeatured: true
    },
    {
      id: 19,
      customerName: 'Trần Cẩm Tú',
      customerEmail: 'tu.tran@gmail.com',
      avatar: 'TT',
      facilityName: 'SmashHub Arena - Quận 7',
      rating: 5,
      comment: 'Giá niêm yết rõ ràng minh bạch, không tăng giá vào cuối tuần hay giờ cao điểm.',
      date: '2026-07-13 18:20',
      status: 'Đã duyệt',
      isFeatured: false
    },
    {
      id: 20,
      customerName: 'Lê Huy Hoàng',
      customerEmail: 'hoang.le@gmail.com',
      avatar: 'LH',
      facilityName: 'SmashHub Club - Cầu Giấy',
      rating: 4,
      comment: 'Cảm ơn hệ thống SmashHub đã tạo sân chơi tuyệt vời cho cộng đồng cầu lông phong trào.',
      date: '2026-07-13 14:00',
      status: 'Đã duyệt',
      isFeatured: false
    },
    {
      id: 21,
      customerName: 'Phùng Bích Ngọc',
      customerEmail: 'ngoc.phung@gmail.com',
      avatar: 'PN',
      facilityName: 'SmashHub Club - Bình Thạnh',
      rating: 5,
      comment: 'Sân sạch bóng, ánh sáng đồng đều khắp 12 sân. Sẽ giới thiệu cho công ty đến đặt giải nội bộ.',
      date: '2026-07-12 19:50',
      status: 'Đã duyệt',
      isFeatured: false
    },
    {
      id: 22,
      customerName: 'Bùi Gia Khiêm',
      customerEmail: 'khiem.bui@gmail.com',
      avatar: 'BK',
      facilityName: 'SmashHub Badminton Center - Tân Bình',
      rating: 5,
      comment: 'Mặt thảm xanh êm ái, vạch sơn rõ nét dễ quan sát. Quét mã QR vào sân cực kỳ tiện lợi.',
      date: '2026-07-12 16:10',
      status: 'Đã duyệt',
      isFeatured: false
    },
    {
      id: 23,
      customerName: 'Nguyễn Thanh Hằng',
      customerEmail: 'hang.nguyen@gmail.com',
      avatar: 'NH',
      facilityName: 'SmashHub Arena - Quận 7',
      rating: 5,
      comment: 'Tủ gửi đồ cá nhân có khóa an toàn, phòng tắm vòi hoa sen nước nóng mát lạnh đầy đủ.',
      date: '2026-07-11 20:30',
      status: 'Đã duyệt',
      isFeatured: false
    },
    {
      id: 24,
      customerName: 'Đỗ Tiến Dũng',
      customerEmail: 'dung.do@gmail.com',
      avatar: 'DD',
      facilityName: 'SmashHub Club - Cầu Giấy',
      rating: 4,
      comment: 'Giao diện web trực quan dễ xem sân trống. Nhấn nút gọi hỗ trợ được phản hồi tức thì.',
      date: '2026-07-11 15:00',
      status: 'Đã duyệt',
      isFeatured: false
    },
    {
      id: 25,
      customerName: 'Phạm Minh Khang',
      customerEmail: 'khang.pham@gmail.com',
      avatar: 'PK',
      facilityName: 'SmashHub Club - Bình Thạnh',
      rating: 5,
      comment: 'Sân tập chất lượng vượt mong đợi. Bãi đậu xe rộng có bảo vệ coi trực 24/7 an tâm tuyệt đối.',
      date: '2026-07-10 18:00',
      status: 'Đã duyệt',
      isFeatured: true
    }
  ];

  const [feedbacks, setFeedbacks] = useState(initialFeedbacks);

  const toggleFeatured = (id) => {
    setFeedbacks(prev =>
      prev.map(f => {
        if (f.id === id) {
          const updated = !f.isFeatured;
          toast.success(updated ? 'Đã đánh dấu phản hồi nổi bật!' : 'Đã bỏ đánh dấu nổi bật.');
          return { ...f, isFeatured: updated };
        }
        return f;
      })
    );
  };

  const filteredFeedbacks = feedbacks.filter(f => {
    const matchesSearch =
      f.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.facilityName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRating =
      selectedRating === 'all' || f.rating === parseInt(selectedRating);

    return matchesSearch && matchesRating;
  });

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'text-amber-400 fill-amber-400'
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold font-display leading-tight dark:text-white flex items-center gap-2.5">
            <MessageSquare className="w-7 h-7 text-pink-500" />
            Quản Lý Phản Hồi Khách Hàng
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Xem danh sách đánh giá & góp ý từ người dùng sử dụng dịch vụ SmashHub.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-pink-500/10 border border-pink-500/20 rounded-xl text-pink-600 dark:text-pink-400 text-xs font-bold font-label">
          <ThumbsUp className="w-4 h-4" />
          <span>Tổng số: 25 phản hồi</span>
        </div>
      </div>

      {/* KPI Cards Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-panel border border-gray-100 dark:border-white/5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider font-label">Tổng phản hồi</span>
            <h3 className="text-2xl font-black font-display text-gray-900 dark:text-white mt-1">25</h3>
            <p className="text-[10px] text-emerald-500 font-bold font-label mt-0.5">100% Đã kiểm duyệt</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-pink-500/10 text-pink-500 border border-pink-500/20 flex items-center justify-center">
            <MessageSquare className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-gray-100 dark:border-white/5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider font-label">Đánh giá trung bình</span>
            <h3 className="text-2xl font-black font-display text-amber-500 mt-1 flex items-center gap-1.5">
              4.8 <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
            </h3>
            <p className="text-[10px] text-gray-400 font-label mt-0.5">Trên thang điểm 5 sao</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center">
            <Star className="w-6 h-6 fill-amber-500" />
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-gray-100 dark:border-white/5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider font-label">Tuyệt vời (5 ⭐)</span>
            <h3 className="text-2xl font-black font-display text-emerald-500 mt-1">20</h3>
            <p className="text-[10px] text-gray-400 font-label mt-0.5">Chiếm 80% tổng phản hồi</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center">
            <ThumbsUp className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-gray-100 dark:border-white/5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider font-label">Phản hồi Nổi bật</span>
            <h3 className="text-2xl font-black font-display text-blue-500 mt-1">8</h3>
            <p className="text-[10px] text-gray-400 font-label mt-0.5">Hiển thị trên Trang chủ</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-gray-100 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên khách, từ khóa, cơ sở..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 font-label"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-gray-400 shrink-0" />
          <select
            value={selectedRating}
            onChange={(e) => setSelectedRating(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 font-label cursor-pointer"
          >
            <option value="all" className="bg-slate-900 text-white">Tất cả số sao (All)</option>
            <option value="5" className="bg-slate-900 text-white">5 Sao (Tuyệt vời)</option>
            <option value="4" className="bg-slate-900 text-white">4 Sao (Tốt)</option>
          </select>
        </div>
      </div>

      {/* Feedback Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredFeedbacks.map((fb) => (
          <div
            key={fb.id}
            className={`glass-panel p-6 rounded-3xl border transition-all duration-300 relative flex flex-col justify-between ${
              fb.isFeatured
                ? 'border-emerald-500/30 dark:border-emerald-500/20 shadow-lg shadow-emerald-500/5'
                : 'border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md'
            }`}
          >
            {/* Header info */}
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-black text-sm flex items-center justify-center shadow-md shrink-0">
                    {fb.avatar}
                  </div>
                  <div>
                    <h4 className="text-base font-extrabold text-gray-900 dark:text-white font-display flex items-center gap-2">
                      {fb.customerName}
                      {fb.isFeatured && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold uppercase font-label">
                          Nổi bật
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-gray-400 font-label">{fb.customerEmail}</p>
                  </div>
                </div>

                {renderStars(fb.rating)}
              </div>

              {/* Facility name */}
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-primary mb-3 font-label">
                <Building2 className="w-3.5 h-3.5 shrink-0" />
                <span>{fb.facilityName}</span>
              </div>

              {/* Feedback comment body */}
              <p className="text-sm text-gray-700 dark:text-gray-300 font-sans leading-relaxed bg-gray-50/50 dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/5 italic">
                "{fb.comment}"
              </p>
            </div>

            {/* Footer metadata & actions */}
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100 dark:border-white/5 text-xs text-gray-400 font-label">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>{fb.date}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleFeatured(fb.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                    fb.isFeatured
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20'
                      : 'bg-gray-100 dark:bg-white/5 text-gray-500 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Star className={`w-3.5 h-3.5 ${fb.isFeatured ? 'fill-emerald-500' : ''}`} />
                  <span>{fb.isFeatured ? 'Đã ghim Nổi bật' : 'Ghim Nổi bật'}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredFeedbacks.length === 0 && (
        <div className="glass-panel p-12 rounded-3xl text-center border border-gray-100 dark:border-white/5">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-800 dark:text-white font-display">Không tìm thấy phản hồi phù hợp</h3>
          <p className="text-xs text-gray-500 mt-1 font-label">Thử thay đổi từ khóa hoặc bộ lọc số sao bên trên.</p>
        </div>
      )}
    </div>
  );
}
