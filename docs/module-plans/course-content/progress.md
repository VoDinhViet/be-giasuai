# Course Content Progress

## Tong quan

Trang thai tong quan: `in-progress`

Da co `courses` module, schema course/section/lesson/lesson part va public endpoints doc noi dung. Cac phan simulator, teacher authoring va admin moderation chua thay nen tang ro.

## Chi tiet

| Chuc nang | Nguon Excel | Status | Bang chung/Ghi chu | Viec tiep theo |
| --- | --- | --- | --- | --- |
| Tim kiem khoa hoc cho Student | Dong 11 - Tim kiem | `in-progress` | `GET /courses` co keyword search trong spec/code. | Xac nhan filter/sort va test. |
| Tim kiem khoa hoc/bai hoc cho Teacher | Dong 11 - Teacher | `planned` | Course search co nen, lesson search rieng chua ro. | Them scope search theo teacher/lop. |
| Tim kiem toan he thong cho Admin | Dong 11 - Admin | `planned` | Chua thay global search. | Thiet ke search service/routing. |
| Doc ly thuyet trong module | Dong 12 - Hoc tap trong Module | `in-progress` | Course lesson parts da co schema/endpoint. | Chuan hoa content type ly thuyet. |
| Tuong tac simulator | Dong 12 - Student | `planned` | Chua thay simulator schema/logic. | Xac dinh payload simulator va runtime. |
| Bai tap gan voi bai hoc | Dong 12 - Student | `planned` | Lesson parts co the chua du cho bai tap cham diem. | Dong bo voi `assessments-grading`. |
| AI ho tro soan cau hoi nhanh | Dong 12 - Teacher | `planned` | Chua thay AI authoring. | Chuyen sang `ai-personalization` khi trien khai. |
| Admin duyet noi dung giao vien | Dong 12 - Admin | `planned` | Chua thay moderation schema/status. | Them workflow duyet noi dung. |

## Phu thuoc

- `learning-delivery` cho progress/unlock.
- `assessments-grading` cho bai tap co diem.
- `ai-personalization` cho AI soan cau hoi.
