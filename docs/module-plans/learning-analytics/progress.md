# Learning Analytics Progress

## Tong quan

Trang thai tong quan: `planned`

Da co mot so endpoint stats o `users`, nhung chua co analytics hoc tap, weak tags, study time hay stuck alerts.

## Chi tiet

| Chuc nang | Nguon Excel | Status | Bang chung/Ghi chu | Viec tiep theo |
| --- | --- | --- | --- | --- |
| Dashboard tien do Student | Dong 8 - Tien do hoc tap | `planned` | Chua co learning dashboard user. | Can progress/history data tu `learning-delivery`. |
| Gio hoc va noi dung da hoan thanh | Dong 8 - Student | `planned` | Chua thay study time/completion schema. | Tao metric/source events. |
| Bieu do tien bo theo thoi gian | Dong 8 - Student | `planned` | Chua co time-series metric. | Tao snapshot hoac query aggregation. |
| Teacher xem tien do hoc sinh | Dong 8 - Teacher | `planned` | Chua co scope nhom hoc sau khi go module class. | Bo sung progress theo scope moi khi co data model. |
| Phan tich diem manh/yeu | Dong 8 va 10 | `planned` | Chua co weak tag schema. | Tao weak knowledge tag. |
| Admin dem nguoi dung | Dong 8 - Admin | `in-progress` | `GET /users/stats` ton tai; course/class stats da bi go. | Tong hop vao admin dashboard. |
| Tracking diem yeu ca nhan | Dong 10 - Student | `planned` | Chua co weak tag DB. | Luu weak tags voi visibility personal. |
| Tracking diem yeu nhom hoc | Dong 10 - Student/Teacher | `planned` | Chua co visibility group. | Luu weak tags gan group/context khi co data model. |
| Bao cao noi dung kho | Dong 10 - Admin | `planned` | Chua co aggregate difficult content. | Aggregate weak tags/failed attempts. |
| Canh bao hoc sinh bi ket | Dong 21 - Teacher | `planned` | Chua co alert rule. | Tao stuck alert based on repeated failure/no progress. |

## Phu thuoc

- `learning-delivery` cho progress/history.
- `assessments-grading` cho score/weak signals.
- Scope nhom hoc can data model moi neu khoi phuc tinh nang lop hoc.
