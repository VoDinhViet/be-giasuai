# Classroom Management Progress

## Tong quan

Trang thai tong quan: `in-progress`

Da co `classes` module, schemas `classes`, `class_registrations`, `class_courses` va nhieu endpoint lop hoc. Con thieu phe duyet hoc vien ro rang va trao doi truc tiep.

## Chi tiet

| Chuc nang | Nguon Excel | Status | Bang chung/Ghi chu | Viec tiep theo |
| --- | --- | --- | --- | --- |
| Tao lop | Dong 20 - Quan ly Lop hoc | `in-progress` | `POST /classes` ton tai. | Xac minh role/owner rule va tests. |
| Tham gia lop qua code/moi | Dong 20 - Student | `in-progress` | `POST /classes/join/:inviteCode` ton tai. | Xac minh registration status/phe duyet. |
| Teacher chon/gan khoa hoc co san | Dong 20 - Teacher | `in-progress` | `POST /classes/:classId/courses/:courseId` ton tai. | Xac minh owner permission. |
| Quan ly danh sach lop | Dong 20 - Teacher/Admin | `in-progress` | `GET /classes`, `GET /classes/:classId` ton tai. | Them filter/scope neu thieu. |
| Phe duyet hoc vien | Dong 20 - Teacher | `planned` | Registration status enum co active/completed/dropped, chua thay pending approval. | Them pending/approve/reject flow. |
| Quan ly tien do hoc sinh trong lop | Dong 20 - Teacher | `planned` | Class stats co nen, analytics hoc tap chua ro. | Lay tu `learning-analytics`. |
| Admin quan ly toan bo lop | Dong 20 - Admin | `in-progress` | Roles ADMIN duoc dung tren class endpoints. | Xac minh service scope. |
| Student trao doi truc tiep voi GV | Dong 21 - Student | `planned` | Chua thay message/chat module. | Thiet ke class messages. |
| Teacher nhan canh bao bi ket | Dong 21 - Teacher | `planned` | Chuyen sang `learning-analytics`. | Ket noi alert voi lop. |

## Phu thuoc

- `course-content` cho khoa hoc gan vao lop.
- `learning-analytics` cho tien do va stuck alerts.
- `platform-admin` cho tranh chap.
