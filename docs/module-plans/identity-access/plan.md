# Identity Access Plan

## Muc tieu

Hoan thien nen tang tai khoan va truy cap sao cho cac module hoc tap, lop hoc va AI co the dua vao mot nguoi dung da xac thuc, co role ro rang va co trang thai tai khoan hop le.

## Ke hoach backend

- Mo rong `auth` de bao phu OTP dang ky, OTP reset mat khau, reset mat khau va session/logout.
- Mo rong `users` hoac tach service quan tri tai khoan de admin khoa/mo khoa tai khoan va xac thuc Teacher.
- Duy tri JWT/session hien co, khong dua logic goi dich vu vao guard trong giai doan nay.
- Chuan hoa trang thai tai khoan can toi thieu cac concept: active, locked, pending teacher verification.
- Tat ca loi dang nhap/reset phai khong lam lo mat email, token hoac password hash.

## API/module de xuat

- `auth`: login, register, logout, request OTP, verify OTP, request password reset, confirm password reset.
- `users`: admin list users, lock/unlock user, verify teacher account.
- `sessions`: neu can quan ly refresh/session chi tiet hon logout hien tai.

## Data concept

- User identity: email, username, full name, password hash, role, lock status.
- OTP challenge: purpose, target email/user, hashed code, expires at, consumed at, attempt count.
- Teacher verification: status, verified by, verified at, optional rejection reason.

## RBAC

- Public: login, register, request/verify OTP, reset password.
- Authenticated user: logout, xem trang thai cua minh.
- Admin: list accounts, lock/unlock, verify teacher.

## Verification

- Unit/service tests cho login thanh cong, invalid credentials, locked user, register duplicate email.
- Tests cho OTP het han, OTP sai qua so lan, OTP da dung.
- Tests cho reset password khong lam lo email co ton tai hay khong.
- Tests cho admin lock/unlock va teacher verification.
