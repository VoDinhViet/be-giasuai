# Cấu trúc tài liệu

## Mục đích

Tài liệu này quy định cách dùng các file Markdown trong dự án để tránh trùng lặp, tránh lệch thông tin và giúp AI agent/developer đọc đúng ngữ cảnh.

Hiện tại cách chia tài liệu của dự án là hợp lý: có tài liệu kiến trúc, luồng hệ thống, module spec, module plan và progress. Vấn đề chính không phải có nhiều file `.md`, mà là cần quy định rõ mỗi file chịu trách nhiệm cho loại thông tin nào.

## Nguyên tắc chung

- Mỗi thông tin quan trọng chỉ nên có một nguồn sự thật chính.
- File plan không thay thế file spec.
- File progress không thay thế file system flow.
- File module spec phải mô tả API/schema/rule đang tồn tại trong code hiện tại.
- File module plan phải mô tả ý tưởng, phạm vi và kế hoạch triển khai trong tương lai.
- Khi code thay đổi API module, cập nhật module spec tương ứng.
- Khi thay đổi luồng cross-module, cập nhật `docs/system-flow.md`.
- Khi thay đổi trạng thái hoàn thành/pending/blocker, cập nhật progress.
- Khi thêm file bổ sung như `usage.md`, cần ghi rõ file đó dùng để làm gì và không dùng để làm gì.

## Vai trò từng nhóm tài liệu

### `docs/architecture.md`

Dùng để mô tả kiến trúc tổng quan của backend.

Nên có:

- Tech stack.
- Module boundaries.
- Folder structure.
- Layer responsibilities.
- Database/API/Auth architecture tổng quan.

Không nên có:

- Trạng thái từng feature.
- Chi tiết endpoint từng module.
- Kế hoạch product chưa làm.

### `docs/system-flow.md`

Dùng để mô tả luồng nghiệp vụ cross-module đang tồn tại hoặc đang được backend hỗ trợ.

Nên có:

- Luồng đăng ký/đăng nhập/session.
- Luồng user profile.
- Luồng class/course nếu module đang tồn tại.
- Các constraint hiện tại.

Không nên có:

- Bảng status chi tiết từng task.
- API spec đầy đủ.
- Kế hoạch xa chưa có backend.

### `docs/module-specs/<module>.md`

Dùng làm sự thật cho API module hiện tại.

Nên có:

- Purpose module.
- Public API/endpoints.
- Request DTO/Response DTO.
- Permissions/RBAC.
- Business rules.
- Errors.
- Dependencies.
- Security rules.
- Verification commands.

Không nên có:

- Feature chưa có code.
- Ý tưởng product chưa triển khai.
- Progress table dài.

Quy tắc:

- Nếu module có code trong `src/api/<module>/`, nên có spec trong `docs/module-specs/<module>.md`.
- Nếu chưa có code, không tạo module spec trừ khi cần ghi contract đã chốt.
- Khi thay đổi endpoint/DTO/schema/permission/rule, phải cập nhật spec.

### `docs/module-progress.md`

Dùng làm dashboard trạng thái tổng thể của project.

Nên có:

- Module nào `done`, `in-progress`, `planned`, `planned-later`, `blocked`.
- Backend done nổi bật.
- Pending/blocker nổi bật.
- Verification gần nhất nếu có.

Không nên có:

- API spec chi tiết.
- Toàn bộ plan từng module.
- Nội dung trùng lặp dài với `module-plans/*/progress.md`.

Quy tắc:

- Giữ ngắn gọn.
- Nếu cần bảng chi tiết theo feature, đặt trong `docs/module-plans/<module>/progress.md`.

### `docs/module-plans/README.md`

Dùng để giải thích cách đọc module plans và mapping từ nguồn yêu cầu sang module.

Nên có:

- Nguồn chính của plan.
- Cách đọc folder module.
- Định nghĩa status.
- Thứ tự module.
- Mapping feature Excel -> module.

Không nên có:

- Spec API hiện tại.
- Chi tiết logic từng endpoint.

### `docs/module-plans/<module>/description.md`

Dùng để mô tả module ở mức nghiệp vụ.

Nên có:

- Mục đích module.
- Phạm vi chức năng.
- Vai trò người dùng.
- Ngoài phạm vi.

Không nên có:

- Endpoint chi tiết.
- SQL/schema chi tiết.
- Trạng thái task chi tiết.

### `docs/module-plans/<module>/plan.md`

Dùng để mô tả kế hoạch backend-ready cho module.

Nên có:

- Mục tiêu triển khai.
- API/module đề xuất.
- Data concept.
- RBAC.
- Verification cần có.

Không nên có:

- Nội dung khẳng định đã có code nếu chưa có bằng chứng.
- Response DTO chi tiết như module spec.

### `docs/module-plans/<module>/progress.md`

