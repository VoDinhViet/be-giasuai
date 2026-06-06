# Thống kê cách sử dụng AI

## Mục đích

Tài liệu này gom lại các cách hệ thống Gia Sư AI dự kiến sử dụng AI trong sản phẩm, tách rõ ai dùng, dùng để làm gì, cần dữ liệu gì, tạo ra kết quả nào và hiện trạng backend.

Tính đến hiện tại, backend chưa có module gọi AI, chưa có provider/model config, chưa có conversation log và chưa có bảng `ai_generation_logs`. Các mục bên dưới là bản thống kê nghiệp vụ để triển khai sau.

## Tổng quan theo nhóm chức năng

| Nhóm | Người dùng chính | Mục tiêu | Trạng thái backend |
| --- | --- | --- | --- |
| Lộ trình học tập AI | Student, Teacher, Admin | Sinh và điều chỉnh lộ trình học tập cá nhân/lớp. | `planned` |
| AI Tutor | Student | Hỏi đáp học tập tổng quát hoặc theo ngữ cảnh bài học. | `planned` |
| AI tạo bài luyện tập | Student | Tạo bài tự luyện dựa trên điểm yếu và kết quả học. | `planned` |
| AI hỗ trợ giáo án | Teacher | Gợi ý giáo án, bài giảng, câu hỏi, bài tập. | `planned` |
| AI chấm điểm/giải thích | Student, Teacher, Admin | Chấm bài tự động và giải thích lỗi sai. | `planned` trong `assessments-grading` |
| AI gắn thẻ điểm yếu | Student, Teacher | Gắn weak tags từ bài làm và tiến độ học. | `planned` trong `learning-analytics` |
| Quản trị chi phí/log AI | Admin | Theo dõi lịch sử hội thoại, token, chi phí, provider/model. | `planned` trong `platform-admin` |
| Quota AI theo gói | Student, Teacher, Admin | Giới hạn số lần gọi AI theo package. | `planned-later` trong `service-packages` |

## Thống kê chi tiết

| Use case | Actor | Input cần có | Xử lý AI | Output trả về | Lưu DB/log | Module sở hữu |
| --- | --- | --- | --- | --- | --- | --- |
| Sinh lộ trình cá nhân sau test đầu vào | Student | Kết quả placement test, level, mục tiêu học, tiến độ hiện tại. | Tạo danh sách nội dung nên học theo thứ tự ưu tiên. | Learning path cá nhân và lý do từng mục. | `learning_paths`, `learning_path_items`, `ai_generation_logs`. | `ai-personalization` |
| Sinh lộ trình theo lớp | Teacher | Lớp học, danh sách học viên, course trong lớp, mục tiêu lớp. | Tạo baseline path cho cả lớp. | Group learning path. | `learning_paths` owner type class/group. | `ai-personalization` |
| Điều chỉnh lộ trình cá nhân | Student | Path hiện tại, item muốn thêm/bỏ/đổi thứ tự, lý do. | Gợi ý tác động hoặc xác nhận thay đổi. | Path version mới. | Path version, audit reason. | `ai-personalization` |
| Teacher điều chỉnh lộ trình lớp | Teacher | Group path, lớp phụ trách, nội dung cần sửa. | Gợi ý điều chỉnh theo mục tiêu giảng dạy. | Group path version mới. | Path version, teacher action log. | `ai-personalization` |
| Khôi phục lộ trình mặc định | Admin | Path hiện tại, baseline generated path. | Không bắt buộc gọi AI; dùng snapshot đã lưu. | Path quay về baseline. | Baseline snapshot, admin audit. | `ai-personalization` |
| AI Tutor general | Student | Câu hỏi người học, lịch sử hội thoại ngắn. | Trả lời học tập tổng quát, không gắn với bài cụ thể. | Message trả lời. | Conversation summary, message metadata, generation log. | `ai-personalization` |
| AI Tutor theo bài học | Student | Câu hỏi, lesson/content id, nội dung bài học, tiến độ user. | Trả lời trong phạm vi bài học, không dùng nội dung ngoài context. | Message trả lời kèm trích ngữ cảnh nội bộ nếu cần. | Conversation, context reference, generation log. | `ai-personalization` |
| Tạo bài tự luyện theo điểm yếu | Student | Weak tags, level, lịch sử bài sai, content đang học. | Sinh câu hỏi/bài tập phù hợp điểm yếu. | Practice set cá nhân. | Generated practice, question refs, generation log. | `ai-personalization` |
| Gợi ý giáo án | Teacher | Chủ đề, lớp, course, mục tiêu buổi học, thời lượng. | Sinh outline giáo án và hoạt động dạy học. | Draft lesson plan. | Draft output, generation log. | `teacher-ai-tools` trong `ai-personalization` |
| Gợi ý câu hỏi/bài tập | Teacher | Nội dung bài học, mục tiêu, độ khó, dạng câu hỏi. | Sinh câu hỏi để giao bài/kiểm tra. | Draft questions. | Draft output, generation log. | `teacher-ai-tools` trong `ai-personalization` |
| Chấm điểm tự luận | Student, Teacher | Bài làm, rubric, đáp án mẫu nếu có. | Chấm điểm theo rubric và giải thích. | Score, feedback, lỗi sai. | Assessment result, grading audit, generation log. | `assessments-grading` |
| Giải thích lỗi sai | Student | Câu sai, đáp án của học sinh, đáp án đúng, lesson context. | Tạo giải thích ngắn gọn và gợi ý học lại. | Feedback cá nhân. | Feedback record, weak tag signal. | `assessments-grading` |
| Gắn weak tags | System, Teacher | Kết quả làm bài, feedback, content tags. | Phân loại điểm yếu theo chủ đề/kỹ năng. | Weak tags cập nhật. | Weak knowledge records. | `learning-analytics` |
| Thống kê chi phí AI | Admin | Generation logs, token input/output, provider, model. | Không bắt buộc gọi AI; aggregate logs. | Báo cáo chi phí/usage. | `ai_generation_logs`, daily aggregates. | `platform-admin` |
| Giới hạn quota AI | System | User package, feature code, period, usage count. | Không gọi AI nếu vượt quota. | Allow/deny AI request. | Quota usage. | `service-packages` |

