# Identity Access Progress

## Tong quan

Trang thai tong quan: `in-progress`

Backend identity-access da hoan thien cac luong cot loi khong can migration moi: OTP dang ky/reset mat khau qua cache, session/refresh token, khoa tai khoan va Admin xac thuc Teacher. Con thieu email delivery va role/permission chi tiet ngoai enum role.

## Chi tiet

| Chuc nang | Nguon Excel | Status | Bang chung/Ghi chu | Viec tiep theo |
| --- | --- | --- | --- | --- |
| Dang nhap bang email | Dong 4 - Dang nhap / Dang ky | `done` | `POST /auth/login` validates credentials and rejects `isLocked` users. | Add email delivery messaging for unverified/pending states in FE. |
| Dang ky email/mat khau | Dong 4 - Dang nhap / Dang ky | `done` | `POST /auth/register` creates locked Student/Teacher accounts and rejects Admin self-registration. | Integrate email sending for OTP delivery. |
| OTP dang ky Student | Dong 4 - Student | `done` | `POST /auth/register/otp` and `POST /auth/register/verify-otp`; Student is unlocked after valid OTP. | Add real email provider. |
| OTP dang ky Teacher | Dong 4 - Teacher | `done` | Teacher uses the same registration OTP flow and remains locked after OTP. | Add dedicated teacher verification schema when migrations are clean. |
| Admin xac thuc Teacher | Dong 4 - Teacher | `done` | `PATCH /users/:userId/verify-teacher` unlocks Teacher accounts. | Add audit fields when schema migration is available. |
| Reset mat khau bang OTP | Dong 5 - Reset mat khau | `done` | `POST /auth/password-reset/otp` and `POST /auth/password-reset`; reset deletes active sessions. | Integrate email sending for OTP delivery. |
| Khoa/mo khoa tai khoan | Dong 6 - Khoa tai khoan | `done` | `PATCH /users/:userId/lock` validates body, checks user exists, and deletes sessions when locking. | Add audit fields when schema migration is available. |
| Role/permission nen tang | Dong 9 - Quyen | `in-progress` | Code uses role enum and Admin-only routes for account management. | Permission-code/RBAC detail and service packages remain future work. |
| Logout/session | Yeu cau nen tang dang nhap | `done` | `POST /auth/logout`, `POST /auth/refresh-token`, session hash rotation, access-token session validation. | Consider session listing/revoke-all if product needs it. |

## Khong bao gom trong module nay

- Goi `casual/plus/pro`: xem `service-packages`.
- Profile/avatar: xem `user-profiles`.
