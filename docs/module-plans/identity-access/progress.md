# Identity Access Progress

## Tong quan

Trang thai tong quan: `in-progress`

Da co nen tang `auth` va `users`, nhung Excel yeu cau them OTP, reset mat khau, xac thuc Teacher va role/permission day du hon.

## Chi tiet

| Chuc nang | Nguon Excel | Status | Bang chung/Ghi chu | Viec tiep theo |
| --- | --- | --- | --- | --- |
| Dang nhap bang email | Dong 4 - Dang nhap / Dang ky | `done` | `src/api/auth/auth.controller.ts` co `POST /auth/login`. | Duy tri tests va spec khi mo rong OTP. |
| Dang ky email/mat khau | Dong 4 - Dang nhap / Dang ky | `in-progress` | `POST /auth/register` da ton tai. | Them OTP xac thuc, chong spam mail. |
| OTP dang ky Student | Dong 4 - Student | `planned` | Chua thay schema/service OTP. | Thiet ke OTP challenge va verify endpoint. |
| OTP dang ky Teacher | Dong 4 - Teacher | `planned` | Chua thay schema/service OTP. | Dung chung OTP purpose voi register. |
| Admin xac thuc Teacher | Dong 4 - Teacher | `planned` | Chua thay teacher verification status. | Them trang thai pending/verified cho Teacher. |
| Reset mat khau bang OTP | Dong 5 - Reset mat khau | `planned` | Chua thay endpoint reset password. | Them request reset va confirm reset. |
| Khoa/mo khoa tai khoan | Dong 6 - Khoa tai khoan | `in-progress` | `src/api/users/users.controller.ts` co `PATCH /users/:userId/lock`. | Xac nhan rule role, audit va response. |
| Role/permission nen tang | Dong 9 - Quyen | `in-progress` | Code hien co dung enum role; spec cu co RBAC permission. | Chuan hoa permission neu can ngoai role enum. |
| Logout/session | Yeu cau nen tang dang nhap | `in-progress` | `POST /auth/logout` da ton tai. | Xac nhan session store/refresh token lifecycle. |

## Khong bao gom trong module nay

- Goi `casual/plus/pro`: xem `service-packages`.
- Profile/avatar: xem `user-profiles`.
