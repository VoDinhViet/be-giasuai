# User Profiles Progress

## Tong quan

Trang thai tong quan: `in-progress`

Backend da co doc/cap nhat ho so ca nhan co ban, Admin xem chi tiet nguoi dung, va upload file cho avatar handoff. Frontend da co trang ho so ca nhan va trang Admin xem chi tiet nguoi dung. Avatar URL chua persist vao user vi can quyet dinh schema/migration rieng.

## Chi tiet

| Chuc nang | Nguon Excel | Status | Bang chung/Ghi chu | Viec tiep theo |
| --- | --- | --- | --- | --- |
| Xem thong tin ca nhan | Dong 7 - Quan ly thong tin ca nhan | `done` | `GET /users/me` tra ve `UserResDto`; FE route `/manage/profile`. | Mo rong response khi co truong profile moi. |
| Sua ten/thong tin co ban | Dong 7 - Student | `done` | `PATCH /users/me` cap nhat `fullName` theo whitelist; FE action `updateCurrentUser`. | Bo sung truong khac khi schema da co. |
| Quan ly avatar | Dong 7 - Student | `in-progress` | `POST /files/upload` cho phep `STUDENT` upload de lay URL. | Them `avatarUrl` vao schema/DTO va endpoint persist sau khi migration tree sach. |
| Admin xem ho so nguoi dung | Dong 7 - Admin | `done` | `GET /users`, `GET /users/:userId`, `GET /users/stats`; FE route `/manage/users/[userId]`. | Can chi tiet hoa activity summary. |
| Hoat dong co ban cua nguoi dung | Dong 7 - Admin | `planned` | Chua thay audit/activity schema. | Xac dinh cac su kien can ghi nhan. |

## Phu thuoc

- `identity-access` cho user da xac thuc.
- `files` cho avatar neu dung upload local.
