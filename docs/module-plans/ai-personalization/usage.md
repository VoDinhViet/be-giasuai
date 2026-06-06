# Thong ke cach su dung AI

## Muc dich

Tai lieu nay gom lai cac cach he thong Gia Su AI du kien su dung AI trong san pham, tach ro ai dung, dung de lam gi, can du lieu gi, tao ra ket qua nao va hien trang backend.

Tinh den hien tai, backend chua co module goi AI, chua co provider/model config, chua co conversation log va chua co bang `ai_generation_logs`. Cac muc ben duoi la ban thong ke nghiep vu de trien khai sau.

## Tong quan theo nhom chuc nang

| Nhom | Nguoi dung chinh | Muc tieu | Trang thai backend |
| --- | --- | --- | --- |
| Lo trinh hoc tap AI | Student, Teacher, Admin | Sinh va dieu chinh lo trinh hoc tap ca nhan/lop. | `planned` |
| AI Tutor | Student | Hoi dap hoc tap tong quat hoac theo ngu canh bai hoc. | `planned` |
| AI tao bai luyen tap | Student | Tao bai tu luyen dua tren diem yeu va ket qua hoc. | `planned` |
| AI ho tro giao an | Teacher | Goi y giao an, bai giang, cau hoi, bai tap. | `planned` |
| AI cham diem/giai thich | Student, Teacher, Admin | Cham bai tu dong va giai thich loi sai. | `planned` trong `assessments-grading` |
| AI gan the diem yeu | Student, Teacher | Gan weak tags tu bai lam va tien do hoc. | `planned` trong `learning-analytics` |
| Quan tri chi phi/log AI | Admin | Theo doi lich su hoi thoai, token, chi phi, provider/model. | `planned` trong `platform-admin` |
| Quota AI theo goi | Student, Teacher, Admin | Gioi han so lan goi AI theo package. | `planned-later` trong `service-packages` |

## Thong ke chi tiet

| Use case | Actor | Input can co | Xu ly AI | Output tra ve | Luu DB/log | Module so huu |
| --- | --- | --- | --- | --- | --- | --- |
| Sinh lo trinh ca nhan sau test dau vao | Student | Ket qua placement test, level, muc tieu hoc, tien do hien tai. | Tao danh sach noi dung nen hoc theo thu tu uu tien. | Learning path ca nhan va ly do tung muc. | `learning_paths`, `learning_path_items`, `ai_generation_logs`. | `ai-personalization` |
| Sinh lo trinh theo lop | Teacher | Lop hoc, danh sach hoc vien, course trong lop, muc tieu lop. | Tao baseline path cho ca lop. | Group learning path. | `learning_paths` owner type class/group. | `ai-personalization` |
| Dieu chinh lo trinh ca nhan | Student | Path hien tai, item muon them/bo/doi thu tu, ly do. | Goi y tac dong hoac xac nhan thay doi. | Path version moi. | Path version, audit reason. | `ai-personalization` |
| Teacher dieu chinh lo trinh lop | Teacher | Group path, lop phu trach, noi dung can sua. | Goi y dieu chinh theo muc tieu giang day. | Group path version moi. | Path version, teacher action log. | `ai-personalization` |
| Khoi phuc lo trinh mac dinh | Admin | Path hien tai, baseline generated path. | Khong bat buoc goi AI; dung snapshot da luu. | Path quay ve baseline. | Baseline snapshot, admin audit. | `ai-personalization` |
| AI Tutor general | Student | Cau hoi nguoi hoc, lich su hoi thoai ngan. | Tra loi hoc tap tong quat, khong gan voi bai cu the. | Message tra loi. | Conversation summary, message metadata, generation log. | `ai-personalization` |
| AI Tutor theo bai hoc | Student | Cau hoi, lesson/content id, noi dung bai hoc, tien do user. | Tra loi trong pham vi bai hoc, khong dung noi dung ngoai context. | Message tra loi kem trich ngu canh noi bo neu can. | Conversation, context reference, generation log. | `ai-personalization` |
| Tao bai tu luyen theo diem yeu | Student | Weak tags, level, lich su bai sai, content dang hoc. | Sinh cau hoi/bai tap phu hop diem yeu. | Practice set ca nhan. | Generated practice, question refs, generation log. | `ai-personalization` |
| Goi y giao an | Teacher | Chu de, lop, course, muc tieu buoi hoc, thoi luong. | Sinh outline giao an va hoat dong day hoc. | Draft lesson plan. | Draft output, generation log. | `teacher-ai-tools` trong `ai-personalization` |
| Goi y cau hoi/bai tap | Teacher | Noi dung bai hoc, muc tieu, do kho, dang cau hoi. | Sinh cau hoi de giao bai/kiem tra. | Draft questions. | Draft output, generation log. | `teacher-ai-tools` trong `ai-personalization` |
| Cham diem tu luan | Student, Teacher | Bai lam, rubric, dap an mau neu co. | Cham diem theo rubric va giai thich. | Score, feedback, loi sai. | Assessment result, grading audit, generation log. | `assessments-grading` |
| Giai thich loi sai | Student | Cau sai, dap an cua hoc sinh, dap an dung, lesson context. | Tao giai thich ngan gon va goi y hoc lai. | Feedback ca nhan. | Feedback record, weak tag signal. | `assessments-grading` |
| Gan weak tags | System, Teacher | Ket qua lam bai, feedback, content tags. | Phan loai diem yeu theo chu de/ky nang. | Weak tags cap nhat. | Weak knowledge records. | `learning-analytics` |
| Thong ke chi phi AI | Admin | Generation logs, token input/output, provider, model. | Khong bat buoc goi AI; aggregate logs. | Bao cao chi phi/usage. | `ai_generation_logs`, daily aggregates. | `platform-admin` |
| Gioi han quota AI | System | User package, feature code, period, usage count. | Khong goi AI neu vuot quota. | Allow/deny AI request. | Quota usage. | `service-packages` |

