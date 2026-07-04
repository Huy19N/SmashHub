import React, { useState, useEffect } from 'react';
import { ShieldAlert, Trash2, Ban, XCircle, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { getPendingReportsAPI, resolveReportAPI, dismissReportAPI } from '../api/admin.api';

const ReportManagement = () => {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const response = await getPendingReportsAPI({ pageIndex: 1, pageSize: 50 });
      if (response.isSuccess) {
        setReports(response.data?.items || []);
      }
    } catch (error) {
      toast.error('Lỗi khi tải danh sách báo cáo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResolve = async (reportId, action) => {
    try {
      const response = await resolveReportAPI(reportId, action);
      if (response.isSuccess) {
        toast.success('Đã xử lý báo cáo');
        setReports(reports.filter(r => r.id !== reportId));
      }
    } catch (error) {
      toast.error('Lỗi khi xử lý báo cáo');
    }
  };

  const handleDismiss = async (reportId) => {
    try {
      const response = await dismissReportAPI(reportId);
      if (response.isSuccess) {
        toast.success('Đã bỏ qua báo cáo');
        setReports(reports.filter(r => r.id !== reportId));
      }
    } catch (error) {
      toast.error('Lỗi khi bỏ qua báo cáo');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <ShieldAlert className="w-7 h-7 text-red-600" />
            Quản lý báo cáo vi phạm
          </h1>
          <p className="text-gray-500 mt-1">Xử lý các báo cáo từ cộng đồng về bài viết và bình luận vi phạm tiêu chuẩn</p>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center p-8 text-gray-500">
            Không có báo cáo vi phạm nào cần xử lý.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 border-b border-gray-100">
                  <th className="py-3 px-4 font-semibold text-sm">Loại</th>
                  <th className="py-3 px-4 font-semibold text-sm">Người báo cáo</th>
                  <th className="py-3 px-4 font-semibold text-sm">Lý do</th>
                  <th className="py-3 px-4 font-semibold text-sm">Thời gian</th>
                  <th className="py-3 px-4 font-semibold text-sm text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${report.targetType === 1 ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                        {report.targetType === 1 ? 'Bài viết' : 'Bình luận'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{report.reporterId?.substring(0, 8)}...</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="max-w-md">
                        <p className="text-sm text-gray-700 font-medium text-red-600">{report.reason}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {new Date(report.createdAt).toLocaleDateString('vi-VN', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleResolve(report.id, report.targetType === 1 ? 'delete_post' : 'delete_comment')}
                          className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="Xóa nội dung vi phạm"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDismiss(report.id)}
                          className="p-1.5 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Bỏ qua báo cáo"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportManagement;
