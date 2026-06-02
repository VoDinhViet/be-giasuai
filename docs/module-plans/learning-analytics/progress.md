# Learning Analytics Progress

## Tong quan

Trang thai tong quan: `planned`

Da co mot so endpoint stats o `users`/`classes`, nhung chua co analytics hoc tap, weak tags, study time hay stuck alerts.

## Chi tiet

| Chuc nang | Nguon Excel | Status | Bang chung/Ghi chu | Viec tiep theo |
| --- | --- | --- | --- | --- |
| Dashboard tien do Student | Dong 8 - Tien do hoc tap | `planned` | Chua co learning dashboard user. | Can progress/history data tu `learning-delivery`. |
| Gio hoc va module da hoan thanh | Dong 8 - Student | `planned` | Chua thay study time/completion schema. | Tao metric/source events. |
| Bieu do tien bo theo thoi gian | Dong 8 - Student | `planned` | Chua co time-series metric. | Tao snapshot hoac query aggregation. |
| Teacher xem tien do hoc sinh | Dong 8 - Teacher | `planned` | `classes` co stats endpoint, nhung chua ro progress hoc tap. | Bo sung progress theo class/student. |
| Phan tich diem manh/yeu | Dong 8 va 10 | `planned` | Chua co weak tag schema. | Tao weak knowledge tag. |
| Admin dem nguoi dung/khoa hoc | Dong 8 - Admin | `in-progress` | `GET /users/stats` va class stats ton tai; course count can xac minh. | Tong hop vao admin dashboard. |
| Tracking diem yeu ca nhan | Dong 10 - Student | `planned` | Chua co weak tag DB. | Luu weak tags voi visibility personal. |
| Tracking diem yeu lop | Dong 10 - Student/Teacher | `planned` | Chua co visibility class. | Luu weak tags gan class/context. |
| Bao cao module kho | Dong 10 - Admin | `planned` | Chua co aggregate difficult modules. | Aggregate weak tags/failed attempts. |
| Canh bao hoc sinh bi ket | Dong 21 - Teacher | `planned` | Chua co alert rule. | Tao stuck alert based on repeated failure/no progress. |

## Phu thuoc

- `learning-delivery` cho progress/history.
- `assessments-grading` cho score/weak signals.
- `classroom-management` cho class scope.