Dùng để theo dõi tiến độ chi tiết của module theo từng feature.

Nên có:

- Trạng thái tổng quan module.
- Bảng feature/status/evidence/next step.
- Bằng chứng rõ trong code/docs nếu status là `done` hoặc `in-progress`.
- Phụ thuộc/blocker.

Không nên có:

- Full endpoint spec.
- Luồng cross-module dài.

### `docs/module-plans/<module>/usage.md`

Dùng cho module cần thống kê cách sử dụng riêng, ví dụ AI usage.

Nên có:

- Các use case.
- Actor.
- Input/output.
- Data/log cần lưu.
- Module sở hữu.
- Nguyên tắc an toàn.
- Thứ tự triển khai đề nghị.

Không nên có:

- API spec bắt buộc nếu module chưa có code.
- Endpoint/DTO chi tiết thay cho `docs/module-specs/<module>.md`.
- Chi tiết provider secret/model key.

## Cấu trúc đề nghị

```text
docs/
  architecture.md
  system-flow.md
  module-progress.md
  documentation-structure.md
  module-specs/
    auth.md
    users.md
    files.md
    <module>.md
  module-plans/
    README.md
    <module>/
      description.md
      plan.md
      progress.md
      usage.md        # optional
  standards/
    naming-standards.md
    typescript-standards.md
    nestjs-standards.md
    api-standards.md
    database-standards.md
    testing-standards.md
```

## Vấn đề hiện tại cần lưu ý

### Trùng lặp nguồn sự thật

Dự án có nhiều nơi cùng có thể nói về trạng thái module:

- `docs/module-progress.md`
- `docs/module-plans/<module>/progress.md`
- `docs/module-specs/<module>.md`
- `docs/system-flow.md`

Nếu không chia vai trò rõ, các file này sẽ dễ lệch nhau.

Cách xử lý:

- `module-specs`: nói code/API hiện tại.
- `module-plans`: nói kế hoạch và tiến độ theo feature.
- `module-progress`: nói tổng quan ngắn gọn.
- `system-flow`: nói luồng nghiệp vụ cross-module.

### Plan và spec dễ bị lẫn

Nếu `plan.md` mô tả endpoint như đã tồn tại, AI agent có thể hiểu nhầm là code đã có.

Cách xử lý:

- Dùng từ `đề xuất`, `cần tạo`, `planned` trong plan.
- Dùng từ `endpoint`, `business rules`, `errors`, `permissions` trong spec khi code đã có.

### Progress cần evidence

Status `done` hoặc `in-progress` nên có bằng chứng.

Evidence tốt:

- Endpoint: `POST /auth/login`.
- File code: `src/api/auth/auth.service.ts`.
- Schema: `src/database/schemas/users.ts`.
- Test/build: `pnpm run build`, `pnpm test ...`.

Evidence kém:

- `Đã làm` nhưng không ghi file/API.
- `Gần xong` nhưng không có pending rõ.
- `Done` nhưng spec chưa cập nhật.

### Worktree dirty làm commit dễ sai

Khi repo có nhiều modified/untracked file, việc auto commit rất dễ đưa nhầm thay đổi vào commit.

Cách xử lý:

- Trước khi sửa, kiểm tra `git status --short`.
- Khi commit, stage đúng file liên quan.
- Không revert file không phải mình sửa.
- Sau mỗi feature, commit riêng theo scope.

## Quy tắc khi thêm module mới

1. Tạo `docs/module-plans/<module>/description.md` nếu module mới đến từ product plan.
2. Tạo `docs/module-plans/<module>/plan.md` để chia API/data/RBAC/verification.
3. Tạo `docs/module-plans/<module>/progress.md` để theo dõi tiến độ.
4. Khi bắt đầu code module trong `src/api/<module>/`, tạo `docs/module-specs/<module>.md`.
5. Khi module tạo flow ảnh hưởng module khác, cập nhật `docs/system-flow.md`.
6. Khi trạng thái tổng thể đổi, cập nhật `docs/module-progress.md`.

## Quy tắc khi sửa API module hiện có

1. Đọc `docs/module-specs/<module>.md` trước.
2. Sửa code theo request.
3. Cập nhật spec nếu endpoint/DTO/permission/rule/schema thay đổi.
4. Cập nhật progress nếu done/pending/blocker đổi.
5. Cập nhật system flow nếu thay đổi cross-module.
6. Chạy verification phù hợp.
7. Commit riêng scope.

## Kết luận

Cách chia Markdown hiện tại đúng hướng. Cần cải thiện bằng cách gắn vai trò rõ cho từng file và giảm trùng lặp. Mục tiêu là khi AI agent hoặc developer đọc docs, họ phải biết file nào là spec hiện tại, file nào là kế hoạch, file nào là progress và file nào là luồng hệ thống.