## Luong goi AI chuan

1. Controller nhan request da validate va da qua RBAC.
2. Service kiem tra owner/permission va quota neu feature da bat package.
3. Context builder lay du lieu noi bo can thiet: user, class, course, lesson, assessment, weak tags.
4. AI orchestration service tao prompt theo `purpose`, chon provider/model tu config.
5. Goi provider AI va normalize output ve schema noi bo.
6. Luu output/domain record neu can: learning path, practice, feedback, draft.
7. Ghi `ai_generation_logs`: user, purpose, provider, model, token/cost metadata, context reference, output reference.
8. Tra DTO da whitelist cho frontend.

## Du lieu toi thieu can thiet

| Data | Dung cho | Trang thai hien tai |
| --- | --- | --- |
| Authenticated user, role, lock status | Tat ca luong AI. | Da co trong `identity-access`. |
| User profile | Ca nhan hoa output, avatar/hien thi. | Dang co trong `user-profiles`. |
| Course/lesson content | Tutor theo bai, giao an, bai luyen tap. | Dang in-progress theo course/class docs. |
| Assessment result | Lo trinh, weak tags, cham diem/giai thich. | `planned`. |
| Weak tags | Bai tu luyen va canh bao hoc tap. | `planned`. |
| AI generation log | Audit, chi phi, quota, debug output. | `planned`. |
| Package/quota | Gioi han AI theo goi. | `planned-later`. |

## Nguyen tac an toan

- Khong dua password, token, session hash, OTP hoac secret vao prompt.
- Prompt chi gom context can thiet cho `purpose`.
- Moi output AI dung trong hoc tap phai duoc luu kem `purpose`, model, context reference va output reference.
- Draft cho Teacher khong tu dong publish thanh noi dung chinh neu chua co buoc duyet.
- AI Tutor theo bai hoc khong tra loi ngoai context neu request yeu cau bam sat lesson.
- Admin xem duoc chi phi/log tong quan, nhung khong can xem noi dung rieng tu day du neu khong co rule ro.

## Thu tu trien khai de nghi

1. Tao `ai-generation-logs` va AI orchestration service dung chung.
2. Lam AI Tutor general vi it phu thuoc content model.
3. Lam AI Tutor theo lesson sau khi content/lesson on dinh.
4. Lam learning path ca nhan sau khi co placement/assessment result.
5. Lam bai tu luyen AI sau khi co weak tags.
6. Lam teacher AI tools khi course/class authoring on dinh.
7. Them platform admin aggregate chi phi/log.
8. Them quota theo package sau cung.

## Trang thai ket luan

AI hien tai moi nam o muc ke hoach san pham va module plan. Backend da co nen identity/profile de lam nen, nhung chua co lop goi provider AI, chua co schema log, chua co conversation history, chua co learning path, chua co AI practice va chua co quota AI.
