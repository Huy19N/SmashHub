<!--
SYNC IMPACT REPORT
Version: 0.0.0 -> 1.0.0
Modified Principles:
  - Added: I. No Hardcoding
  - Added: II. Clean Code & Architecture Compliance
  - Added: III. Backend Immutability
  - Added: IV. No Code Hallucination
  - Added: V. Strict Tooling Adherence
Added Sections: 
  - Architecture Constraints
Removed Sections: N/A
Templates Requiring Updates:
  - .specify/templates/plan-template.md (⚠ pending)
  - .specify/templates/spec-template.md (⚠ pending)
  - .specify/templates/tasks-template.md (⚠ pending)
Follow-up TODOs: 
  - Update plan, spec, and tasks templates to explicitly reference the Backend Immutability rule.
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

**Version**: 1.0.0 | **Ratified**: 2026-07-04 | **Last Amended**: 2026-07-04
