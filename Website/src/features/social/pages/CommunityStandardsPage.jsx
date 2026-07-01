import React from 'react';
import { ArrowLeft, Shield, AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CommunityStandardsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-indigo-600" />
            <h1 className="text-xl font-bold text-gray-900">Tiêu chuẩn cộng đồng</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <div className="prose max-w-none">
            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              SmashClub cam kết xây dựng một môi trường giao lưu, kết nối thể thao an toàn, lành mạnh và tôn trọng lẫn nhau. 
              Để duy trì điều này, chúng tôi yêu cầu tất cả thành viên tuân thủ các tiêu chuẩn cộng đồng dưới đây.
            </p>

            <div className="space-y-8">
              {/* Section 1 */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 m-0">Hành vi được khuyến khích</h2>
                </div>
                <ul className="space-y-3 pl-14 text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    Tôn trọng sự đa dạng và ý kiến của người khác.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    Chia sẻ thông tin thể thao hữu ích, trung thực và mang tính xây dựng.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    Hỗ trợ và khích lệ các thành viên khác trong cộng đồng.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    Báo cáo các nội dung vi phạm tiêu chuẩn cộng đồng để quản trị viên xử lý.
                  </li>
                </ul>
              </section>

              {/* Section 2 */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <XCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 m-0">Hành vi bị nghiêm cấm</h2>
                </div>
                <ul className="space-y-3 pl-14 text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    Sử dụng ngôn từ tục tĩu, chửi thề, hoặc có tính chất thù ghét (Hệ thống sẽ tự động chặn các bài đăng có chứa từ khóa vi phạm).
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    Quấy rối, đe dọa, hoặc xúc phạm cá nhân/tổ chức khác.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    Đăng tải nội dung đồi trụy, bạo lực, hoặc vi phạm pháp luật.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    Spam, lừa đảo, hoặc quảng cáo sai sự thật.
                  </li>
                </ul>
              </section>

              {/* Section 3 */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 m-0">Biện pháp xử lý vi phạm</h2>
                </div>
                <div className="pl-14 text-gray-600 space-y-4">
                  <p>
                    Tùy thuộc vào mức độ vi phạm, Ban Quản Trị có quyền áp dụng các biện pháp xử lý sau:
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-500 mt-1">1.</span>
                      <strong>Tự động từ chối bài đăng:</strong> Hệ thống AI của chúng tôi sẽ tự động từ chối các bài đăng chứa ngôn từ không phù hợp.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-500 mt-1">2.</span>
                      <strong>Gỡ bỏ nội dung:</strong> Xóa bài viết hoặc bình luận vi phạm mà không cần báo trước.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-500 mt-1">3.</span>
                      <strong>Đình chỉ tài khoản:</strong> Cấm tài khoản có thời hạn (7 ngày, 30 ngày) hoặc vĩnh viễn đối với các trường hợp vi phạm nghiêm trọng hoặc tái phạm nhiều lần.
                    </li>
                  </ul>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityStandardsPage;
