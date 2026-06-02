# User Profiles Progress

## Tong quan

Trang thai tong quan: `in-progress`

Da co `users` module va endpoint lay thong tin ca nhan, nhung chua thay endpoint cap nhat profile/avatar rieng.

## Chi tiet

| Chuc nang | Nguon Excel | Status | Bang chung/Ghi chu | Viec tiep theo |
| --- | --- | --- | --- | --- |
| Xem thong tin ca nhan | Dong 7 - Quan ly thong tin ca nhan | `in-progress` | `GET /users/me` da ton tai. | Xac nhan DTO, response va spec. |
| Sua ten/thong tin co ban | Dong 7 - Student | `planned` | Chua thay endpoint update current profile. | Them request DTO va update service. |
| Quan ly avatar | Dong 7 - Student | `planned` | Co `files` module nhung chua thay avatar flow. | Dinh nghia upload/link avatar. |
| Admin xem ho so nguoi dung | Dong 7 - Admin | `in-progress` | `GET /users` va admin user routes da ton tai. | Can chi tiet hoa activity summary. |
| Hoat dong co ban cua nguoi dung | Dong 7 - Admin | `planned` | Chua thay audit/activity schema. | Xac dinh cac su kien can ghi nhan. |

## Phu thuoc

- `identity-access` cho user da xac thuc.
- `files` cho avatar neu dung upload local.
