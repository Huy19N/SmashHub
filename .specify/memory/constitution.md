<!--
SYNC IMPACT REPORT
Version: 1.0.0 -> 1.1.0
Modified Principles:
  - Added: VI. UI/Design Standard
Added Sections: N/A
Removed Sections: N/A
Templates Requiring Updates:
  - No templates require structural changes for this update.
Follow-up TODOs: N/A
-->

# SmashClub Constitution

## Core Principles

### I. No Hardcoding
Mọi dữ liệu (URL API, cấu hình, text hiển thị quan trọng, secrets) bắt buộc phải được truyền qua biến môi trường, file cấu hình (config), hoặc fetch trực tiếp từ Backend. Không bao giờ được mã hóa cứng (hardcode) vào source code.

### II. Clean Code & Architecture Compliance
Mã nguồn phải rõ ràng, dễ đọc, và chia nhỏ component hợp lý. Đặt tên biến/hàm tuân thủ chuẩn của ngôn ngữ (camelCase cho JS/Dart, PascalCase cho C#). Xóa toàn bộ code rác và console.log khi hoàn thiện. Đặc biệt:
- **Website**: Bắt buộc tuân thủ Feature-Sliced Design (FSD) cơ bản.
- **Android App**: Bắt buộc tuân thủ Clean Architecture kết hợp Feature-Based (data, domain, presentation).

### III. Backend Immutability
Tuyệt đối không được tự ý sửa đổi mã nguồn C#, controllers, hay cấu trúc cơ sở dữ liệu của backend (`BESmashClub`) trừ khi được người dùng cấp phép và yêu cầu rõ ràng.

### IV. No Code Hallucination (Không Bịa Code)
Mọi xử lý logic, imports, và gọi hàm phải dựa trên các file thực tế đang tồn tại trong hệ thống. Không được giả định, tự sáng tác đường dẫn, hoặc bịa ra các hàm chưa từng được định nghĩa.

### V. Strict Tooling Adherence
Agent phải phân tích kỹ mục đích trước khi gọi bất cứ công cụ (tool) nào. Bắt buộc ưu tiên sử dụng tool chuyên biệt (như `view_file`, `grep_search`, `write_to_file`) trước khi cân nhắc dùng lệnh shell chung chung. Luôn dùng đúng tool cho các phiên thực thi phù hợp.

### VI. UI/Design Standard
Mọi thay đổi giao diện trên Website (React + Vite) bắt buộc phải tuân theo rule trong `.agents/skills/design-taste-frontend/SKILL.md`, tránh các pattern generic/AI-slop (như gradient tím mặc định, layout 3-card đều nhau, v.v). 
- **Ngoại lệ bắt buộc (Protected Asset):** Hiệu ứng scroll-triggered video ở trang chủ (Hero section) là tài sản được bảo vệ, KHÔNG được audit, thay đổi, đơn giản hóa, hoặc gỡ bỏ khi chạy Redesign protocol hoặc bất kỳ thao tác design nào — trừ khi người dùng yêu cầu trực tiếp và rõ ràng bằng tên. Trước khi sửa bất cứ file nào ở khu vực Hero/trang chủ, agent phải xác định chính xác component chứa hiệu ứng này và giữ nguyên logic scroll/video, chỉ được điều chỉnh phần styling xung quanh nếu được yêu cầu.

## Architecture Constraints

Dự án SmashClub chia làm 3 phân hệ chính:
1. **BESmashClub (Backend):** C# .NET API.
2. **Website (Frontend):** React + Vite.
3. **AndroidApp (Mobile):** Flutter.

Mọi Agent hoạt động trên repository này phải quét và phân tích kiến trúc thư mục tương ứng trước khi đưa ra thay đổi. Mọi thay đổi qua lại giữa Frontend và Backend phải đảm bảo tính đồng bộ API (DTOs).

## Governance

Tài liệu Constitution này là luật tối thượng đối với mọi Agent hoạt động trong repository SmashClub. Bất cứ thay đổi nào vi phạm các nguyên tắc trên đều sẽ bị từ chối.
- **Quy trình Sửa đổi (Amendments):** Phải được thực hiện thông qua skill `speckit-constitution`.
- **Cập nhật Phiên bản (Versioning):** Tăng MAJOR nếu phá vỡ rule cũ, tăng MINOR nếu thêm rule mới, tăng PATCH nếu chỉ sửa lỗi chính tả.

**Version**: 1.1.0 | **Ratified**: 2026-07-04 | **Last Amended**: 2026-07-05
