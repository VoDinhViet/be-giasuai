# Course Content Progress

## Tong quan

Trang thai tong quan: `in-progress`

Da co `courses` module, schema course/section/lesson/lesson part, public endpoints doc noi dung, Admin CRUD co ban cho course va dong bo curriculum. Frontend da co trang danh sach, chi tiet khoa hoc va man hinh hoc bai theo lesson parts. Cac phan simulator runtime, teacher authoring va admin moderation chua thay nen tang ro.

## Chi tiet

| Chuc nang | Nguon Excel | Status | Bang chung/Ghi chu | Viec tiep theo |
| --- | --- | --- | --- | --- |
| Tim kiem khoa hoc cho Student | Dong 11 - Tim kiem | `done` | `GET /courses` co keyword search, filter `isPublished`, sort va test/build; FE `/manage/courses`. | Tach published-only public scope khi co API quan tri rieng. |
| Tim kiem khoa hoc/bai hoc cho Teacher | Dong 11 - Teacher | `planned` | Course search co nen, lesson search rieng chua ro. | Them scope search theo teacher/lop. |
| Tim kiem toan he thong cho Admin | Dong 11 - Admin | `planned` | Chua thay global search. | Thiet ke search service/routing. |
| Doc ly thuyet trong module | Dong 12 - Hoc tap trong Module | `done` | `GET /courses/:courseId/sections`, `GET /courses/:courseId/lessons/:lessonId`, `GET /courses/:courseId/curriculum`; FE `/courses/:courseId/learn/:lessonId`. | Mo rong content type khi them simulator/quiz. |
| Tuong tac simulator | Dong 12 - Student | `planned` | Chua thay simulator schema/logic. | Xac dinh payload simulator va runtime. |
| Bai tap gan voi bai hoc | Dong 12 - Student | `planned` | Lesson parts co the chua du cho bai tap cham diem. | Dong bo voi `assessments-grading`. |
| AI ho tro soan cau hoi nhanh | Dong 12 - Teacher | `planned` | Chua thay AI authoring. | Chuyen sang `ai-personalization` khi trien khai. |
| Admin duyet noi dung giao vien | Dong 12 - Admin | `planned` | Chua thay moderation schema/status. | Them workflow duyet noi dung. |
| Quan ly course/curriculum co ban | Dong 12 - Admin | `in-progress` | Backend co `POST/PATCH/DELETE /courses`, `PUT /courses/:courseId/curriculum`; FE da co `/manage/courses/create`, delete va xem chi tiet. | Noi lai UI sua course va curriculum editor theo schema moi. |

## Phu thuoc

- `learning-delivery` cho progress/unlock.
- `assessments-grading` cho bai tap co diem.
- `ai-personalization` cho AI soan cau hoi.
