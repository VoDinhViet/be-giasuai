# User Profiles Plan

## Muc tieu

Tach ro thong tin ho so khoi identity de viec cap nhat profile khong anh huong truc tiep den luong dang nhap, role va session.

## Ke hoach backend

- Mo rong `users` de ho tro `GET /users/me` va update profile cua nguoi dung hien tai.
- Ho tro avatar thong qua `files` neu module file hien co du dieu kien, hoac luu URL sau khi upload thanh cong.
- Admin co the xem danh sach/chi tiet nguoi dung kem hoat dong co ban.
- Khong tra ve password hash, token, OTP hoac thong tin bao mat.

## API/module de xuat

- `users`: get current profile, update current profile, admin get user detail/list.
- `files`: upload avatar neu can file local/static upload.
- Co the tach `profiles` sau neu profile phinh to voi nhieu truong rieng Student/Teacher.

## Data concept

- Profile basics: full name, avatar URL, optional display fields.
- Admin activity summary: created at, updated at, lock status, and role.

## RBAC

- Authenticated user: xem/cap nhat profile cua minh.
- Admin: xem profile va hoat dong co ban cua tat ca nguoi dung.

## Verification

- Tests cho user cap nhat profile cua minh.
- Tests khong cho user sua field bao mat nhu role, password, isLocked qua profile endpoint.
- Tests cho admin xem danh sach/chi tiet nguoi dung.
- Tests mapping response DTO khong lo password hash.