## Luồng gọi AI chuẩn

1. Controller nhận request đã validate và đã qua RBAC.
2. Service kiểm tra owner/permission và quota nếu feature đã bật package.
3. Context builder lấy dữ liệu nội bộ cần thiết: user, class, course, lesson, assessment, weak tags.
4. AI orchestration service tạo prompt theo `purpose`, chọn provider/model từ config.
5. Gọi provider AI và normalize output về schema nội bộ.
6. Lưu output/domain record nếu cần: learning path, practice, feedback, draft.
7. Ghi `ai_generation_logs`: user, purpose, provider, model, token/cost metadata, context reference, output reference.
8. Trả DTO đã whitelist cho frontend.

## Dữ liệu tối thiểu cần thiết

| Data | Dùng cho | Trạng thái hiện tại |
| --- | --- | --- |
| Authenticated user, role, lock status | Tất cả luồng AI. | Đã có trong `identity-access`. |
| User profile | Cá nhân hóa output, avatar/hiển thị. | Đang có trong `user-profiles`. |
| Course/lesson content | Tutor theo bài, giáo án, bài luyện tập. | Đang in-progress theo course/class docs. |
| Assessment result | Lộ trình, weak tags, chấm điểm/giải thích. | `planned`. |
| Weak tags | Bài tự luyện và cảnh báo học tập. | `planned`. |
| AI generation log | Audit, chi phí, quota, debug output. | `planned`. |
| Package/quota | Giới hạn AI theo gói. | `planned-later`. |

## Nguyên tắc an toàn

- Không đưa password, token, session hash, OTP hoặc secret vào prompt.
- Prompt chỉ gồm context cần thiết cho `purpose`.
- Mọi output AI dùng trong học tập phải được lưu kèm `purpose`, model, context reference và output reference.
- Draft cho Teacher không tự động publish thành nội dung chính nếu chưa có bước duyệt.
- AI Tutor theo bài học không trả lời ngoài context nếu request yêu cầu bám sát lesson.
- Admin xem được chi phí/log tổng quan, nhưng không cần xem nội dung riêng tư đầy đủ nếu không có rule rõ.

## Thứ tự triển khai đề nghị

1. Tạo `ai-generation-logs` và AI orchestration service dùng chung.
2. Làm AI Tutor general vì ít phụ thuộc content model.
3. Làm AI Tutor theo lesson sau khi content/lesson ổn định.
4. Làm learning path cá nhân sau khi có placement/assessment result.
5. Làm bài tự luyện AI sau khi có weak tags.
6. Làm teacher AI tools khi course/class authoring ổn định.
7. Thêm platform admin aggregate chi phí/log.
8. Thêm quota theo package sau cùng.

## Trạng thái kết luận

AI hiện tại mới nằm ở mức kế hoạch sản phẩm và module plan. Backend đã có nền identity/profile để làm nền, nhưng chưa có lớp gọi provider AI, chưa có schema log, chưa có conversation history, chưa có learning path, chưa có AI practice và chưa có quota AI.
